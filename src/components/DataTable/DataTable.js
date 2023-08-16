import React from "react";
import DataTable from "react-data-table-component"

const DataTableComponent = () => {
    const columns = [
        {
            name: 'ID',
            selector: 'id',
            sortable: true,
        },
        {
            name: 'Name',
            selector: 'name',
            sortable: true,
        },
        {
            name: 'Age',
            selector: 'age',
            sortable: true,
        },
    ];

    const data = [
        { id: 1, name: 'John Doe', age: 28 },
        { id: 2, name: 'Jane Smith', age: 35 },
        { id: 3, name: 'Bob Johnson', age: 42 },
        // Add more data rows as needed
    ];

        return (
            <DataTable
                title="Istorijski podatci"
                columns={columns}
                data={data}
                pagination
                highlightOnHover
                striped
            />
        );
}

export default DataTableComponent;