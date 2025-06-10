import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./Dashboard.css"; // Custom styles

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip-container">
                <p><strong>Build:</strong> {payload[0].payload["WC - Build Number"]}</p>
                <p><strong>Pass Rate:</strong> {payload[0].value}%</p>
                <p><strong>Test Count:</strong> {payload[1].value}</p>
                <p>
                    <strong>Server:</strong>{" "}
                    <a href={payload[0].payload["Server URL"]} target="_blank" rel="noopener noreferrer">
                        View
                    </a>
                </p>
                <p>
                    <strong>Results:</strong>{" "}
                    <a href={payload[0].payload["Result Link"]} target="_blank" rel="noopener noreferrer">
                        Allure Report
                    </a>
                </p>
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [selectedBuild, setSelectedBuild] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        if (selectedBuild) {
            setFilteredData(data.map(sheet => ({
                ...sheet,
                rows: sheet.rows.filter(row => row["WC - Build Number"] === selectedBuild)
            })));
        } else {
            setFilteredData(data);
        }
    }, [selectedBuild, data]);

    const handleFileUpload = (event) => {
        const formData = new FormData();
        formData.append("file", event.target.files[0]);

        axios.post("http://localhost:5000/upload", formData)
            .then(response => setData(response.data))
            .catch(error => console.error("Error uploading file", error));
    };

    const handleFilterChange = (event) => {
        setSelectedBuild(event.target.value);
    };

    // Debug log to ensure we receive data
    useEffect(() => {
        console.log("Received Data:", data);
    }, [data]);

    return (
        <div className="container my-4">
            <h2 className="text-center text-primary fw-bold">Playwright Automation Dashboard</h2>

            <div className="d-flex justify-content-center my-3">
                <input type="file" className="form-control w-50 shadow-sm" onChange={handleFileUpload} />
            </div>

            <div className="d-flex justify-content-center my-3">
                <select className="form-select w-50 shadow-sm" onChange={handleFilterChange}>
                    <option value="">All Builds</option>
                    {data.length > 0 &&
                        [...new Set(data.flatMap(sheet => sheet.rows.map(row => row["WC - Build Number"])))]
                            .map((build, index) => <option key={index} value={build}>{build}</option>)
                    }
                </select>
            </div>

            {filteredData.length > 0 &&
                filteredData.map((sheet, index) => (
                    <div key={index} className="card my-4 shadow-sm">
                        <div className="card-header bg-dark text-white">
                            <h3 className="text-center">{sheet.sheet}</h3>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={sheet.rows}>
                                    <XAxis dataKey="WC - Build Number" />
                                    <YAxis tickFormatter={(value) => `${value}%`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="Pass Rate" fill="#007bff" radius={[5, 5, 0, 0]} />
                                    <Bar dataKey="Test Case Count" fill="#28a745" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default Dashboard;