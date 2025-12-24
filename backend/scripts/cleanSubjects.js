import fs from "fs";

const rawText = fs.readFileSync("rawSubject.txt", "utf-8");

// Split by lines (your data is line-based, no need for complex normalization)
const lines = rawText
  .split("\n")
  .map(line => line.trim())
  .filter(line => line.length > 0);

const subjects = [];

for (const line of lines) {
  /**
   * Example line:
   * 1 21B12CS319 FUNDAMENTALS OF SOFT COMPUTING E DE-2 Regular 1 3.0
   */

  // Split using " E "
  const [leftPart, rightPart] = line.split(" E ");

  if (!rightPart) continue; // safety

  // Extract type (DE-2, DE-3, HSS-3, etc.)
  const type = rightPart.split(" ")[0].trim();

  // Left part: remove serial number + subject code
  // "1 21B12CS319 FUNDAMENTALS OF SOFT COMPUTING"
  const name = leftPart
    .replace(/^\d+\s+/, "")   // remove serial number
    .replace(/^\S+\s+/, "")   // remove subject code
    .trim();

  subjects.push({
    name,
    type,
    semester: 6,
    campus: "both"
  });
}

// Write JSON
fs.writeFileSync(
  "subjects.json",
  JSON.stringify(subjects, null, 2)
);

console.log(`✅ Extracted ${subjects.length} subjects`);
