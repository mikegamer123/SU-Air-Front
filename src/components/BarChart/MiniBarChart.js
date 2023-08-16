import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const MiniBarChart = ({miniChartData}) => {
    const miniChartRef = useRef(null);

    useEffect(() => {
        if (miniChartRef.current) {
            const ctx = miniChartRef.current.getContext("2d");

            const myChart = new Chart(ctx, miniChartData);

            // When the component unmounts
            return () => {
                myChart.destroy();
            };
        }
    }, []);

    return (
        <div className="chart-container">
            <div className="pt-0 rounded-xl">
                <canvas ref={miniChartRef}></canvas>
            </div>
        </div>
    );
};

export default MiniBarChart;
