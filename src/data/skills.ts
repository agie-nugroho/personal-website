export type SkillGroup = {
  label: string;
  note: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    label: "Programming",
    note: "Querying and scripting the analysis",
    items: ["SQL", "Python"],
  },
  {
    label: "Analytics",
    note: "From raw records to a defensible answer",
    items: [
      "Data cleaning",
      "Data validation",
      "Data wrangling",
      "Exploratory data analysis",
      "Statistical analysis",
      "Reporting",
    ],
  },
  {
    label: "Visualisation & BI",
    note: "Dashboards people actually read",
    items: ["Power BI", "Tableau", "Microsoft Excel", "Pivot tables"],
  },
  {
    label: "Python libraries",
    note: "The everyday analysis stack",
    items: ["Pandas", "NumPy", "Matplotlib", "Scikit-learn (basic)", "Seaborn"],
  },
  {
    label: "Databases",
    note: "Where the data lives",
    items: ["SQL Server", "MySQL"],
  },
  {
    label: "Web & tooling",
    note: "From the Coding Camp capstone",
    items: ["Git", "GitHub", "HTML", "CSS", "JavaScript", "Node.js", "REST APIs"],
  },
];

export const stats = [
  { value: 50, suffix: "+", label: "Survey datasets processed at BPS" },
  { value: 3.8, suffix: "/4.00", label: "GPA, Mathematics — Unsoed", decimals: 2 },
  { value: 10, suffix: "+", label: "Academic data projects completed" },
  { value: 900, suffix: "+", label: "Hours of full-stack training" },
];
