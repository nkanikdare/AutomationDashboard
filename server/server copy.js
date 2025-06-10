// server/server.js
const express = require("express");
const cors = require("cors");
const xlsx = require("xlsx");

const app = express();
app.use(cors());

// Helper function to trim keys and string values in an object
const trimRowValues = (obj) => {
  const newObj = {};
  for (let key in obj) {
    const newKey = key.trim();
    let value = obj[key];
    if (typeof value === "string") {
      value = value.trim();
    }
    newObj[newKey] = value;
  }
  return newObj;
};

app.get("/data", (req, res) => {
  try {
    // Hard-coded file path for the Excel file (place your file in the ./data folder)
    const filePath = "\\i9996\\Dataset\\Test\\test.xlsx";
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    const data = sheetNames.map((sheetName) => {
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const processedRows = jsonData.map((row) => {
        const tRow = trimRowValues(row);
        // Convert Pass Rate to percentage if provided as a fraction
        const rawPassRate = tRow["Pass Rate"];
        let calculatedPassRate = null;
        if (rawPassRate != null && parseFloat(rawPassRate) < 1) {
          calculatedPassRate = parseFloat((parseFloat(rawPassRate) * 100).toFixed(2));
        } else if (rawPassRate != null) {
          calculatedPassRate = parseFloat(parseFloat(rawPassRate).toFixed(2));
        }
        return {
          release: tRow["Release"] || "",
          wcBuild: tRow["WC - Build Number"] || "N/A",
          passRate: calculatedPassRate,
          totalCount: tRow["Test Case Count"] ? parseInt(tRow["Test Case Count"], 10) : 0,
          passed: tRow["Test Case Pass Count"] ? parseInt(tRow["Test Case Pass Count"], 10) : 0,
          failed: tRow["Test Case Fail Count"] ? parseInt(tRow["Test Case Fail Count"], 10) : 0,
          skipped: tRow["Test Case Skipped Count"] ? parseInt(tRow["Test Case Skipped Count"], 10) : 0,
          runStatus: tRow["Run Status"] || "",
          runtime: tRow["Runtime"] || "",
          serverUrl: tRow["Server URL"] || "#",
          resultLink: tRow["Result Link"] || "#",
        };
      });
      return { sheet: sheetName, rows: processedRows };
    });
    
    console.log("Processed Data:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process file" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));