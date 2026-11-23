
export const competitionLevels = [
  {
    id: "elementary",
    name: "Elementary",
    grades: "Grades 4–6",
    description: "Build foundational skills and confidence.",
  },
  {
    id: "junior-high",
    name: "Junior High",
    grades: "Grades 7–8",
    description: "Develop advanced skills and strategies.",
  },
  {
    id: "high-school",
    name: "High School",
    grades: "Grades 9–12",
    description: "Master challenging competition material.",
  },
];

export type CompetitionLevel =
  (typeof competitionLevels)[number]["id"];
