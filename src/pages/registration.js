import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer";
import { showToast } from "@/toastHelper";
import jwt from 'jsonwebtoken';
import {BASE_API_URL, weatherIconMap} from '@/config';
import React, { useEffect, useState } from 'react';
import {useRouter} from "next/router";
import {
    convertTimestampToDate, formatDate, formatDateToSerbian, formatReturnDate,
    formatStringFromDate,
    getFirstDayOfNextMonth,
    getFirstDayOfPreviousTwoMonths
} from "@/dateHelper";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DataTableComponent from "@/components/DataTable/DataTable";
import windBlackIcon from "@/resources/images/windBlack.svg";

export default function Registration() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [domLoaded, setDomLoaded] = useState(false);
    const [dataTableData, setDataTableData] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [webSite, setWebSiteName] = useState('');
    const [userWebSites, setUserWebSites] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
    }, []);

    const [filters, setFilters] = useState({
        model_name: 'Day',
        name: null,
        min_air_pressure: null,
        max_air_pressure: null,
        min_humidity: null,
        max_humidity: null,
        min_temperature: null,
        max_temperature: null,
        // min_particular_matter_1: null,
        // max_particular_matter_1: null,
        min_particular_matter_25_ranking: null,
        max_particular_matter_25_ranking: null,
        min_particular_matter_25_concentration: null,
        max_particular_matter_25_concentration: null,
        min_particular_matter_10_concentration: null,
        max_particular_matter_10_concentration: null,
        min_particular_matter_10_ranking: null,
        max_particular_matter_10_ranking: null,
        start_date: getFirstDayOfPreviousTwoMonths(),
        end_date: getFirstDayOfNextMonth(),
    });

    const handleChange = (event) => {
        const {name, value} = event.target;
        setFilters((prevFilters) => ({...prevFilters, [name]: value}));
        showToast("Podatci u tabeli su se promenili", "info")
    };

    const handleChangeDate = (name, date) => {
        setFilters((prevFilters) => ({...prevFilters, [name]: formatStringFromDate(date)}));
        showToast("Podatci u tabeli su se promenili", "info")
    };

    const getUserWebsites = () => {
        //get user websites
        fetch(BASE_API_URL + '/website/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            }
        })
            .then(response => response.json())
            .then(data => {
                setUserWebSites(data);
            });
    }

    useEffect(() => {
        getUserWebsites();
    }, []);

    useEffect(() => {
        //change data on filter change
        fetch(BASE_API_URL + '/AQI/get/user-favorites/' + filters.model_name, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            }
        })
            .then(response => response.json())
            .then(data => {
                //filter data on the front-end for the favorites retrieved
                const filteredData = data.filter(item => {
                    let valid =
                        (!filters.min_air_pressure || item.air_pressure >= filters.min_air_pressure) &&
                        (!filters.max_air_pressure || item.air_pressure <= filters.max_air_pressure) &&
                        (!filters.min_humidity || item.humidity >= filters.min_humidity) &&
                        (!filters.max_humidity || item.humidity <= filters.max_humidity) &&
                        (!filters.min_temperature || item.temperature >= filters.min_temperature) &&
                        (!filters.max_temperature || item.temperature <= filters.max_temperature) &&
                        (!filters.min_particular_matter_25_ranking || item.particular_matter_25.aqi_us_ranking >= filters.min_particular_matter_25_ranking) &&
                        (!filters.max_particular_matter_25_ranking || item.particular_matter_25.aqi_us_ranking <= filters.max_particular_matter_25_ranking) &&
                        (!filters.min_particular_matter_25_concentration || item.particular_matter_25.concentration >= filters.min_particular_matter_25_concentration) &&
                        (!filters.max_particular_matter_25_concentration || item.particular_matter_25.concentration <= filters.max_particular_matter_25_concentration) &&
                        (!filters.min_particular_matter_10_concentration || item.particular_matter_10.concentration >= filters.min_particular_matter_10_concentration) &&
                        (!filters.max_particular_matter_10_concentration || item.particular_matter_10.concentration <= filters.max_particular_matter_10_concentration) &&
                        (!filters.min_particular_matter_10_ranking || item.particular_matter_10.aqi_us_ranking >= filters.min_particular_matter_10_ranking) &&
                        (!filters.max_particular_matter_10_ranking || item.particular_matter_10.aqi_us_ranking <= filters.max_particular_matter_10_ranking) &&
                        (!filters.start_date || formatReturnDate(convertTimestampToDate(item.time_stamp)) >= formatReturnDate(filters.start_date)) &&
                        (!filters.end_date || formatReturnDate(convertTimestampToDate(item.time_stamp)) <= formatReturnDate(filters.end_date));
                    return valid;
                });
                setDataTableData(filteredData);
            });
    }, [filters]);

    //load datatable only on client side because of hydration errors
    useEffect(() => {
        setDomLoaded(true);
    }, []);

    //load all stations grouped
    useEffect(() => {
        const url = new URL(BASE_API_URL + '/AQI/get/all');
        url.searchParams.append('generateCSV', 'false');
        url.searchParams.append('model_name', 'Hour');

        fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("login_token")
            }
        })
            .then(response => response.json())
            .then(data => {
                const jsonData = data;

                const groupedData = jsonData.reduce((groups, item) => {
                    const groupName = item.name;
                    if (!groups[groupName]) {
                        groups[groupName] = [];
                    }
                    groups[groupName].push(item);
                    return groups;
                }, {});

                const latestData = Object.values(groupedData).map((group) => {
                    const latestItem = group.reduce((latest, item) => {
                        if (!latest || item.time_stamp > latest.time_stamp) {
                            return item;
                        }
                        return latest;
                    }, null);
                    return latestItem;
                });

                setSensors(latestData);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);


    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleWebSiteNameChange = (event) => {
        const inputValue = event.target.value;

        // Remove "https://www." and "www." from the input value
        const cleanedValue = inputValue.replace(/^(https?:\/\/)?(www\.)?/i, '');

        setWebSiteName(cleanedValue);
    };

    const handleGoogleAuth = (event) => {
            const url = `${BASE_API_URL}/auth/google`;
            const width = 800;
            const height = 600;
            const options = `width=${width},height=${height},resizable,scrollbars=yes,status=1`;
            window.open(url, '_blank', options);
    };

    const handleSubmitRegister = (event) => {
        event.preventDefault();
        const data = {
            name: name,
            email: email,
            password: password
        };

        fetch(`${BASE_API_URL}/rauth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok) {
                    response.text().then((text) => {
                        showToast('Registracija uspešna!<br>' + text);
                    });
                } else {
                    showToast('Registracija neuspešna!', 'error');
                }
            })
            .catch((error) => {
                showToast('Error:' + error, 'error');
            });
    };

    const handleAddWebsite = (event) => {
        event.preventDefault();
        userWebSites.push(webSite);
        const data = {
            websites: userWebSites,
        };

        fetch(`${BASE_API_URL}/website/add`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok) {
                    response.text().then((text) => {
                        getUserWebsites();
                        showToast('Web sajt uspešno dodat!');
                    });
                } else {
                    showToast('Web sajt dodavanje neuspešno!', 'error');
                }
            })
            .catch((error) => {
                showToast('Error:' + error, 'error');
            });
    };

    const handleDeleteWebsite = (event) => {
        event.preventDefault();
        const updatedUserWebSites = userWebSites.filter(site => site !== event.target.value);
        const data = {
            websites: updatedUserWebSites,
        };

        fetch(`${BASE_API_URL}/website/add`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok) {
                    response.text().then((text) => {
                        getUserWebsites();
                        showToast('Web sajt uspešno izbrisan!');
                    });
                } else {
                    showToast('Web sajt brisanje neuspešno!', 'error');
                }
            })
            .catch((error) => {
                showToast('Error:' + error, 'error');
            });
    };


    const handleLogout = (event) => {
        try {
            localStorage.removeItem("user");
            localStorage.removeItem("login_token");
            showToast('Uspešna odjava!<br>Prebacićemo vas na početnu stranicu');
            setTimeout(function (){
                window.location.href = '/';
            },3000)

        } catch (error) {
            showToast('Error u odjavi:' + error.message, 'error');
            return null;
        }
    };

     const decodeJwtToken = (token) => {
        try {
            const decoded = jwt.decode(token);
            return decoded;
        } catch (error) {
            showToast('Error decoding JWT token:' + error.message, 'error');
            return null;
        }
    };

    const handleSubmitLogin = (event) => {
        event.preventDefault();
        const data = {
            email: email,
            password: password
        };

        fetch(`${BASE_API_URL}/rauth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok) {
                    response.json().then((json) => {
                        const {token} = json; // Access the 'token' property from the JSON response
                        const decodedToken = decodeJwtToken(token);
                        localStorage.setItem('login_token', token); // Save the token to localStorage with the key 'login_token'
                        localStorage.setItem('user', JSON.stringify(decodedToken)); // Save the token to localStorage with the key 'login_token'
                        showToast('Login uspešan!<br>Prebacićemo vas na početnu stranicu');
                        setTimeout(function (){
                            window.location.href = '/';
                        },3000)
                    });
                } else {
                    showToast('Login netačan!', 'error');
                    // Handle login failure
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                // Handle network error
            });
    };




    return (
        <>
            <Navbar/>
            {!user ? (<>
            <p className='text-2xl mt-5 text-center font-bold'>PRIJAVA</p>
            <div className='flex justify-center'>
                <div className="w-full max-w-lg mt-4">
                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmitLogin}>
                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="email" value={email} onChange={handleEmailChange}  name='email' type="email" placeholder="Email" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="password" value={password} onChange={handlePasswordChange}  type="password"  placeholder="******************" />
                        </div>
                        <div className="flex items-center sm:justify-between justify-center flex-wrap">
                            <button
                                className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 my-2 rounded focus:outline-none focus:shadow-outline"
                                type="submit">
                                Prijavi se
                            </button>
                            {/* Google auth login button */}
                            <div className="px-6 sm:px-0 max-w-sm">
                                <button type="button" onClick={handleGoogleAuth}
                                        className="text-white w-full  bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between dark:focus:ring-[#4285F4]/55">
                                    <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false"
                                         data-prefix="fab" data-icon="google" role="img"
                                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor"
                                              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Prijavi se sa Google
                                    <div></div>
                                </button>
                            </div>
                            <a className="inline-block pt-5 align-baseline font-bold text-md text-green-600 hover:text-green-400"
                               href="#">
                                Zaboravili ste lozinku?
                            </a>
                        </div>
                    </form>
                </div>
            </div>


            <hr className='my-4'/>
            <p className='text-2xl text-center text-gray-400'>ILI</p>
            <hr className='my-4'/>

            <p className='text-2xl mt-5 text-center font-bold'>REGISTRACIJA</p>
            <div className='flex justify-center'>
                <div className="w-full max-w-lg mt-4">
                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmitRegister}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                Puno Ime
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="name" value={name} onChange={handleNameChange} name='name' type="text" placeholder="Ime" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="email" value={email} onChange={handleEmailChange} name='email' type="email" placeholder="Email" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                name='password' value={password} onChange={handlePasswordChange} id="password" type="password" placeholder="******************" />
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit">
                                Registruj se
                            </button>
                        </div>
                    </form>
                </div>
            </div></>
                ) : (
                <><div>
                    <div><h2 className="text-2xl mt-5 text-center font-bold">Vaši Favoriti</h2></div>
                    <div className="filtersDiv">
                        {!isExpanded && (<h2 className="text-center h2ToOpenFilters" onClick={function (){setIsExpanded(true)}}>Filteri</h2>)}
                        {isExpanded && ( <div className="filtersInnerDiv">
                            <div className="h2FilterClose"><h2>Filteri</h2><button className="closeButton" onClick={function (){setIsExpanded(false)}}>&#10006;</button></div>
                            <div className="filterSingle">
                                <label>Tip podataka:</label>
                                <div className="select"><select name="model_name" value={filters.model_name} onChange={handleChange}>
                                    <option value="Day">Dani</option>
                                    <option value="Hour">Sati</option>
                                    <option value="Month">Meseci</option>
                                </select></div>
                            </div>
                            <div className="filterSingle">
                                <label>Ime stanice:</label>
                                <div className="select"> <select name="name" value={filters.name} onChange={handleChange}>
                                    <option value="">Izaberite senzor</option>
                                    {sensors.map((sensor) => (
                                        <option key={sensor.id} value={sensor.name}>
                                            {sensor.name}
                                        </option>
                                    ))}
                                </select></div>
                            </div>
                            <div className="filterSingle">
                                <label>Minimalni vazdušni pritisak:</label>
                                <input type="number" name="min_air_pressure" value={filters.min_air_pressure} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Maksimalni vazdušni pritisak:</label>
                                <input type="number" name="max_air_pressure" value={filters.max_air_pressure} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Minimalna vlažnost vazduha:</label>
                                <input type="number" name="min_humidity" value={filters.min_humidity} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Maksimalna vlažnost vazduha:</label>
                                <input type="number" name="max_humidity" value={filters.max_humidity} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Minimalna temperatura:</label>
                                <input type="number" name="min_temperature" value={filters.min_temperature} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Maksimalna temperatura:</label>
                                <input type="number" name="max_temperature" value={filters.max_temperature} onChange={handleChange} />
                            </div>
                            {/*<div className="filterSingle">*/}
                            {/*    <label>Minimalna koncentracija PM1:</label>*/}
                            {/*    <input type="number" name="min_particular_matter_1" value={filters.minParticularMatter1} onChange={handleChange} />*/}
                            {/*</div>*/}
                            {/*<div className="filterSingle">*/}
                            {/*    <label>Maksimalna koncentracija PM1:</label>*/}
                            {/*    <input type="number" name="max_particular_matter_1" value={filters.maxParticularMatter1} onChange={handleChange} />*/}
                            {/*</div>*/}
                            <div className="filterSingle">
                                <label>Minimalni rang PM2.5:</label>
                                <input type="number" name="min_particular_matter_25_ranking" value={filters.min_particular_matter_25_ranking} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Maksimalni rang PM2.5:</label>
                                <input type="number" name="max_particular_matter_25_ranking" value={filters.max_particular_matter_25_ranking} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Minimalna koncentracija PM2.5:</label>
                                <input type="number" name="min_particular_matter_25_concentration" value={filters.min_particular_matter_25_concentration} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Maksimalna koncentracija PM2.5:</label>
                                <input type="number" name="max_particular_matter_25_concentration" value={filters.max_particular_matter_25_concentration} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Minimalna koncentracija PM10:</label>
                                <input type="number" name="min_particular_matter_10_concentration" value={filters.min_particular_matter_10_concentration} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Maksimalna koncentracija PM10:</label>
                                <input type="number" min={0} max={50} name="max_particular_matter_10_concentration" value={filters.max_particular_matter_10_concentration} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Minimalni rang PM10:</label>
                                <input type="number" name="min_particular_matter_10_ranking" value={filters.min_particular_matter_10_ranking} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Maksimalni rang PM10:</label>
                                <input type="number" name="max_particular_matter_10_ranking" value={filters.max_particular_matter_10_ranking} onChange={handleChange} />
                            </div>
                            <div className="filterSingle">
                                <label>Datum Od:</label>
                                <DatePicker
                                    selected={formatReturnDate(filters.start_date)}
                                    onChange={(date) => handleChangeDate('start_date', date)}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                            <div className="filterSingle">
                                <label>Datum Do:</label>
                                <DatePicker
                                    selected={formatReturnDate(filters.end_date)}
                                    onChange={(date) => handleChangeDate('end_date',date)}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                        </div>)}
                    </div>
                    {domLoaded &&(
                        <div className="dataTableContainer">
                            <DataTableComponent dataTableData={dataTableData} filters={filters} route={window.location.href}/>
                        </div>
                    )}
                    <hr className="mt-5" />
                    <p className='text-2xl mt-5 text-center font-bold'>WEB SAJTOVI ZA WIDGET</p>
                    <div className='flex justify-center'>
                        <div className="w-full max-w-lg mt-4">
                            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleAddWebsite}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                        Web sajt domen
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="website" value={webSite} onChange={handleWebSiteNameChange} name='website' type="text" placeholder="Web sajt" />
                                </div>
                                <div className="flex items-center justify-center">
                                    <button
                                        className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="submit">
                                        Dodaj Web Sajt
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <hr className="mt-5"/>
                    <p className='text-2xl mt-5 mb-5 text-center font-bold'>VAŠI PRIJAVLJENI WEB SAJTOVI</p>
                    {userWebSites  && (<table className="userWebsitesTable">
                        <thead>
                        <tr>
                            <th>Domen Sajta</th>
                            <th>Url format za Widget</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userWebSites ? userWebSites.map((userWebSite, index) => (
                            <tr  key={index}>
                                <td>{userWebSite}</td>
                                <td>{user.id + "_" + userWebSite}</td>
                                <td>
                                    <button type="button" value={userWebSite} onClick={handleDeleteWebsite}
                                            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Izbriši
                                    </button></td>
                            </tr> )) : ""}
                        </tbody>
                    </table>)}
                    <hr className="mt-5"/>
                    <p className='text-2xl my-5 text-center font-bold'>ODJAVA</p>
                                <div className="flex items-center justify-center">
                                    <button
                                        className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 my-6 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button" onClick={handleLogout}>
                                        Izloguj se
                                    </button>
                                </div>
                    </div></>
                )}
            <Footer/>
        </>

    )
}
