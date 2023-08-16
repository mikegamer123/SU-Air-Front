import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Link from 'next/link';
import locateIcon from "@/resources/images/locate.svg";
import rainIcon from "@/resources/images/rain.svg";
import humidityIcon from "@/resources/images/humidity.svg";
import pressureIcon from "@/resources/images/pressure.svg";
import windIcon from "@/resources/images/wind.svg";
import windBlackIcon from "@/resources/images/windBlack.svg";
import stationIcon from "@/resources/images/ic-location-station.svg.svg";
import DynamicMap from "@/components/Map/DynamicMap";
import {useRouter} from "next/router";
import {showToast} from "@/toastHelper";
import {
    qualityColor,
    qualityText,
    weatherMap,
    weatherIconMap,
    BASE_WEATHER_URL,
    BASE_API_URL,
    qualityColorVals
} from "@/config";
import React, {useEffect, useState} from 'react';
import BarChart from "@/components/BarChart/BarChart";
import {validateConfig} from "next/dist/server/config-shared";
import {
    convertTimestampToDate,
    formatDateToSerbian, formatDateToSerbianWithHours,
    getCurrentDateFormatted,
    getWeekAfterCurrentDateFormatted,
    getWeekBeforeCurrentDateFormatted
} from "@/dateHelper";
import {findClosestObject} from "@/findClosestHelper";
import MiniBarChart from "@/components/BarChart/MiniBarChart";

