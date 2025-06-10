// src/ThreeDBarChart.js
import React from 'react';
import Plot from 'react-plotly.js';

const createBar3D = (x0, y0, z0, dx, dy, dz, color, name) => {
  // Define the eight vertices of a cuboid.
  const xs = [x0, x0 + dx, x0 + dx, x0, x0, x0 + dx, x0 + dx, x0];
  const ys = [y0, y0, y0 + dy, y0 + dy, y0, y0, y0 + dy, y0 + dy];
  const zs = [z0, z0, z0, z0, z0 + dz, z0 + dz, z0 + dz, z0 + dz];
  // Define the 12 triangles (via indices) composing the cuboid.
  const i = [0, 0, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3];
  const j = [1, 2, 5, 6, 1, 5, 2, 6, 3, 7, 0, 4];
  const k = [2, 3, 6, 7, 5, 4, 6, 5, 7, 6, 4, 7];
  
  return {
    type: 'mesh3d',
    x: xs,
    y: ys,
    z: zs,
    i: i,
    j: j,
    k: k,
    opacity: 0.9,
    color: color,
    name: name,
    flatshading: true,
    showscale: false
  };
};

const ThreeDBarChart = ({ chartData }) => {
  // Assume chartData is an array of objects, where each object has:
  // - wcBuild (used as x-axis label)
  // - totalCount, passed, failed, skipped (numerical values)
  // We'll plot four bars per row (grouped) along the x-axis.
  // Define parameters for bar dimensions:
  const dx = 0.8;
  const dy = 0.8;
  
  // We'll generate one bar (cuboid) trace per metric for each row.
  const traces = [];
  chartData.forEach((row, idx) => {
    const baseX = idx * 4; // space out groups along x-axis
    // Total Count bar at y = 0.
    traces.push(createBar3D(
      baseX, 0, 0,
      dx, dy, row.totalCount,
      '#8e44ad',
      `Total: ${row.totalCount}`
    ));
    // Passed bar at y = 1.2.
    traces.push(createBar3D(
      baseX, 1.2, 0,
      dx, dy, row.passed,
      '#2ecc71',
      `Passed: ${row.passed}`
    ));
    // Failed bar at y = 2.4.
    traces.push(createBar3D(
      baseX, 2.4, 0,
      dx, dy, row.failed,
      '#e74c3c',
      `Failed: ${row.failed}`
    ));
    // Skipped bar at y = 3.6.
    traces.push(createBar3D(
      baseX, 3.6, 0,
      dx, dy, row.skipped,
      '#f39c12',
      `Skipped: ${row.skipped}`
    ));
  });

  // Set x-axis ticks at the middle of each group.
  const xTicks = chartData.map((row, idx) => idx * 4 + dx / 2);
  const xTickLabels = chartData.map(row => row.wcBuild);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Plot
        data={traces}
        layout={{
          title: '3D Bar Chart',
          autosize: true,
          scene: {
            xaxis: {
              title: 'WC - Build Number',
              tickvals: xTicks,
              ticktext: xTickLabels,
            },
            yaxis: {
              title: 'Metrics',
              tickvals: [0.4, 1.6, 2.8, 4.0],
              ticktext: ['Total', 'Passed', 'Failed', 'Skipped'],
            },
            zaxis: {
              title: 'Values',
            },
            camera: {
              eye: { x: 1.8, y: 1.8, z: 1.8 },
            },
          },
          margin: { l: 20, r: 20, b: 50, t: 50 },
          paper_bgcolor: "#f0f0f0",
        }}
        config={{ responsive: true }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default ThreeDBarChart;