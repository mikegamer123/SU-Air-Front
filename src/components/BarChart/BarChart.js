import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const BarChart = ({chartData}) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");

            const myChart = new Chart(ctx, chartData);

            // When the component unmounts
            return () => {
                myChart.destroy();
            };
        }
    }, [chartData]);

    return (
        <div className="chart-container">
            <div className="pt-0 rounded-xl">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default BarChart;
