const express = require("express");
const cors = require("cors");
const xlsx = require("xlsx");

const app = express();
app.use(cors());

app.get("/data", (req, res) => {
  try {
    const filePath = "//i9996/Dataset/Test/test.xlsx"; // Ensure this file exists
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    const data = sheetNames.map((sheetName) => {
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      if (!jsonData.length) return { sheet: sheetName, rows: [] };

      const processedRows = jsonData.map((row) => {
        return {
          release: row["Release"] || "",
          wcBuild: row["WC - Build Number"] || "N/A",
          automationTool: row["Automation Tool"] ? row["Automation Tool"].trim() : "Unknown",
          passRate: row["Pass Rate"] || 0,
          totalCount: row["Test Case Count"] || 0,
          passed: row["Test Case Pass Count "] || 0,
          initialfailed: row["Initial Failed Count"] || 0,
          failed: row["Test Case Fail Count "] || 0,
          skipped: row["Test Case Skipped Count"] || 0,
          runtime: row["Runtime"] || "",
          runStatus: row["Run Status"] || "",
          serverUrl: row["Server URL"] || "#",
          resultLink: row["Result Link"] || "#",
        };
      });

      return { sheet: sheetName, rows: processedRows };
    });

    // ✅ Debugging log for extracted Automation Tools
    console.log("Extracted Automation Tools:", data.flatMap(sheet =>
      sheet.rows ? sheet.rows.map(row => row.automationTool) : []
    ));

    res.json(data); // Send processed data to frontend
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process file" });
  }
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));