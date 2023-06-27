import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const BarChart = () => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");

            const myChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    datasets: [
                        {
                            data: [86, 114, 106, 106, 107, 111, 133],
                            label: "Applied",
                            borderColor: "#3e95cd",
                            backgroundColor: "#7bb6dd",
                            fill: false,
                        },
                        {
                            data: [70, 90, 44, 60, 83, 90, 100],
                            label: "Accepted",
                            borderColor: "#3cba9f",
                            backgroundColor: "#71d1bd",
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        y: {
                            display: false, // Hide Y axis labels
                        },
                        x: {
                            display: false, // Hide X axis labels
                        },
                    },
                },
            });

            // When the component unmounts
            return () => {
                myChart.destroy();
            };
        }
    }, []);

    return (
        <div className="chart-container">
            <div className="pt-0 rounded-xl">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default BarChart;
