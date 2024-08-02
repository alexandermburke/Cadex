'use client'
import React from 'react';
import { Bar } from 'react-chartjs-2';

const data = {
    labels: ['Before Cadex AI', 'After Cadex AI'],
    datasets: [
        {
            label: 'Success Rate (%)',
            data: [60, 90],
            backgroundColor: ['#ffcc00', '#ff9900'],
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Impact of Cadex AI on Legal Practice Success Rate',
        },
    },
};

export default function ChartComponent() {
    return <Bar data={data} options={options} />;
}
