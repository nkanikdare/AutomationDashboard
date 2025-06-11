// File: api/index.js

import express from "express";
import cors from "cors";
import { readFile, utils } from "xlsx";
import serverless from "serverless-http";

const app = express();
app.use(cors());

app.get("/data", (_req, res) => {
  try {
    // IMPORTANT: In a serverless environment like Vercel, you may not have access to
    // a network file system. Consider bundling the Excel file with your deployment or hosting it externally.
    const filePath = "//i9996/Dataset/Test/AutomationDetails.xlsx";
    const workbook = readFile(filePath);
    const sheetNames = workbook.SheetNames;

    const data = sheetNames.map((sheetName) => {
      const jsonData = utils.sheet_to_json(workbook.Sheets[sheetName]);
      if (!jsonData.length) return { sheet: sheetName, rows: [] };

      const processedRows = jsonData.map((row) => ({
        release: row["Release"] || "",
        wcBuild: row["WC - Build Number"] || "N/A",
        automationTool: row["Automation Tool"]
          ? row["Automation Tool"].trim()
          : "Unknown",
        passRate: row["Pass Rate"] || 0,
        totalCount: row["Test Case Count"] || 0,
        passed: row["Test Case Pass Count "] || 0,
        initialfailed: row["Initial Failed Count"] || 0,
        failed: row["Test Case Fail Count "] || 0,
        skipped: row["Test Case Skipped Count"] || 0,
        runtime: row["Runtime"] || "",
        runStatus: row["Run Status"] || "",
        serverUrl: row["Server URL"] || "#",
        resultLink: row["Result Link"] || "#"
      }));

      return { sheet: sheetName, rows: processedRows };
    });

    // Log extracted automation tools for debugging
    console.log(
      "Extracted Automation Tools:",
      data.flatMap((sheet) =>
        sheet.rows ? sheet.rows.map((row) => row.automationTool) : []
      )
    );

    res.json(data);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process file" });
  }
});

// Export the wrapped app as a serverless function handler
export const handler = serverless(app);