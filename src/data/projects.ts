export type ProjectLink = {
  label: string;
  href: string;
  kind: "code" | "dashboard" | "credential";
};

export type Project = {
  index: string;
  slug: string;
  title: string;
  year: string;
  summary: string;
  problem: string;
  approach: string;
  insight: string;
  tools: string[];
  /** Values used by the technology filter. */
  filters: string[];
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    index: "01",
    slug: "nashville-housing",
    title: "Nashville Housing Data Cleaning",
    year: "2025",
    summary:
      "End-to-end cleaning of the Nashville housing dataset in SQL Server, from messy records to an analysis-ready table.",
    problem:
      "Raw housing records contained missing values, duplicates, and inconsistent date and address formats.",
    approach:
      "Standardised date formats, split address columns, removed duplicate records and handled missing values to produce a consistent, query-ready dataset.",
    insight:
      "Consistent, well-structured data cut downstream analysis time significantly.",
    tools: ["SQL", "SQL Server", "Data Cleaning"],
    filters: ["SQL"],
    links: [
      {
        label: "Source code",
        href: "https://github.com/agie-nugroho/Nashville-Housing-Data-Cleaning/blob/main/Nashville%20Housing%20Data%20Cleaning.sql",
        kind: "code",
      },
    ],
  },
  {
    index: "02",
    slug: "covid-19-exploration",
    title: "COVID-19 Data Exploration",
    year: "2025",
    summary:
      "Exploratory analysis of global COVID-19 datasets with advanced SQL, paired with a published Tableau dashboard.",
    problem:
      "Infection rates, death percentages and vaccination progress across countries had to be compared against large, continuously evolving datasets.",
    approach:
      "Used CTEs, views, aggregate functions and window functions to calculate rolling infection and vaccination metrics for country-level comparison.",
    insight:
      "Window functions made rolling vaccination trends easy to compare across countries in a single query.",
    tools: ["SQL", "CTE", "Window Functions", "Tableau"],
    filters: ["SQL", "Tableau"],
    links: [
      {
        label: "Source code",
        href: "https://github.com/agie-nugroho/COVID-19-Data-Exploration",
        kind: "code",
      },
      {
        label: "Tableau dashboard",
        href: "https://public.tableau.com/app/profile/agie.nugroho/viz/CovidGlobalAnalytics/Dashboard1?publish=yes",
        kind: "dashboard",
      },
    ],
  },
  {
    index: "03",
    slug: "shopping-cart-wrangling",
    title: "Shopping Cart Data Wrangling",
    year: "2025",
    summary:
      "Python preprocessing and exploration of e-commerce shopping cart transactions.",
    problem:
      "Raw transaction data contained missing values and duplicates, and needed new features before it could be analysed.",
    approach:
      "Used Pandas and NumPy for cleaning and feature engineering, then explored purchase patterns visually with Matplotlib.",
    insight:
      "Feature engineering revealed purchase patterns that were not visible in the raw columns.",
    tools: ["Pandas", "NumPy", "Matplotlib"],
    filters: ["Python"],
    links: [
      {
        label: "Source code",
        href: "https://github.com/agie-nugroho/shopping-cart-data-wrangling/tree/main",
        kind: "code",
      },
    ],
  },
  {
    index: "04",
    slug: "healthcare-workforce",
    title: "Healthcare Workforce Analysis in Central Java",
    year: "2022",
    summary:
      "Exploratory data analysis of Central Java Province healthcare workforce data to understand staffing distribution.",
    problem:
      "The available workforce data did not make it clear how healthcare workers were distributed across the province.",
    approach:
      "Cleaned the dataset, performed EDA and feature analysis, and visualised segment characteristics with Pandas and Matplotlib.",
    insight:
      "The analysis mapped where healthcare staffing gaps were most pronounced across the province.",
    tools: ["Pandas", "Matplotlib", "EDA"],
    filters: ["Python"],
    links: [
      {
        label: "Source code",
        href: "https://github.com/agie-nugroho/healthcare-workforce-analysis-python",
        kind: "code",
      },
    ],
  },
  {
    index: "05",
    slug: "fifa-player-analytics",
    title: "FIFA World Cup Player Analytics",
    year: "2025",
    summary:
      "An interactive Excel dashboard comparing player and team performance across World Cup statistics.",
    problem:
      "Player performance is spread across many statistics, making contributions hard to evaluate and compare efficiently.",
    approach:
      "Cleaned and transformed the dataset, then built an interactive Excel dashboard using pivot tables, filtering, aggregation and visualisation of goals, assists, appearances and playing time.",
    insight:
      "Top performers stood out across multiple metrics, and contribution profiles differed clearly between national teams.",
    tools: ["Excel", "Pivot Tables", "Data Visualisation"],
    filters: ["Excel"],
    links: [
      {
        label: "Source code",
        href: "https://github.com/agie-nugroho/Fifa-World-Cup-Player-Analytics",
        kind: "code",
      },
    ],
  },
];

export const projectFilters = ["All", "SQL", "Python", "Excel", "Tableau"] as const;
