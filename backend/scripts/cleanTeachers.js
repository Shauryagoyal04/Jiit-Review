import fs from "fs";

const rawText = fs.readFileSync("./rawTeachers.txt", "utf-8");
const lines = rawText.split("\n");

const cleaned = [];

for (const line of lines) {
  const trimmed = line.trim();

  // Skip headers & empty lines
  if (
    !trimmed ||
    trimmed.startsWith("JIIT") ||
    trimmed.startsWith("S.")
  ) {
    continue;
  }

  // Only real faculty rows
  if (!/^\d+\s+JIIT/i.test(trimmed)) continue;

  const parts = trimmed.split(/\s+/);

  // Find gender index (M or F)
  const genderIndex = parts.findIndex(
    (p) => p === "M" || p === "F"
  );

  if (genderIndex === -1) continue; // safety

  // Name = everything between empCode and gender
  const name = parts.slice(2, genderIndex).join(" ");

  const department = parts[genderIndex + 1];

  // Qualification is second last token (before REGULAR/CONTRACT)
  const qualificationIndex = parts.length - 2;
  const highestQualification = parts[qualificationIndex];

  // Designation = between department and qualification
  const designation = parts
    .slice(genderIndex + 2, qualificationIndex)
    .join(" ");

  cleaned.push({
    name,
    department,
    designation,
    highestQualification
  });
}

fs.writeFileSync(
  "cleanedTeachers.json",
  JSON.stringify(cleaned, null, 2)
);

console.log(`Cleaned ${cleaned.length} teachers`);
console.log("Output written to cleanedTeachers.json");
