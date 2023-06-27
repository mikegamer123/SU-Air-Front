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
import React, {useEffect, useState} from 'react';
import BarChart from "@/components/BarChart/BarChart";

export default function Page() {
    const Data = [
        {
            id: 1,
            year: 2016,
            userGain: 80000,
            userLost: 823
        },
        {
            id: 2,
            year: 2017,
            userGain: 45677,
            userLost: 345
        },
        {
            id: 3,
            year: 2018,
            userGain: 78888,
            userLost: 555
        },
        {
            id: 4,
            year: 2019,
            userGain: 90000,
            userLost: 4555
        },
        {
            id: 5,
            year: 2020,
            userGain: 4300,
            userLost: 234
        }
    ]; // for example only until I pull data

    const [userLocation, setUserLocation] = useState(null);
    const [chartData, setChartData] = useState({
        labels: Data.map((data) => data.year),
        datasets: [
            {
                label: "Users Gained",
                data: Data.map((data) => data.userGain),
                backgroundColor: [
                    "rgba(75, 192, 192, 1)",
                    "#ecf0f1",
                    "#50AF95",
                    "#f3ba2f",
                    "#2a71d0",
                ],
                borderColor: "black",
                borderWidth: 2,
            },
        ],
        options: {
            scales: {
                x: {
                    type: 'category', // Set the scale type to "category"
                },
            },
        },
    });

    const router = useRouter();
    const slug = router.query.slug;
    const districts = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("districts"));
    const matchedDistrict = districts ? districts.find(district => district.slug === slug) : [];

    useEffect(() => {
        if (userLocation) {
            localStorage.setItem("user-loc", JSON.stringify(userLocation));
        }
    }, [userLocation]);

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

    return (
        <>
            <Navbar/>
            <div className="px-4 mx-auto lg:max-w-screen-2xl md:px-8">
                <div className="stationNav pt-5 mb-16">
                    <div className="stationDiv">
                        <img className="stationImg" src={stationIcon.src}></img>
                        <span className="stationText">Stanica</span>
                    </div>
                    <span className="stationNavCity"><Link href="/heat-map">Subotica</Link></span>
                    <span className="stationDistrict">{matchedDistrict ? matchedDistrict.name : ""}</span>
                </div>
                <div className="heatMapHeader">
                    <div className="updated mb-3">
                        <b>Ažurirano u</b> {"12:00, Apr 24"}
                    </div>
                    <div className="header mb-3">
                        <span
                            className="mainHeader">Kvalitet vazduha u blizini {matchedDistrict ? matchedDistrict.name : ""}, Subotica</span>
                        <span
                            className="helpingHeader">Indeks kvaliteta vazduha (AKI) i zagađenje vazduha PM 2,5 kod {matchedDistrict ? matchedDistrict.name : ""}, Subotica</span>
                    </div>
                    <div className="locateBtn my-4" onClick={handleLocateClick}>
                        <img src={locateIcon.src} alt="lociraj ikonica"></img>
                        <span>Lociraj me</span>
                    </div>
                </div>
            </div>
            <div className='centerSlugDiv'>
                <div className="aqiLive">
                    <div className="aqiLiveNumber">
                        {"US AQI"}
                        <span>{"56"}</span>
                    </div>
                    <div className="aqiLiveDescription">
                        Uživo AQI index
                        <span>{"Umereno"}</span>
                    </div>
                </div>
                <div className="dataLive">
                    <div className="header">
                        <span>{matchedDistrict ? matchedDistrict.name : ""}</span>
                        <span>Subotica <br/> {"12:00 Apr 24"}</span>
                    </div>
                    <div className="getWeather pt-4">Dnevna prognoza <span> {">"} </span></div>
                    <hr/>
                    <div className="weatherTemp">
                        <div className="flex flex-row"><img src={rainIcon.src}/> <span className="mt-2">{"12.4°"}</span>
                        </div>
                        <div className="mt-2 h-full">{"Kiša"}</div>
                    </div>
                    <div className="flex flex-col weatherDetails">
                        <div className="flex justify-between">
                            <span>Vlažnost</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px"
                                                                                     src={humidityIcon.src}/>
                                <span>{"81"}%</span></div>
                        </div>
                        <div className="flex justify-between">
                            <span>Vetar</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px" src={windIcon.src}/>
                                <span>{"9.8"}<small>mp/h</small></span></div>
                        </div>
                        <div className="flex justify-between">
                            <span>Pritisak</span>
                            <div className="flex flex-row justify-between w-20"><img width="20px"
                                                                                     src={pressureIcon.src}/>
                                <span>{"29.8"}<small>Hg</small></span></div>
                        </div>
                    </div>
                    <hr/>
                    <div className="hourlyDetail flex flex-col">
                        <span className="text-left">Prošla 24 sata</span>
                        <div className='chartMiniData'>
                            <BarChart chartData={chartData}/>
                        </div>
                        <div className="detailBtn text-center mt-10">Pogledajte detalje</div>
                    </div>
                </div>
                <div className="legendLive">
                    <div className="flex flex-row my-2 mx-5">
                        <div>
                            Dobar
                        </div>
                        <div>
                            Umereno
                        </div>
                        <div>
                            Nezdravo za osetljive grupe
                        </div>
                        <div>
                            Nezdravo
                        </div>
                        <div>
                            Vrlo nezdravo
                        </div>
                        <div>
                            Opasno
                        </div>
                    </div>
                </div>
                <DynamicMap/>
            </div>
            <div className="px-4 mx-auto lg:max-w-screen-2xl md:px-8">
                <div className="slugSection">
                    <div className="analyseDiv flex flex-row">
                        <div className="details flex flex-col">
                            <h1>Prognoza</h1>
                            <h2 className="pt-2 pb-8">Kod
                                Subotica, {matchedDistrict ? matchedDistrict.name : ""} kvalitet vazduha (AQI)</h2>
                            <table>
                                <thead>
                                <tr>
                                    <th>Dan</th>
                                    <th>Nivo zagađenja</th>
                                    <th>Vreme</th>
                                    <th>Temperatura</th>
                                    <th>Vetar</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{"Petak, Apr 21"}</td>
                                    <td className="pr-4">
                                        <div className="flex flex-row justify-between aqiSlug yellow">
                                        <span>
                                            {"Petak, Apr 21"}
                                        </span>
                                            <span>
                                                {"61 US AQI"}
                                            </span>
                                        </div>
                                    </td>
                                    <td><img className="d-initial" src={rainIcon.src}/> {"  " + "90%"}</td>
                                    <td>
                                        <span className="mr-4 font-bold">{"16°"}</span>
                                        <span>{"17.6°"}</span>
                                    </td>
                                    <td>
                                        <img className="d-initial" src={windBlackIcon.src} alt="windIcon"/>
                                        {"  " + "3.72 km/h"}
                                    </td>
                                </tr>
                                <tr>
                                    <td>{"Petak, Apr 21"}</td>
                                    <td className="pr-4">
                                        <div className="flex flex-row justify-between aqiSlug yellow">
                                        <span>
                                            {"Petak, Apr 21"}
                                        </span>
                                            <span>
                                                {"61 US AQI"}
                                            </span>
                                        </div>
                                    </td>
                                    <td><img className="d-initial" src={rainIcon.src}/> {"  " + "90%"}</td>
                                    <td>
                                        <span className="mr-4 font-bold">{"16°"}</span>
                                        <span>{"17.6°"}</span>
                                    </td>
                                    <td>
                                        <img className="d-initial" src={windBlackIcon.src} alt="windIcon"/>
                                        {"  " + "3.72 km/h"}
                                    </td>
                                </tr>
                                <tr className="today">
                                    <td>{"Petak, Apr 21"}</td>
                                    <td className="pr-4">
                                        <div className="flex flex-row justify-between aqiSlug yellow">
                                        <span>
                                            {"Petak, Apr 21"}
                                        </span>
                                            <span>
                                                {"61 US AQI"}
                                            </span>
                                        </div>
                                    </td>
                                    <td><img className="d-initial" src={rainIcon.src}/> {"  " + "90%"}</td>
                                    <td>
                                        <span className="mr-4 font-bold">{"16°"}</span>
                                        <span>{"17.6°"}</span>
                                    </td>
                                    <td>
                                        <img className="d-initial" src={windBlackIcon.src} alt="windIcon"/>
                                        {"  " + "3.72 km/h"}
                                    </td>
                                </tr>
                                <tr>
                                    <td>{"Petak, Apr 21"}</td>
                                    <td className="pr-4">
                                        <div className="flex flex-row justify-between aqiSlug yellow">
                                        <span>
                                            {"Petak, Apr 21"}
                                        </span>
                                            <span>
                                                {"61 US AQI"}
                                            </span>
                                        </div>
                                    </td>
                                    <td><img className="d-initial" src={rainIcon.src}/> {"  " + "90%"}</td>
                                    <td>
                                        <span className="mr-4 font-bold">{"16°"}</span>
                                        <span>{"17.6°"}</span>
                                    </td>
                                    <td>
                                        <img className="d-initial" src={windBlackIcon.src} alt="windIcon"/>
                                        {"  " + "3.72 km/h"}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            <div className="chartDiv mt-16">
                                <h1>Istorija</h1>
                                <h2 className="pt-2 pb-8">Istorijski grafikon kvaliteta vazduha: Kod {matchedDistrict ? matchedDistrict.name : ""}, Subotica</h2>
                                <div className="hourDayButtons flex flex-row justify-center mb-12">
                                    <div className="button hourBtn mr-3 active">Po satu</div>
                                    <div className="button dayBtn">Po danu</div>
                                </div>
                                <div className="chart">
                                    <BarChart chartData={chartData}/>
                                </div>
                                <div className="typeButtons flex flex-row justify-center mt-12">
                                    <div className="button mr-3 active">AQI</div>
                                    <div className="button">PM2.5</div>
                                </div>
                            </div>
                        </div>
                        <div className="mobileApp px-4 py-4">
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