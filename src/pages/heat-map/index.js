import Navbar from "src/components/Navbar/Navbar"
import Footer from "src/components/Footer/Footer";
import panorama1 from "/src/resources/images/panorama-subotica-1.webp"
import panorama2 from "/src/resources/images/panorama-subotica-2.webp"
import panorama3 from "/src/resources/images/panorama-subotica-3.webp"
import Link from 'next/link';
import {BASE_API_URL} from "@/config";
import React, {useEffect, useState} from 'react';

export default function Index() {
    //get district data
    const [districtsData, setDistrictsData] = useState([]);
    const [latestData, setLatestData] = useState([]);

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

    //load latest from all stations
    useEffect(() => {
        fetch('https://suair-backend-production.up.railway.app/AQI/get/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("login_token")
            },
            body: JSON.stringify({
                generateCSV: false,
                model_name: 'Day'
            })
        })
            .then(response => response.json())
            .then(data => {
                const jsonData = data.result;
                const dataArray = JSON.parse(jsonData);

                const groupedData = dataArray.reduce((groups, item) => {
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
                console.log(latestData);
                localStorage.setItem('districts', JSON.stringify(latestData));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    //load all districts
    useEffect(() => {
        console.log(BASE_API_URL+'/districts/get/all');
        const fetchData = () => {
            const authToken = localStorage.getItem("login_token");

            fetch(BASE_API_URL+'/districts/get/all', {
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
                        return { ...district, name: formattedName, slug:slug };
                    });
                    setDistrictsData(formattedData);
                    localStorage.setItem('districts', JSON.stringify(formattedData));
                })
                .catch(error => console.error('Error fetching data:', error));
        };

        fetchData();
    }, []);

    return (
        <>
            <Navbar/>
            <div className="districtsDiv">
                {/* Render the retrieved data */}
                {districtsData.map((district, index) => (
                    <Link href={"/heat-map/"+createSlug(district.name)}>
                    <div key={district.id} className="districtCard max-w-sm rounded overflow-hidden shadow-lg">
                        <div className="overlayDistricts">
                            <div className="overlayText">Pogledajte na mapi</div>
                        </div>
                        <img className="w-full" src={index % 3 == 0 ? panorama3.src : index % 2 == 0 ? panorama2.src : panorama1.src} alt="Panorama of subotica"/>
                        <div className="font-bold districtText text-xl mb-2">{district.name}</div>
                    </div>
                    </Link>
                ))}
            </div>
            <Footer/>
        </>
    )
}
