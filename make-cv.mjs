// Generates a clean, text-based CV PDF from the content below.
// Run with: node scripts/make-cv.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, "public/cv/agie-nugroho-cv.pdf");

const lines = [
  ["h1", "AGIE NUGROHO"],
  ["", "Data Analyst  |  Bekasi, Indonesia"],
  ["", "+62 878-3801-3523  |  agienugroho1671@gmail.com"],
  ["", "linkedin.com/in/agie-nugroho  |  github.com/agie-nugroho"],
  ["", ""],
  ["h2", "PROFILE"],
  [
    "",
    "Bachelor of Mathematics graduate from Universitas Jenderal Soedirman (GPA 3.80/4.00) with strong",
  ],
  [
    "",
    "analytical thinking and problem-solving skills. Experienced in cleaning, validating and analysing 50+",
  ],
  [
    "",
    "statistical survey datasets during an internship at Statistics Indonesia (BPS) Bekasi City. Proficient in",
  ],
  [
    "",
    "Microsoft Excel, SQL, Python, Power BI and Tableau, with a strong interest in a career in Data Analytics.",
  ],
  [
    "",
    "Demonstrated leadership, teamwork and adaptability through academic, organisational and professional work.",
  ],
  ["", ""],
  ["h2", "WORK EXPERIENCE"],
  ["b", "Badan Pusat Statistik (BPS) Kota Bekasi - Bekasi, Indonesia"],
  ["", "Data Processing Intern  |  Jan 2025 - Feb 2025"],
  [
    "",
    "- Processed, cleaned, validated and managed 50+ statistical survey datasets using Microsoft Excel.",
  ],
  [
    "",
    "- Performed data quality checks to ensure 100% data completeness and consistency to BPS standards.",
  ],
  [
    "",
    "- Assisted in preparing statistical reports to support evidence-based decision making.",
  ],
  [
    "",
    "- Collaborated with supervisors and team members to complete data processing within project deadlines.",
  ],
  ["", ""],
  ["h2", "EDUCATION"],
  ["b", "Universitas Jenderal Soedirman - Purwokerto, Central Java"],
  ["", "Bachelor of Mathematics  |  Aug 2022 - Jun 2026  |  GPA 3.80/4.00"],
  [
    "",
    "- Completed an internship at Statistics Indonesia (BPS), processing and validating 50+ survey datasets.",
  ],
  [
    "",
    "- Completed Coding Camp powered by DBS Foundation x Dicoding (Fullstack Web Developer).",
  ],
  [
    "",
    "- Completed 10+ academic projects in statistics, data analysis, regression and mathematical modelling.",
  ],
  [
    "",
    "- Served as Head of the Advocacy Division, leading 4 members and coordinating with 10+ divisions.",
  ],
  ["", ""],
  ["h2", "LEADERSHIP & ORGANISATIONAL EXPERIENCE"],
  [
    "b",
    "Mathematics Student Association (HIMATIKA) - Purwokerto, Central Java",
  ],
  ["", "Head of Advocacy Division  |  Feb 2024 - Jan 2025"],
  ["", "- Led the Advocacy Division consisting of 4 team members."],
  [
    "",
    "- Coordinated with 10+ organisational divisions to execute programs and activities.",
  ],
  [
    "",
    "- Organised a Course Selection Socialisation Seminar attended by approximately 150 students.",
  ],
  [
    "",
    "- Oversaw the resolution of student academic and administrative concerns.",
  ],
  ["", "Advocacy Division Staff  |  Feb 2023 - Jan 2024"],
  [
    "",
    "- Managed and responded to 100+ student inquiries and academic concerns.",
  ],
  [
    "",
    "- Assisted in the re-registration process for more than 150 new students.",
  ],
  [
    "",
    "- Acted as a liaison between students and the department on academic and administrative matters.",
  ],
  ["", ""],
  ["h2", "TRAINING, PROJECTS & SKILLS"],
  [
    "b",
    "Coding Camp 2025 powered by DBS Foundation - Fullstack Web Developer (2025)",
  ],
  ["", "- Completed 900+ hours of full-stack web development training."],
  [
    "",
    "- Built web applications with HTML, CSS, JavaScript, Node.js, Express.js, REST APIs and databases.",
  ],
  ["", "- Collaborated on a capstone project using Git and GitHub."],
  ["b", "NutriKidz - AI-Based Child Food Recommendation System (2025)"],
  [
    "",
    "- Built an AI-powered child nutrition recommendation app using Content-Based Filtering and KNN.",
  ],
  [
    "",
    "- Contributed to frontend, backend, API integration and data processing with Flask, MongoDB and Prisma.",
  ],
  ["b", "Hard Skills"],
  [
    "",
    "Microsoft Excel, SQL, Python, Power BI, Tableau, Pandas, NumPy, Matplotlib, basic Machine Learning,",
  ],
  [
    "",
    "data cleaning, exploratory data analysis, statistical analysis, reporting and data visualisation.",
  ],
].filter(
  ([, text], index, all) =>
    !(text === "" && all[index + 1]?.[1] === "" && index > 0),
);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const LINE_HEIGHT = 14;
const FIRST_BASELINE = PAGE_HEIGHT - MARGIN;
const BODY_SIZE = 9.5;
const MAX_CHARS = 98;

