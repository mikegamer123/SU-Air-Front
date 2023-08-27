import React, {useEffect, useState} from "react";
import {
    BASE_API_URL,
    BASE_WEATHER_URL,
    checkWidgetAuth,
    qualityColor,
    qualityText,
    weatherIconMap,
    weatherMap
} from "@/config";
import {findClosestObject} from "@/findClosestHelper";
import Navbar from "@/components/Navbar/Navbar";
import Link from "next/link";
import DynamicMap from "@/components/Map/DynamicMap";
import CodeCopier from "@/components/CodeCopier/CodeCopier";
import humidityIcon from "@/resources/images/humidity.svg";
import windIcon from "@/resources/images/wind.svg";
import pressureIcon from "@/resources/images/pressure.svg";
import {formatDateToSerbian} from "@/dateHelper";
import windBlackIcon from "@/resources/images/windBlack.svg";
import Footer from "@/components/Footer/Footer";

export default function WidgetDataLive() {
    const [user, setUser] = useState(null);
    const slug = "centar-i"
    const [districtsData, setDistrictsData] = useState([]);
    const [latestData, setLatestData] = useState([]);
    const [hourlyWeather, setHourlyWeather] = useState(null);
    const [dailyWeather, setDailyWeather] = useState(null);
    const [currentHourIndex, setCurrentHourIndex] = useState(null);
    const [matchedDistrict, setMatchedDistrict] = useState(null);
    const [matchedSensor, setMatchedSensor] = useState(null);
    const [canShow, setCanShow] = useState(true);

    useEffect(() => {
        //check if widget can be used
    const queryParams = new URLSearchParams(window.location.search);
    const paramValue = queryParams.get('referrer');
    const paramValue2 = queryParams.get('referrer');
    const apiKey = queryParams.get('apiKey');
    const definedWebsite = apiKey.split("_")[1];
    const referrerUrl = new URL(decodeURIComponent(paramValue));
    const referrerHost = referrerUrl.host.replace(/^www\./, '').replace(/^https?:\/\//, '');
    if(referrerHost !== definedWebsite) setCanShow(false);
    else {
        const requestData = {
            userID: apiKey.split("_")[0],
            websites: [definedWebsite]
        };
        fetch(BASE_API_URL + '/website-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        }).then(response => {
            // Check if the response status is OK (200)
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
            .then(data => {
                if(data.favoriteSites.length === 0){
                    setCanShow(false);
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }
    }, []);

    function createSlug(str) {
        const slug = str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .trim();

        return slug;
    }

    function getLowestKey(map, givenValue = matchedSensor ? matchedSensor.particular_matter_25.aqi_us_ranking : "") {
        let result = null;
        for (const [key, value] of map.entries()) {
            if (key < givenValue) {
                result = value;
                break;
            }
        }
        return result;
    }

    //load latest from all stations
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

                setLatestData(latestData);
                localStorage.setItem('sensors', JSON.stringify(latestData));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = BASE_WEATHER_URL;
                const response = await fetch(apiUrl);
                const data = await response.json();

                const {hourly, daily} = data;

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
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchData();
    }, []);

    //load all districts
    useEffect(() => {
        const fetchData = () => {
            const authToken = localStorage.getItem("login_token");

            fetch(BASE_API_URL + '/districts/get/all', {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    const formattedData = data.map(district => {
                        const formattedName = district.name.replace("Mesna zajednica", "").trim();
                        const slug = createSlug(formattedName);
                        return {...district, name: formattedName, slug: slug};
                    });
                    setDistrictsData(formattedData);
                })
                .catch(error => console.error('Error fetching data:', error));
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Find the matched district based on the slug
        const matchedDistrict = districtsData ? districtsData.find(district => district.slug === slug) : null;
        setMatchedDistrict(matchedDistrict || null);
    }, [districtsData, slug]);

    useEffect(() => {
        // Get the closest sensor to location
        const closestSensor = findClosestObject(matchedDistrict?.latitude || 0, matchedDistrict?.longitude || 0, latestData ?? []);
        setMatchedSensor(closestSensor);
    }, [latestData]);

    return (
        <>
            <Navbar hide={true}/>
            {canShow ? (<section className="heatmap-section">
                <div className="widgetMini">
                    <div className="dataLive mobile flex">
                        <div className="header">
                            <span>{matchedDistrict ? matchedDistrict.name : ""}</span>
                            <span>Subotica <br/> {matchedSensor ? (new Date(new Date(matchedSensor.cron_job_timestamp).getTime() - 2 * 60 * 60 * 1000).toLocaleString("en-GB", {
                                hour: 'numeric',
                                minute: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })) : ""}</span>
                        </div>
                        <div className={"aqiLive mobile flex widget !w-full !my-5 " + getLowestKey(qualityColor)}>
                            <div className="aqiLiveNumber">
                                {"US AQI"}
                                <span
                                    className="!text-4xl">{matchedSensor ? matchedSensor.particular_matter_25.aqi_us_ranking : ""}</span>
                            </div>
                            <div className="aqiLiveDescription">
                                Uživo AQI index
                                <span className="!text-xl">{getLowestKey(qualityText)}</span>
                            </div>
                        </div>
                        <hr/>
                        <div className="weatherTemp">
                            <div className="flex flex-row"><img width="50px"
                                                                src={weatherIconMap.get(hourlyWeather ? hourlyWeather.weathercode[currentHourIndex] : 0)}/>
                                <span
                                    className="mt-2 ml-2">{(hourlyWeather ? Math.round(hourlyWeather.temperature_2m[currentHourIndex]) : "") + "°"}</span>
                            </div>
                            <div
                                className="mt-2 h-full text-center">{weatherMap.get(hourlyWeather ? hourlyWeather.weathercode[currentHourIndex] : 0)}</div>
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
                                <div className="flex flex-row justify-between w-20"><img width="20px"
                                                                                         src={windIcon.src}/>
                                    <span>{(hourlyWeather ? hourlyWeather.windspeed_10m[currentHourIndex] : "")}<small>km/h</small></span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span>Pritisak</span>
                                <div className="flex flex-row justify-between w-20"><img width="20px"
                                                                                         src={pressureIcon.src}/>
                                    <span
                                        className="text-xs mt-1">{matchedSensor ? Math.round(matchedSensor.air_pressure * 0.030) : ""}<small>Hg</small></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>) : (<h2 className="text-center text-xl font-semibold">Problem u autentikaciji.<br/>Proverite da li ste dobro kopirali HTML kod ili vam nije prijavljen ovaj web sajt.</h2>)}
        </>
    )
}