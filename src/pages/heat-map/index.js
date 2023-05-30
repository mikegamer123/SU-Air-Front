import Navbar from "src/components/Navbar/Navbar"
import Footer from "src/components/Footer/Footer";
import React, { useEffect, useState } from 'react';

export default function Index() {
    //get district data
    const [districtsData, setDistrictsData] = useState([]);
    useEffect(() => {
        const fetchData = () => {
            fetch('http://localhost:3000/districts/get/all')
                .then(response => response.json())
                .then(data => setDistrictsData(data))
                .catch(error => console.error('Error fetching data:', error));
        };

        fetchData();
    }, []);

    return (
        <>
            <Navbar/>
            <div>
                {/* Render the retrieved data */}
                {districtsData.map((district) => (
                    <div key={district.id}>{district.name}</div>
                ))}
            </div>
            <Footer/>
        </>
    )
}