const body = lines.map(([style, text]) => ({ style, text }));

// Wrap lines that exceed the printable width.
const wrapped = [];
for (const line of body) {
  if (line.text.length <= MAX_CHARS || line.style === "h1") {
    wrapped.push(line);
    continue;
  }
  const words = line.text.split(" ");
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > MAX_CHARS) {
      wrapped.push({
        ...line,
        text: current.trim(),
        style: line.style === "h2" ? "" : line.style,
      });
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }
  if (current.trim())
    wrapped.push({ ...line, text: current.trim(), style: "" });
}

const perPage = Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT);
const pages = [];
for (let i = 0; i < wrapped.length; i += perPage) {
  pages.push(wrapped.slice(i, i + perPage));
}

const escapeText = (value) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E]/g, "x");

function contentStream(pageLines) {
  const parts = ["BT", `${FIRST_BASELINE.toFixed(2)} Td`, `${LINE_HEIGHT} TL`];
  pageLines.forEach((line, index) => {
    const size =
      line.style === "h1" ? 20 : line.style === "h2" ? 9.5 : BODY_SIZE;
    const font =
      line.style === "h1" || line.style === "h2" || line.style === "b"
        ? "/F2"
        : "/F1";
    if (index > 0) parts.push("T*");
    parts.push(`${font} ${size} Tf`, `(${escapeText(line.text)}) Tj`);
  });
  parts.push("ET");
  return parts.join("\n");
}

const objects = [];
const pageIds = pages.map((_, index) => 3 + index * 2);
const fontRegularId = 3 + pages.length * 2;
const fontBoldId = fontRegularId + 1;

objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

pages.forEach((pageLines, index) => {
  const pageId = pageIds[index];
  const contentId = pageId + 1;
  const stream = contentStream(pageLines);
  objects[pageId] =
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
    `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> ` +
    `/Contents ${contentId} 0 R >>`;
  objects[contentId] =
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`;
});

objects[fontRegularId] =
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
objects[fontBoldId] =
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

let pdf = "%PDF-1.4\n";
const offsets = [0];
for (let id = 1; id < objects.length; id += 1) {
  const chunk = objects[id];
  if (chunk === undefined) continue;
  offsets[id] = Buffer.byteLength(pdf, "latin1");
  pdf += `${id} 0 obj\n${chunk}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, "latin1");
const objectCount = objects.length;
pdf += `xref\n0 ${objectCount}\n0000000000 65535 f \n`;
for (let id = 1; id < objectCount; id += 1) {
  pdf += `${String(offsets[id] ?? 0).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objectCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, Buffer.from(pdf, "latin1"));
console.log(`Wrote ${outPath}`);
