import Navbar from "src/components/Navbar/Navbar"
import Footer from "src/components/Footer/Footer";
import panorama1 from "/src/resources/images/panorama-subotica-1.webp"
import panorama2 from "/src/resources/images/panorama-subotica-2.webp"
import panorama3 from "/src/resources/images/panorama-subotica-3.webp"
import Link from 'next/link';
import React, {useEffect, useState} from 'react';

export default function Index() {
    //get district data
    const [districtsData, setDistrictsData] = useState([]);

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
    useEffect(() => {
        const fetchData = () => {
            const authToken = localStorage.getItem("login_token");

            fetch('http://localhost:3000/districts/get/all', {
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
                    <div key={district.id} class="districtCard max-w-sm rounded overflow-hidden shadow-lg">
                        <div className="overlayDistricts">
                            <div className="overlayText">Pogledajte na mapi</div>
                        </div>
                        <img class="w-full" src={index % 3 == 0 ? panorama3.src : index % 2 == 0 ? panorama2.src : panorama1.src} alt="Panorama of subotica"/>
                        <div class="font-bold districtText text-xl mb-2">{district.name}</div>
                    </div>
                    </Link>
                ))}
            </div>
            <Footer/>
        </>
    )
}
