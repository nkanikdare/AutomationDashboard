// src/Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Filter data based on the selected release.
  useEffect(() => {
    if (selectedRelease) {
      setFilteredData(
        data.map((sheet) => ({
          ...sheet,
          rows: sheet.rows.filter((row) => row.release === selectedRelease),
        }))
      );
    } else {
      setFilteredData(data);
    }
  }, [selectedRelease, data]);

  // Handle file upload and send to the backend.
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    axios
      .post("http://localhost:5006/upload", formData)
      .then((response) => {
        console.log("File upload response data:", response.data);
        setData(response.data);
      })
      .catch((error) => console.error("Error uploading file", error));
  };

  // Handle release filter change.
  const handleFilterChange = (event) => {
    setSelectedRelease(event.target.value);
  };

  return (
    <>
      {/* Main Dashboard Container */}
      <div className="container">
        {/* Header with Title */}
        <div className="header-wrapper">
          <h2 className="dashboard-title">Playwright Automation Dashboard</h2>
        </div>

        {/* File Upload Section */}
        <div className="d-flex justify-content-center my-3">
          <input
            type="file"
            className="form-control w-50 shadow-sm"
            onChange={handleFileUpload}
          />
        </div>

        {/* Release Filter Dropdown */}
        <div className="d-flex justify-content-center my-3">
          <select className="form-select w-50 shadow-sm" onChange={handleFilterChange}>
            <option value="">All Releases</option>
            {data.length > 0 &&
              [...new Set(data.flatMap((sheet) =>
                sheet.rows.map((row) => row.release)
              ))].map((release, index) => (
                <option key={index} value={release}>
                  {release}
                </option>
              ))}
          </select>    
          &nbsp;
          &nbsp;   
          &nbsp;
          &nbsp;
          <div className="toggle-button">
            <input type="checkbox" id="themeToggle" onChange={() => document.body.classList.toggle('dark-mode')} />Dark Mode
            <label htmlFor="themeToggle"></label>
          </div>
        </div>

        {/* Render Each Sheet */}
        {filteredData &&
          filteredData.length > 0 &&
          filteredData.map((sheet, sheetIndex) => (
            <div key={sheetIndex} className="card my-4 shadow-sm">
              <div className="card-header">{sheet.sheet}</div>
              <div className="card-body">
                {/* Chart Section */}
                {sheet.rows && sheet.rows.length > 0 && (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart
                        data={sheet.rows}
                        margin={{ top: 40, right: 0, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#bdc3c7" />
                        <XAxis dataKey="wcBuild" stroke="#000000" style={{ fill: "#2e7d32", fontSize: "14px", fontWeight: "bold" }} />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          stroke="#00897b"
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis yAxisId="right" orientation="right" stroke="#2e7d32" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#f9f9f9",
                            border: "none",
                            borderRadius: 20,
                          }}
                          wrapperStyle={{ fontSize: "16px" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "20px" }} verticalAlign="bottom" />
                        {/* Bar for Total Count */}
                        <Bar
                          yAxisId="right"
                          dataKey="totalCount"
                          name="Total Count"
                          fill="#2e7d32"
                          barSize={40}
                          radius={[10, 10, 0, 0]}
                        >
                          <LabelList
                            dataKey="totalCount"
                            position="insideTop"
                            style={{ fill: "#fff", fontSize: "14px", fontWeight: "bold" }}
                          />
                        </Bar>
                        {/* Bar for Passed */}
                        <Bar
                          yAxisId="right"
                          dataKey="passed"
                          name="Passed"
                          fill="#66bb6a"
                          barSize={40}
                          radius={[10, 10, 0, 0]}
                        >
                          <LabelList
                            dataKey="passed"
                            position="insideTop"
                            style={{ fill: "#fff", fontSize: "14px", fontWeight: "bold" }}
                          />
                        </Bar>
                        {/* Bar for Failed */}
                        <Bar
                          yAxisId="right"
                          dataKey="failed"
                          name="Failed"
                          fill="#d32f2f"
                          barSize={40}
                          radius={[10, 10, 0, 0]}
                        >
                          <LabelList
                            dataKey="failed"
                            position="outsideTop"
                            style={{ fill: "#FFF", fontSize: "14px", fontWeight: "bold" }}
                          />
                        </Bar>
                        {/* Bar for Skipped */}
                        <Bar
                          yAxisId="right"
                          dataKey="skipped"
                          name="Skipped"
                          fill="#fbc02d"
                          barSize={40}
                          radius={[10, 10, 0, 0]}
                        >

                        </Bar>
                        {/* Line for Pass Rate */}
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="passRate"
                          name="Pass Rate"
                          stroke="#00897b"
                          strokeWidth={8}
                          dot={{ r: 5, strokeWidth: 4, fill: "#fff" }}
                          activeDot={{ r: 7 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Table Section */}
                {sheet.rows && sheet.rows.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped text-center">
                      <thead>
                        <tr>
                          <th>Release</th>
                          <th>WC - Build Number</th>
                          <th>Pass Rate</th>
                          <th>Test Case Count</th>
                          <th>Passed</th>
                          <th>Failed</th>
                          <th>Skipped</th>
                          <th>Run Status</th>
                          <th>Runtime</th>
                          <th>Server</th>
                          <th>Results</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            <td>{row.release}</td>
                            <td>{row.wcBuild}</td>
                            <td>{row.passRate != null ? `${row.passRate}%` : "N/A"}</td>
                            <td>{row.totalCount}</td>
                            <td>{row.passed}</td>
                            <td>{row.failed}</td>
                            <td>{row.skipped}</td>
                            <td>{row.runStatus}</td>
                            <td>{row.runtime}</td>
                            <td>
                              <a
                                href={row.serverUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                            </td>
                            <td>
                              <a
                                href={row.resultLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Allure Report
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Dashboard;