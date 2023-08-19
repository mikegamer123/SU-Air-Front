import Navbar from "../components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer";
import DataTableComponent from "@/components/DataTable/DataTable";
import {useEffect, useState} from "react";
import {BASE_API_URL} from "@/config";
import {getFirstDayOfNextMonth, getFirstDayOfPreviousTwoMonths} from "@/dateHelper";

export default function History() {

    const [domLoaded, setDomLoaded] = useState(false);
    const [dataTableData, setDataTableData] = useState([]);
    //load datatable only on client side because of hydration errors
    useEffect(() => {
        setDomLoaded(true);
    }, []);

    useEffect(() => {
        const url = new URL(BASE_API_URL + '/AQI/search');
        url.searchParams.append('model_name', 'Day');
        url.searchParams.append('start_date', getFirstDayOfPreviousTwoMonths());
        url.searchParams.append('end_date', getFirstDayOfNextMonth());
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
                setDataTableData(jsonData);
            })
    }, []);

    return (
        <>
        <Navbar/>
            {domLoaded &&(
            <div className="dataTableContainer">
                 <DataTableComponent dataTableData={dataTableData}/>
            </div>
            )}
        <Footer/>
        </>
    )
}
