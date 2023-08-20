import React, {useState} from "react";
import DataTable,{ createTheme } from "react-data-table-component"
import styles from './DataTable.module.css';
import {convertTimestampToDate, formatDate} from "@/dateHelper";
import {BASE_API_URL} from "@/config";
import {showToast} from "@/toastHelper";

const DataTableComponent = ({dataTableData, filters}) => {

    const [selectedRows, setSelectedRows] = useState([]);

    createTheme(
        'suAirTheme',
        {
            text: {
                primary: '#009988',
                secondary: '#009988',
            },
            background: {
                default: '#ffffff',
            },
            context: {
                background: '#009988',
                text: '#FFFFFF',
            },
            divider: {
                default: '#009988',
            },
            button: {
                default: '#009988',
                hover: 'rgba(0,0,0,.08)',
                focus: 'rgba(255,255,255,.12)',
                disabled: 'rgba(255, 255, 255, .34)',
            },
            sortFocus: {
                default: '#009988',
            },
        },
    );

    const columns = [
        {
            name: 'Id',
            selector: 'id',
            sortable: true,
            omit: true,
            reorder: true
        },
        {
            name: 'Datum',
            selector: row => filters.model_name == "Hour" ? convertTimestampToDate(row.time_stamp) : formatDate(row.time_stamp),
            sortable: true,
            format: row => filters.model_name == "Hour" ? convertTimestampToDate(row.time_stamp) : formatDate(row.time_stamp),
            reorder: true
        },
        {
            name: 'Stanica',
            selector: row => row.name,
            sortable: true,
            reorder: true
        },
        {
            name: 'Temperatura',
            selector: row => row.temperature,
            sortable: true,
            reorder: true
        },
        {
            name: 'Vlažnost',
            selector: row => row.humidity,
            sortable: true,
            reorder: true
        },
        {
            name: 'Pritisak',
            selector: row => row.air_pressure,
            sortable: true,
            reorder: true
        },
        {
            name: 'PM2.5 AQI',
            selector: row => row.particular_matter_25.aqi_us_ranking,
            sortable: true,
            reorder: true
        },
        {
            name: 'PM2.5 Koncentracija',
            selector: row => row.particular_matter_25.concentration,
            sortable: true,
            reorder: true
        },
        {
            name: 'PM10 AQI',
            selector: row => row.particular_matter_10.aqi_us_ranking,
            sortable: true,
            reorder: true
        },
        {
            name: 'PM10 Koncentracija',
            selector: row => row.particular_matter_10.concentration,
            sortable: true,
            reorder: true
        },
    ];

    const data = dataTableData.map((item) => ({
        id: item._id,
        name: item.name,
        temperature: item.temperature,
        humidity: item.humidity,
        air_pressure: item.air_pressure,
        particular_matter_25: {
            aqi_us_ranking: item.particular_matter_25.aqi_us_ranking,
            concentration: item.particular_matter_25.concentration,
        },
        particular_matter_10: {
            aqi_us_ranking: item.particular_matter_10.aqi_us_ranking,
            concentration: item.particular_matter_10.concentration,
        },
        time_stamp: item.time_stamp,
    }));

    // Custom translation object in Serbian
    const customTranslations = {
        singular : "Red",
        plural: "Reda",
        message: "Izabran/a",
    };

    const handleSelectedRowsChange = (state) => {
            setSelectedRows(state.selectedRows);
    };

    function saveFavorites() {

        const formattedData = {};
        console.log(selectedRows);
        selectedRows.forEach(row => {
                if (!formattedData["itemId"]) {
                    formattedData["itemId"] = [];
                formattedData["itemId"].push(row.id);
            }
        });

        console.log(JSON.stringify(formattedData));

        fetch(BASE_API_URL + '/AQI/favorite'+filters.model_name, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            },
            body: JSON.stringify(formattedData)
        })
            .then(response => response.json())
            .then(data => {
                showToast("Uspešno sačuvani favoriti!")
                console.log(data);
            })
            .catch(error => {
                showToast("Greška u čuvanju!<br>" + error, "error")
            });
    }

    return (
        <div className={styles.dataTable}>
            <div className={styles.dataTableInner}>
                { selectedRows.length > 0 && (<button className={styles.saveFavoritesButton + " hoverButton"} onClick={saveFavorites}>Sačuvaj favorite 💕</button>)}
        <DataTable
            title="Istorijski podatci"
            columns={columns}
            data={data}
            pagination
            highlightOnHover
            striped
            defaultSortFieldId={2}
            defaultSortAsc={false}
            paginationPerPage={25}
            paginationRowsPerPageOptions={[25,50,75,100]}
            selectableRows
            onSelectedRowsChange={handleSelectedRowsChange}
            selectedRows={selectedRows}
            contextMessage={customTranslations}
            theme="suAirTheme"
        />
            </div>
        </div>
    );
}

export default DataTableComponent;