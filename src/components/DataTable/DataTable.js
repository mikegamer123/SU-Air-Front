import React, {useCallback, useEffect, useState} from "react";
import DataTable,{ createTheme } from "react-data-table-component"
import styles from './DataTable.module.css';
import {convertTimestampToDate, formatDate} from "@/dateHelper";
import {BASE_API_URL} from "@/config";
import {showToast} from "@/toastHelper";

let selectedFavorites = [];

const DataTableComponent = ({dataTableData, filters}) => {

    const [userFavorites, setUserFavorites] = useState([]);

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
            selector: row => filters.model_name === "Hour" ? convertTimestampToDate(row.time_stamp) : formatDate(row.time_stamp),
            sortable: true,
            format: row => filters.model_name === "Hour" ? convertTimestampToDate(row.time_stamp) : formatDate(row.time_stamp),
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

    useEffect(() => {
        //get favorites for user
        fetch(BASE_API_URL + '/AQI/get/user-favorites/'+filters.model_name, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            }
        })
            .then(response => response.json())
            .then(data => {
                setUserFavorites(data);
                selectedFavorites = [];
                data.forEach((row) => {
                    selectedFavorites.push(row);
                });
            });
    }, [filters]);

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


    function saveFavorites() {

        const formattedData = {};
        const deleteData = {};
        selectedFavorites.forEach(row => {
                if (!formattedData["itemID"]) {
                    formattedData["itemID"] = [];
                }
                formattedData["itemID"].push(row.id);
        });

        userFavorites.forEach(row => {
            if (!deleteData["itemID"]) {
                deleteData["itemID"] = [];
            }
            deleteData["itemID"].push(row._id);
        });

        fetch(BASE_API_URL + '/AQI/favorite'+filters.model_name, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            },
            body: JSON.stringify(deleteData)
        })
            .then(response => response.json())
            .then(data => {
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
                    })
                    .catch(error => {
                        showToast("Greška u čuvanju!<br>" + error, "error")
                    });
            })
            .catch(error => {
                showToast("Greška u brisanju!<br>" + error, "error")
            });
    }


    const handleSelectedRowsChange = useCallback((state) => {
        selectedFavorites = [];
        state.selectedRows.forEach((row) => {
            selectedFavorites.push(row);
        });
    }, []);

    return (
        <div className={styles.dataTable}>
            <div className={styles.dataTableInner}>
                <button className={styles.saveFavoritesButton + " hoverButton"} onClick={saveFavorites}>Sačuvaj favorite 💕</button>
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
            selectableRowSelected={(row) => userFavorites.map((selected) => selected._id).includes(row.id)}
            contextMessage={customTranslations}
            theme="suAirTheme"
        />
            </div>
        </div>
    );
}

export default DataTableComponent;