export type Experience = {
  period: string;
  title: string;
  org: string;
  location?: string;
  kind: "Education" | "Professional" | "Organization" | "Research";
  summary?: string;
  points: string[];
  tags?: string[];
};

export const experience: Experience[] = [
  {
    period: "Aug 2022 — Jun 2026",
    title: "Bachelor of Mathematics",
    org: "Universitas Jenderal Soedirman",
    location: "Purwokerto, Central Java",
    kind: "Education",
    summary:
      "Graduated with a 3.80 / 4.00 GPA. Coursework across statistics, applied modelling and numerical methods formed the analytical foundation behind every project here.",
    points: [
      "Completed 10+ academic projects in statistics, data analysis, regression and mathematical modelling.",
      "Relevant coursework: statistics, probability, linear algebra, mathematical modelling, numerical methods, operations research and differential equations.",
    ],
    tags: ["GPA 3.80 / 4.00", "Statistics", "Mathematical Modelling"],
  },
  {
    period: "Jan 2025 — Feb 2025",
    title: "Data Processing Intern",
    org: "BPS Kota Bekasi — Statistics Indonesia",
    location: "Bekasi, Indonesia",
    kind: "Professional",
    points: [
      "Processed, cleaned and validated 50+ statistical survey datasets using Microsoft Excel.",
      "Performed data quality checks to ensure 100% completeness and consistency against BPS standards.",
      "Assisted in preparing statistical reports to support evidence-based decision making.",
      "Collaborated with supervisors to deliver data processing tasks within project deadlines.",
    ],
    tags: ["Excel", "Data Validation", "Reporting"],
  },
  {
    period: "Feb 2024 — Jan 2025",
    title: "Head of Advocacy Division",
    org: "HIMATIKA — Mathematics Student Association",
    location: "Purwokerto, Central Java",
    kind: "Organization",
    summary: "Led a division of four members and coordinated with 10+ organisational divisions.",
    points: [
      "Organised a Course Selection Socialisation Seminar with faculty, attended by around 150 students.",
      "Oversaw the resolution of student academic and administrative concerns.",
      "Coordinated with 10+ divisions to execute organisational programs and activities.",
    ],
    tags: ["Leadership", "Programme Management"],
  },
  {
    period: "Feb 2023 — Jan 2024",
    title: "Advocacy Division Staff",
    org: "HIMATIKA — Mathematics Student Association",
    location: "Purwokerto, Central Java",
    kind: "Organization",
    points: [
      "Managed and responded to 100+ student inquiries and academic concerns.",
      "Assisted in the re-registration process for more than 150 new students.",
      "Acted as a liaison between students and the department on academic and administrative matters.",
    ],
    tags: ["Communication", "Student Services"],
  },
  {
    period: "2025 — 2026",
    title: "Undergraduate Thesis — SEAR Model of TikTok Addiction",
    org: "Universitas Jenderal Soedirman",
    kind: "Research",
    summary:
      "Built a SEAR differential-equation model to analyse TikTok addiction among university students, simulated in Python.",
    points: [
      "Applied the Runge–Kutta method and carried out sensitivity analysis on the model.",
      "Simulated and visualised model behaviour with Python.",
    ],
    tags: ["Runge–Kutta", "Sensitivity Analysis", "Python"],
  },
];
