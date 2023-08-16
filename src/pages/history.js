import Navbar from "../components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer";
import DataTableComponent from "@/components/DataTable/DataTable";
import {useEffect, useState} from "react";

export default function History() {

    const [domLoaded, setDomLoaded] = useState(false);
    //load datatable only on client side because of hydration errors
    useEffect(() => {
        setDomLoaded(true);
    }, []);

    return (
        <>
        <Navbar/>
            {domLoaded &&(
            <div className="dataTableContainer">
                 <DataTableComponent/>
            </div>
            )}
        <Footer/>
        </>
    )
}
