import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer";
import DynamicMap from "@/components/Map/DynamicMap";
import CodeCopier from "@/components/CodeCopier/CodeCopier";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {BASE_API_URL, BASE_WEATHER_URL, qualityColor, qualityText, weatherIconMap, weatherMap} from "@/config";
import humidityIcon from "@/resources/images/humidity.svg";
import windIcon from "@/resources/images/wind.svg";
import pressureIcon from "@/resources/images/pressure.svg";
import {findClosestObject} from "@/findClosestHelper";
import {formatDateToSerbian} from "@/dateHelper";
import windBlackIcon from "@/resources/images/windBlack.svg";
import BarChart from "@/components/BarChart/BarChart";

export default function Index() {
    const [user, setUser] = useState(null);
    const slug = "centar-i"
    const [districtsData, setDistrictsData] = useState([]);
    const [latestData, setLatestData] = useState([]);
    const [hourlyWeather, setHourlyWeather] = useState(null);
    const [dailyWeather, setDailyWeather] = useState(null);
    const [currentHourIndex, setCurrentHourIndex] = useState(null);
    const [matchedDistrict, setMatchedDistrict] = useState(null);
    const [matchedSensor, setMatchedSensor] = useState(null);

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

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
    }, []);

    return (
        <>
            <Navbar/>
            <div className="mainContent px-4 mx-auto lg:max-w-screen-2xl lg:items-center lg:px-8">
                <h1>SUAIR WIDGETS</h1>
                <h2 className="functions">Ponuđeni Widgets:<br/>
                    <div className="text-xl">
                        Samo izaberite vaš prijavljeni web sajt i kopirajte html kod na vaš web sajt
                        <br/>
                        Ako niste prijavili nijedan web sajt, to možete uraditi <Link href={"/registration"}><u
                        className="registrationLink">ovde</u></Link>
                    </div>
                </h2>
                <section className="function-card heatmap-section">
                    <h2>Mapa kvaliteta vazduha</h2>
                    <div className="history-desc">
                        <p>
                            Ova interaktivna toplotna mapa prikazuje kvalitet vazduha u svakoj mesnoj zajednici u
                            Subotici. <br/>Boje na mapi predstavljaju nivo zagađenja vazduha, omogućavajući vam brz
                            pregled stanja širom grada. </p>
                    </div>
                    <div className="widgetSpace">
                        <DynamicMap/>
                        <CodeCopier user={user} widgetType={"map"}/>
                    </div>
                </section>

                <section className="function-card dataLive-section">
                    <h2>Pregled za kvalitet vazduha u Subotici</h2>
                    <div>
                        <p>
                            Ovaj widget pokazuje korisnicima trenutno stanje kvaliteta vazduha u subotici kao i
                            vremensku prognozu trenutnu. </p>
                    </div>
                    <div className="widgetSpace">
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
                        <CodeCopier user={user} widgetType={"dataLive"}/>
                    </div>
                </section>

                <section className="function-card weather-section">
                    <h2>Dnevna prognoza</h2>
                    <div className="weather-desc">
                        <p>
                            Predstavlja dnevnu prognozu na teritoriji Subotice, ovaj mali widget ima sve potrebne informacije za korisnike.
                        </p>
                    </div>
                    <div className="widgetSpace">
                        <div className="analyseDiv flex md:flex-row flex-col">
                            <div id="dailyWeatherDetails" className="details flex flex-col w-full">
                                <h1>Prognoza</h1>
                                <h2 className="pt-2 pb-8">Subotica</h2>
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
                        </div>
                        </div>
                        <CodeCopier user={user} widgetType={"weather"}/>
                    </div>
                </section>
            </div>
            <Footer/>
        </>
    )
}
