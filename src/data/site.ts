import { withBase } from "../lib/paths";

export const site = {
  name: "Agie Nugroho",
  firstName: "Agie",
  initials: "AN",
  role: "Data Analyst",
  headline: "I turn raw data into decisions.",
  email: "agienugroho1671@gmail.com",
  phone: "+62 878-3801-3523",
  location: "Bekasi, Indonesia",
  github: "https://github.com/agie-nugroho",
  linkedin: "https://www.linkedin.com/in/agie-nugroho/",
  /** Drop the original CV here to replace the generated copy in public/. */
  cv: withBase("/cv/agie-nugroho-cv.pdf"),
  availability: "Open to data analyst roles",
  description:
    "Agie Nugroho is a Data Analyst and Mathematics graduate from Universitas Jenderal Soedirman working with SQL, Python, Power BI, Tableau and Excel to turn raw data into decisions.",
} as const;

export const nav = [
  { id: "about", label: "About", index: "01" },
  { id: "skills", label: "Skills", index: "02" },
  { id: "experience", label: "Experience", index: "03" },
  { id: "work", label: "Work", index: "04" },
  { id: "certifications", label: "Certifications", index: "05" },
  { id: "contact", label: "Contact", index: "06" },
] as const;

export const marquee = [
  "SQL",
  "Python",
  "Power BI",
  "Tableau",
  "Microsoft Excel",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "SQL Server",
  "MySQL",
  "Git",
  "Data Visualization",
] as const;