export default function Page() {
    const [userLocation, setUserLocation] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [miniChartData, setMiniChartData] = useState(null);
    const [isDayActive, setIsDayActive] = useState(true);
    const [isPm25, setPm25] = useState(false);

    const router = useRouter();
    const slug = router.query.slug;
    const [user, setUser] = useState(null);
    const [hourlyWeather, setHourlyWeather] = useState(null);
    const [dailyWeather, setDailyWeather] = useState(null);
    const [currentHourIndex, setCurrentHourIndex] = useState(null);
    const [windDirection, setWindDirection] = useState(null);
    const [districts, setDistricts] = useState(null);
    const [historicDayData, setHistoricDayData] = useState(null);
    const [historicHourData, setHistoricHourData] = useState(null);
    const [sensors, setSensors] = useState(null);
    const [matchedDistrict, setMatchedDistrict] = useState(null);
    const [matchedSensor, setMatchedSensor] = useState(null);

    useEffect(() => {
        const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user-loc')) : null;
        setUser(storedUser);
    }, []);

    useEffect(() => {
        // Fetch data from localStorage and parse it
        const storedDistricts = JSON.parse(localStorage.getItem("districts"));
        const storedSensors = JSON.parse(localStorage.getItem("sensors"));

        // Update the state variables with the parsed data
        setDistricts(storedDistricts || []);
        setSensors(storedSensors || []);
    }, []);

    useEffect(() => {
        // Find the matched district based on the slug
        const matchedDistrict = districts ? districts.find(district => district.slug === slug) : null;
        setMatchedDistrict(matchedDistrict || null);
    }, [districts, slug]);

    useEffect(() => {
        // Get the closest sensor to location
        const closestSensor = findClosestObject(user ? user.latitude : matchedDistrict?.latitude || 0, user ? user.longitude : matchedDistrict?.longitude || 0, sensors ?? []);
        setMatchedSensor(closestSensor);
    }, [sensors]);

    function getLowestKey(map, givenValue = matchedSensor ? matchedSensor.particular_matter_25.aqi_us_ranking : ""){
        let result = null;
        for (const [key, value] of map.entries()) {
            if (key < givenValue) {
                result = value;
                break;
            }
        }
        return result;
    }

    //load day data from specific station for a week
    useEffect(() => {
        if (matchedSensor) {
            const url = new URL(BASE_API_URL + '/AQI/search');
            url.searchParams.append('model_name', 'Day');
            url.searchParams.append('name', matchedSensor ? matchedSensor.name : null);
            url.searchParams.append('start_date', /*getWeekBeforeCurrentDateFormatted()*/ '2023-07-23');
            url.searchParams.append('end_date', /*getCurrentDateFormatted()*/ '2023-07-30');
            url.searchParams.append('sort_by', 'time_stamp');
            url.searchParams.append('order', 'asc');
            fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem("login_token")
                }
            }).then(response => response.json())
                .then(data => {
                    const jsonData = data;
                    setHistoricDayData(jsonData);
                })
        }
    }, [matchedSensor]);

    useEffect(() => {
        setChartData(historicDayData ? {
            type: "bar",
            data: {datasets: [
                {
                    label: "Kvalitet vazduha po danima",
                    data: historicDayData.map((data) => data.particular_matter_25.aqi_us_ranking),
                    backgroundColor: historicHourData.map((data) => {
                        const aqiValue = data.particular_matter_25.aqi_us_ranking;
                        return getLowestKey(qualityColorVals, aqiValue)
                    }),
                    borderColor: "black",
                    borderWidth: 2,
                },
            ],
                labels: historicDayData.map((data) => formatDateToSerbian(convertTimestampToDate(data.time_stamp))),
            },
            options: {
                scales: {
                    x: {
                        type: 'category', // Set the scale type to "category"
                    },
                },
            },
        } : null);

        setMiniChartData(historicHourData ? {
            type: "bar",
            data: {datasets: [
                    {
                        label: "Kvalitet vazduha po satima",
                        data: historicHourData.map((data) => data.particular_matter_25.aqi_us_ranking),
                        backgroundColor: historicHourData.map((data) => {
                            const aqiValue = data.particular_matter_25.aqi_us_ranking;
                            return getLowestKey(qualityColorVals, aqiValue)
                        }),
                        borderColor: "black",
                        borderWidth: 2,
                    },
                ],
                labels: historicHourData.map((data) => formatDateToSerbianWithHours(convertTimestampToDate(data.time_stamp))),
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        display: false, // Hide Y axis labels
                    },
                    x: {
                        display: false, // Hide X axis labels
                    },
                },
            },
        } : null);
    }, [historicHourData]);



    //load hour data from specific station for a week
    useEffect(() => {

        const url = new URL(BASE_API_URL + '/AQI/search');
        url.searchParams.append('model_name', 'Hour');
        url.searchParams.append('name', matchedSensor ? matchedSensor.name : "");
        url.searchParams.append('start_date', /*getWeekBeforeCurrentDateFormatted()*/'2023-08-01');
        url.searchParams.append('end_date', /*getCurrentDateFormatted()*/'2023-08-02');
        url.searchParams.append('sort_by', 'time_stamp');
        url.searchParams.append('order', 'asc');
        fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("login_token")
            }
        })  .then(response => response.json())
            .then(data => {
                const jsonData = data;
                setHistoricHourData(jsonData);
            })
    }, [historicDayData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = BASE_WEATHER_URL;
                const response = await fetch(apiUrl);
                const data = await response.json();

                const { hourly, daily } = data;

                // Sort the hourly weather data by time
                hourly.time.sort((a, b) => new Date(a) - new Date(b));
                setHourlyWeather(hourly);

                // Sort the daily weather data by time
                daily.time.sort((a, b) => new Date(a) - new Date(b));
                setDailyWeather(daily);
                // Get the current hour and find its index in the hourly weather data
                const currentHour = new Date().toISOString().slice(0, 13) + ':00';
                const currentIndex = hourly.time.findIndex((time) => time === currentHour);
                setCurrentHourIndex(currentIndex);
                setWindDirection((hourlyWeather?.winddirection_10m[currentIndex] || 0) + 180);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (userLocation) {
            localStorage.setItem("user-loc", JSON.stringify(userLocation));
        }
    }, [userLocation]);

    useEffect(() => {
        if (matchedDistrict) {
            localStorage.setItem("matched-district", JSON.stringify(matchedDistrict));
        }
    }, [matchedDistrict]);


    const switchToDay = () => {
        if(!isPm25){
            setChartData(historicDayData ? {
                type: "bar",
                data: {datasets: [
                        {
                            label: "Kvalitet vazduha po danima",
                            data: historicDayData.map((data) => data.particular_matter_25.aqi_us_ranking),
                            backgroundColor: historicHourData.map((data) => {
                                const aqiValue = data.particular_matter_25.aqi_us_ranking;
                                return getLowestKey(qualityColorVals, aqiValue)
                            }),
                            borderColor: "black",
                            borderWidth: 2,
                        },
                    ],
                    labels: historicDayData.map((data) => formatDateToSerbian(convertTimestampToDate(data.time_stamp))),
                },
                options: {
                    scales: {
                        x: {
                            type: 'category', // Set the scale type to "category"
                        },
                    },
                },
            } : null);
        }
        else{
            switchToPm25(true);
        }
        setIsDayActive(true);
    };

    const switchToHour = () => {
        if(!isPm25){
            setChartData(historicHourData ? {
                type: "bar",
                data: {datasets: [
                        {
                            label: "Kvalitet vazduha u zadnjih 24 sata",
                            data: historicHourData.map((data) => data.particular_matter_25.aqi_us_ranking),
                            backgroundColor: historicHourData.map((data) => {
                                const aqiValue = data.particular_matter_25.aqi_us_ranking;
                                return getLowestKey(qualityColorVals, aqiValue)
                            }),
                            borderColor: "black",
                            borderWidth: 2,
                        },
                    ],
                    labels: historicHourData.map((data) => formatDateToSerbianWithHours(convertTimestampToDate(data.time_stamp))),
                },
                options: {
                    scales: {
                        x: {
                            type: 'category', // Set the scale type to "category"
                        },
                    },
                },
            } : null);
        }
        else{
            switchToPm25(false);
        }
        setIsDayActive(false);
    };

    const switchToPm25 = (isDayActiveVar = isDayActive) => {
        let newChartData = isDayActiveVar ? historicDayData : historicHourData;
        setChartData(newChartData ? {
            type: "bar",
            data: {datasets: [
                    {
                        label: "Koncentracija PM2.5 u vazduhu u zadnjih" + (isDayActiveVar ? " nedelju dana" : " 24 sata"),
                        data: newChartData.map((data) => data.particular_matter_25.concentration),
                        backgroundColor: [
                            "#009988",
                        ],
                        borderColor: "black",
                        borderWidth: 2,
                    },
                ],
                labels: newChartData.map((data) => isDayActiveVar ? formatDateToSerbian(convertTimestampToDate(data.time_stamp))  : formatDateToSerbianWithHours(convertTimestampToDate(data.time_stamp))),
            },
            options: {
                scales: {
                    x: {
                        type: 'category', // Set the scale type to "category"
                    },
                },
            },
        } : null);
        setPm25(true);
    };

    const switchToAQI = () => {
        let newChartData = isDayActive ? historicDayData : historicHourData;
        setChartData(newChartData ? {
            type: "bar",
            data: {datasets: [
                    {
                        label: isDayActive ? "Kvalitet vazduha po danima" :  "Kvalitet vazduha u zadnjih 24 sata",
                        data: newChartData.map((data) => data.particular_matter_25.aqi_us_ranking),
                        backgroundColor: historicHourData.map((data) => {
                            const aqiValue = data.particular_matter_25.aqi_us_ranking;
                            return getLowestKey(qualityColorVals, aqiValue)
                        }),
                        borderColor: "black",
                        borderWidth: 2,
                    },
                ],
                labels: newChartData.map((data) => isDayActive ? formatDateToSerbian(convertTimestampToDate(data.time_stamp))  : formatDateToSerbianWithHours(convertTimestampToDate(data.time_stamp))),
            },
            options: {
                scales: {
                    x: {
                        type: 'category', // Set the scale type to "category"
                    },
                },
            },
        } : null);
        setPm25(false);
    };

    const handleLocateClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    setUserLocation({latitude, longitude});
                    showToast("Uspešno ste locirani!");
                    setTimeout(function () {
                        router.reload();
                    }, 3000)
                },
                (error) => {
                    showToast("Greška <br>" + error, 'error')
                }
            );
        } else {
            showToast("Geolokacija nije podržana!", 'error')
        }
    };

    function anchorToClosestStation(){
        let markerPane = document.querySelector('.leaflet-marker-pane');
        let imgElements = markerPane.querySelectorAll('img');
        let selectedImg = null;

        imgElements.forEach((img) => {
            const src = img.getAttribute('src');
            if (src.includes('stationIconClosest')) {
                selectedImg = img;
                return; // Stop the loop once the element is found
            }
        });

        selectedImg.scrollIntoView({
            behavior: 'smooth', // Use 'auto' for instant scroll or 'smooth' for smooth scroll
            block: 'center', // Scroll to the center of the viewport
            inline: 'center', // Scroll to the center of the viewport
        });

        selectedImg.classList.add('bouncy-animation');
        setTimeout(() => {
            selectedImg.classList.remove('bouncy-animation');
        }, 2000);
    }

    function clearUser(){
        if (user) {
            localStorage.removeItem("user-loc");
        }
        router.push('/heat-map');
    }

    return (
        <>
            <Navbar/>
            <div className="px-4 mx-auto lg:max-w-screen-2xl md:px-8">
                <div className="stationNav pt-5 mb-16">
                    <div className="stationDiv hoverButton" onClick={anchorToClosestStation}>
                        <img className="stationImg" src={stationIcon.src}></img>
                        <span className="stationText">Stanica: {matchedSensor ? matchedSensor.name : ""}</span>
                    </div>
                    <span className="stationNavCity ml-2 hoverItem"><Link href="/heat-map">Subotica</Link></span>
                    <span className="stationDistrict hoverItem">{user ? "Vaša lokacija" : matchedDistrict ? matchedDistrict.name : ""}</span>
                    <span className="stationDistrict hoverItem" onClick={user ? clearUser : function (){return false;}}> <u>{user ? "Uklonite lokaciju" : ""}</u></span>
                </div>
                <div className="heatMapHeader">
                    <div className="updated mb-3">
                        <b>Ažurirano u</b> <div>{matchedSensor ? new Date(new Date(matchedSensor.cron_job_timestamp).getTime() - 2 * 60 * 60 * 1000).toLocaleString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '') : ""} </div>
                    </div>
                    <div className="header mb-3">
                        <span
                            className="mainHeader">Kvalitet vazduha u blizini {matchedDistrict ? matchedDistrict.name : ""}, Subotica</span>
                        <span
                            className="helpingHeader">Indeks kvaliteta vazduha (AKI) i zagađenje vazduha PM 2,5 kod {matchedDistrict ? matchedDistrict.name : ""}, Subotica</span>
                    </div>
                    <div className="locateBtn hoverButton lg:m-0 m-auto my-4" onClick={handleLocateClick}>
                        <img src={locateIcon.src} alt="lociraj ikonica"></img>
                        <span>Lociraj me</span>
                    </div>
                </div>
                <div className={"aqiLive mobile flex lg:hidden !mb-8 " + getLowestKey(qualityColor)}>
                    <div className="aqiLiveNumber">
                        {"US AQI"}
                        <span>{matchedSensor ? matchedSensor.particular_matter_25.aqi_us_ranking : ""}</span>
                    </div>
                    <div className="aqiLiveDescription">
                        Uživo AQI index
                        <span>{getLowestKey(qualityText)}</span>
                    </div>
                </div>

                <div className="dataLive mobile flex lg:hidden !mb-8">
                    <div className="header">
                        <span>{matchedDistrict ? matchedDistrict.name : ""}</span>
                        <span>Subotica <br/> {matchedSensor ? (new Date(new Date(matchedSensor.cron_job_timestamp).getTime() - 2 * 60 * 60 * 1000).toLocaleString("en-GB", { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })) : ""}</span>
                    </div>
                    <a href="#dailyWeatherDetails"><div className="getWeather pt-4">Dnevna prognoza <span> {">"} </span></div></a>
                    <hr/>
                    <div className="weatherTemp">
                        <div className="flex flex-row"><img width="50px" src={weatherIconMap.get(hourlyWeather ? hourlyWeather.weathercode[currentHourIndex] : 0)}/> <span className="mt-2 ml-2">{(hourlyWeather ? Math.round(hourlyWeather.temperature_2m[currentHourIndex]) : "") + "°"}</span>
                        </div>
                        <div className="mt-2 h-full text-center">{weatherMap.get(hourlyWeather ? hourlyWeather.weathercode[currentHourIndex] : 0)}</div>
                    </div>
                    <div className="flex flex-col weatherDetails">
                        <div className="flex justify-between">
                            <span>Vlažnost</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px"
                                                                                     src={humidityIcon.src}/>
                                <span>{matchedSensor ? Math.round(matchedSensor.humidity) : ""}%</span></div>
                        </div>
                        <div className="flex justify-between">
                            <span>Vetar</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px" src={windIcon.src} style={{  transform: `rotate(${windDirection ? windDirection : 0}deg)` }} />
                                <span>{(hourlyWeather ? hourlyWeather.windspeed_10m[currentHourIndex] : "")}<small>km/h</small></span></div>
                        </div>
                        <div className="flex justify-between">
                            <span>Pritisak</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px"
                                                                                     src={pressureIcon.src}/>
                                <span className="text-xs mt-1">{matchedSensor ? Math.round(matchedSensor.air_pressure * 0.030) : ""}<small>Hg</small></span></div>
                        </div>
                    </div>
                    <hr/>
                    <div className="hourlyDetail flex flex-col">
                        <span className="text-left">Prošla 24 sata</span>
                        <div className='chartMiniData'>
                            {miniChartData ? (<MiniBarChart miniChartData={miniChartData}/>) : ""}
                        </div>
                        <Link href="/history"><div className="detailBtn text-center mt-10">Pogledajte detalje</div></Link>
                    </div>
                </div>

            </div>
            <div className='centerSlugDiv'>
                <div className={"aqiLive  lg:flex hidden " + getLowestKey(qualityColor)}>
                    <div className="aqiLiveNumber">
                        {"US AQI"}
                        <span>{matchedSensor ? matchedSensor.particular_matter_25.aqi_us_ranking : ""}</span>
                    </div>
                    <div className="aqiLiveDescription">
                        Uživo AQI index
                        <span>{getLowestKey(qualityText)}</span>
                    </div>
                </div>
                <div className="dataLive lg:flex hidden">
                    <div className="header">
                        <span>{matchedDistrict ? matchedDistrict.name : ""}</span>
                        <span>Subotica <br/> {matchedSensor ? (new Date(new Date(matchedSensor.cron_job_timestamp).getTime() - 2 * 60 * 60 * 1000).toLocaleString("en-GB", { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })) : ""}</span>
                    </div>
                    <a href="#dailyWeatherDetails"><div className="getWeather pt-4">Dnevna prognoza <span> {">"} </span></div></a>
                    <hr/>
                    <div className="weatherTemp">
                        <div className="flex flex-row"><img width="50px" src={weatherIconMap.get(hourlyWeather ? hourlyWeather.weathercode[currentHourIndex] : 0)}/> <span className="mt-2 ml-2">{(hourlyWeather ? Math.round(hourlyWeather.temperature_2m[currentHourIndex]) : "") + "°"}</span>
                        </div>
                        <div className="mt-2 h-full text-center">{weatherMap.get(hourlyWeather ? hourlyWeather.weathercode[currentHourIndex] : 0)}</div>
                    </div>
                    <div className="flex flex-col weatherDetails">
                        <div className="flex justify-between">
                            <span>Vlažnost</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px"
                                                                                     src={humidityIcon.src}/>
                                <span>{matchedSensor ? Math.round(matchedSensor.humidity) : ""}%</span></div>
                        </div>
                        <div className="flex justify-between">
                            <span>Vetar</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px" src={windIcon.src} style={{  transform: `rotate(${windDirection ? windDirection : 0}deg)` }}/>
                                <span>{(hourlyWeather ? hourlyWeather.windspeed_10m[currentHourIndex] : "")}<small>km/h</small></span></div>
                        </div>
                        <div className="flex justify-between">
                            <span>Pritisak</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px"
                                                                                     src={pressureIcon.src}/>
                                <span className="text-xs mt-1">{matchedSensor ? Math.round(matchedSensor.air_pressure * 0.030) : ""}<small>Hg</small></span></div>
                        </div>
                    </div>
                    <hr/>
                    <div className="hourlyDetail flex flex-col">
                        <span className="text-left">Prošla 24 sata</span>
                        <div className='chartMiniData'>
                            {miniChartData ? (<MiniBarChart miniChartData={miniChartData}/>) : ""}
                        </div>
                        <Link href="/history"><div className="detailBtn text-center mt-10">Pogledajte detalje</div></Link>
                    </div>
                </div>
                <div className="legendLive">
                    <div className="flex flex-row my-2 mx-5">
                        <div>
                            <span  className="lg:block hidden">Dobar</span>
                        </div>
                        <div>
                            <span  className="lg:block hidden">Umereno</span>
                        </div>
                        <div>
                            <span  className="lg:block hidden">Nezdravo za osetljive grupe</span>
                        </div>
                        <div>
                           <span  className="lg:block hidden"> Nezdravo</span>
                        </div>
                        <div>
                            <span  className="lg:block hidden">Vrlo nezdravo</span>
                        </div>
                        <div>
                            <span  className="lg:block hidden">Opasno</span>
                        </div>
                    </div>
                </div>
                <DynamicMap/>
            </div>
            <div className="px-4 mx-auto lg:max-w-screen-2xl md:px-8">
                <div className="slugSection">
                    <div className="analyseDiv flex md:flex-row flex-col">
                        <div id="dailyWeatherDetails" className="details flex flex-col md:w-2/3 w-full">
                            <h1>Prognoza</h1>
                            <h2 className="pt-2 pb-8">Kod
                                Subotica, {matchedDistrict ? matchedDistrict.name : ""} kvalitet vazduha (AQI)</h2>
                            <table>
                                <thead>
                                <tr>
                                    <th>Dan</th>
                                    {/*<th>Nivo zagađenja</th>*/} {/*POSSIBLE TODO CHECK IF WE WILL HAVE PREDICTIONS FOR AQI DATA*/}
                                    <th>Vreme</th>
                                    <th>Temperatura</th>
                                    <th>Vetar</th>
                                </tr>
                                </thead>
                                <tbody>
                                {dailyWeather ? dailyWeather.time.map((date, index) => (
                                <tr className={"" + index == 0 ? "today" : ""} key={date}>
                                    <td>{index == 0 ? "Danas" : formatDateToSerbian(date)}</td>
                                    {/*<td className="pr-4">*/}
                                    {/*    <div className="flex flex-row justify-between aqiSlug yellow">*/}
                                    {/*    <span>*/}
                                    {/*        {index == 0 ? "Danas" : formatDateToSerbian(date)}*/}
                                    {/*    </span>*/}
                                    {/*        <span>*/}
                                    {/*            {"61 US AQI"}*/}
                                    {/*        </span>*/}
                                    {/*    </div>*/}
                                    {/*</td>*/} {/*POSSIBLE TODO CHECK IF WE WILL HAVE PREDICTIONS FOR AQI DATA*/}
                                    <td><img className="d-initial" width="25%" src={weatherIconMap.get(dailyWeather ? dailyWeather.weathercode[index] : 0)}/> {"  " + dailyWeather.precipitation_probability_max[index] + "%"}</td>
                                    <td>
                                        <span className="mr-4 font-bold">{Math.round(dailyWeather.temperature_2m_min[index]) + "°"}</span>
                                        <span>{Math.round(dailyWeather.temperature_2m_max[index]) +"°"}</span>
                                    </td>
                                    <td>
                                        <img className="d-initial" src={windBlackIcon.src} alt="windIcon"/>
                                        {"  " + dailyWeather.windspeed_10m_max[index] + "km/h"}
                                    </td>
                                </tr> )) : ""}
                                </tbody>
                            </table>
                            <div className="chartDiv mt-16">
                                <h1>Istorija</h1>
                                <h2 className="pt-2 pb-8">Istorijski grafikon kvaliteta vazduha: Kod {matchedDistrict ? matchedDistrict.name : ""}, Subotica</h2>
                                <div className="hourDayButtons flex flex-row justify-center mb-12">
                                    <div className={`button dayBtn ${isDayActive ? 'active' : ''}`} onClick={switchToDay}>
                                        Po danu
                                    </div>
                                    <div className={`button hourBtn ml-3 ${isDayActive ? '' : 'active'}`} onClick={switchToHour}>
                                        Po satu
                                    </div>
                                </div>
                                <div className="chart">
                                    {chartData ? (<BarChart chartData={isDayActive ? chartData : chartData}/>) : ""}
                                </div>
                                <div className="typeButtons flex flex-row justify-center mt-12">
                                    <div className={`button mr-3 ${isPm25 ? '' : 'active'}`} onClick={switchToAQI}>AQI</div>
                                    <div className={`button ${isPm25 ? 'active' : ''}`} onClick={switchToPm25}>PM2.5</div>
                                </div>
                            </div>
                        </div>
                        <div className="mobileApp px-4 py-4 md:w-1/3 w-full">
                            <div className="appImg">
                                <h1>SUAIR APP</h1>
                                <h2 className="mt-2">Besplatna iOS i Android aplikacija za kvalitet vazduha</h2>
                                <div className="appButton">Preuzmi aplikaciju</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
}