import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { Subject } from "../src/models/subject.model.js";
import connectDB from "../src/config/db.js";

dotenv.config({ path: "./.env" });

const seedSubject = async () => {
  try {
    await connectDB();

    const data = JSON.parse(
      fs.readFileSync("./subject4SEM.json", "utf-8")
    );

    let inserted = 0;

    for (const subject of data) {
      try {
        await Subject.create(subject);
        inserted++;
      } catch (err) {
        // Ignore duplicates
        if (err.code !== 11000) {
          console.error("Error inserting:", subject.name);
        }
      }
    }

    console.log(`✅ Subject inserted: ${inserted}`);
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedSubject();
