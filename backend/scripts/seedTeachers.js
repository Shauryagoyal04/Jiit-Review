import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { Teacher } from "../src/models/teacher.model.js";
import connectDB from "../src/config/db.js";

dotenv.config({ path: "./.env" });

const seedTeachers = async () => {
  try {
    await connectDB();

    const data = JSON.parse(
      fs.readFileSync("./cleanedTeachers.json", "utf-8")
    );

    let inserted = 0;

    for (const teacher of data) {
      try {
        await Teacher.create(teacher);
        inserted++;
      } catch (err) {
        // Ignore duplicates
        if (err.code !== 11000) {
          console.error("Error inserting:", teacher.name);
        }
      }
    }

    console.log(`✅ Teachers inserted: ${inserted}`);
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedTeachers();
