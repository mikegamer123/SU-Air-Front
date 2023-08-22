import Navbar from "../components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer";
import DataTableComponent from "@/components/DataTable/DataTable";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React, {useEffect, useState} from "react";
import {BASE_API_URL} from "@/config";
import {
    formatReturnDate,
    formatStringFromDate,
    getFirstDayOfNextMonth,
    getFirstDayOfPreviousTwoMonths
} from "@/dateHelper";

export default function History() {

    const [domLoaded, setDomLoaded] = useState(false);
    const [dataTableData, setDataTableData] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    //initial filter values
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

    //construct the dynamic api url parameters depending on filters
    const getQueryString = () => {
        const urlParams = new URLSearchParams();

        Object.keys(filters).forEach((key) => {
            const value = filters[key];
            if (value !== null && value !== '') {
                urlParams.append(key, value);
            }
        });

        return urlParams.toString();
    };

    const handleChange = (event) => {
            const {name, value} = event.target;
            setFilters((prevFilters) => ({...prevFilters, [name]: value}));
    };

    const handleChangeDate = (name, date) => {
        setFilters((prevFilters) => ({...prevFilters, [name]: formatStringFromDate(date)}));
    };

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

    useEffect(() => {
        //change data on filter change
        const queryString = getQueryString();

        fetch(BASE_API_URL + '/AQI/search?' + queryString, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            }
        })
            .then(response => response.json())
            .then(data => {
                setDataTableData(data);
            });
    }, [filters]);

    return (
        <>
        <Navbar/>
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
                 <DataTableComponent dataTableData={dataTableData} filters={filters} route={""}/>
            </div>
            )}
        <Footer/>
        </>
    )
}
