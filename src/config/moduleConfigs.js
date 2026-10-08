export const moduleConfigs = {
  facultyDetails: {
    title: "Faculty Details", collection: "facultyDetails",
    columns: [
      { key: "department", label: "Department", type: "text" },
      { key: "ugcAssistantProfessorP", label: "UGC Assistant Professor P", type: "number" },
      { key: "ugcAssociateProfessorP", label: "UGC Associate Professor P", type: "number" },
      { key: "ugcProfessorP", label: "UGC Professor P", type: "number" },
      { key: "sanctionedAssistantProfessorP", label: "Sanctioned Assistant Professor P", type: "number" },
      { key: "sanctionedAssistantProfessorT", label: "Sanctioned Assistant Professor T", type: "number" },
      { key: "sanctionedAssociateProfessorP", label: "Sanctioned Associate Professor P", type: "number" },
      { key: "sanctionedAssociateProfessorT", label: "Sanctioned Associate Professor T", type: "number" },
      { key: "sanctionedProfessorP", label: "Sanctioned Professor P", type: "number" },
      { key: "sanctionedProfessorT", label: "Sanctioned Professor T", type: "number" },
      { key: "filledAssistantProfessorP", label: "Filled Assistant Professor P", type: "number" },
      { key: "filledAssistantProfessorT", label: "Filled Assistant Professor T", type: "number" },
      { key: "filledAssociateProfessorP", label: "Filled Associate Professor P", type: "number" },
      { key: "filledAssociateProfessorT", label: "Filled Associate Professor T", type: "number" },
      { key: "filledProfessorP", label: "Filled Professor P", type: "number" },
      { key: "filledProfessorT", label: "Filled Professor T", type: "number" },
      { key: "vacantAssistantProfessorP", label: "Vacant Assistant Professor P", type: "computed" },
      { key: "vacantAssistantProfessorT", label: "Vacant Assistant Professor T", type: "computed" },
      { key: "vacantAssociateProfessorP", label: "Vacant Associate Professor P", type: "computed" },
      { key: "vacantAssociateProfessorT", label: "Vacant Associate Professor T", type: "computed" },
      { key: "vacantProfessorP", label: "Vacant Professor P", type: "computed" },
      { key: "vacantProfessorT", label: "Vacant Professor T", type: "computed" },
      { key: "recruitmentStatus", label: "Recruitment Status", type: "select", options: [["Ongoing", "Ongoing"], ["To be start", "To be started"], ["Subjudiced", "Subjudiced/Withheld"]] },
      { key: "remarks", label: "Remarks", type: "text", required: false },
    ],
  },
  enrollment: { title: "Enrollment", collection: "enrollment", columns: [
    { key: "courseProgram", label: "Course / Program", type: "text" }, { key: "totalStudents", label: "Total Students", type: "number" },
    { key: "maleStudents", label: "Male Students", type: "number" }, { key: "femaleStudents", label: "Female Students", type: "number" }, { key: "otherStudents", label: "Other Students", type: "number" },
  ]},
  tnp: { title: "Training and Placement", collection: "TnP", columns: [
    { key: "nameOfEmployer", label: "Name of Employer", type: "text" }, { key: "cityState", label: "City / State", type: "text" }, { key: "dateOfPlacement", label: "Date of Placement", type: "date" }, { key: "numberOfStudentsPlaced", label: "Students Placed", type: "number" }, { key: "designation", label: "Designation", type: "text" }, { key: "package", label: "Package", type: "number" }, { key: "remark", label: "Remark", type: "text", required: false },
  ]},
  achievements: { title: "Achievements", collection: "achievements", columns: [
    { key: "name", label: "Faculty Name", type: "text" }, { key: "category", label: "Category", type: "select", options: [["Award", "Award"], ["Patent", "Patent (Indian)"], ["State-Project", "State Govt Project"], ["Gov-Project", "Central Govt Project"], ["Private-Project", "Private Project"], ["Thesis", "Thesis"], ["National-Publication", "National J. Publication"], ["International-Publication", "International J. Publication"], ["Journal", "Conference Attended"], ["Seminar", "Seminar / Workshop"], ["Conference", "Conference / Seminar / FDP Organized"]] }, { key: "number", label: "Number", type: "number" }, { key: "details", label: "Details", type: "text" },
  ]},
  trainingPrograms: { title: "Training Programs", collection: "training", columns: [
    { key: "courseProgram", label: "Training For", type: "select", options: [["faculty", "Faculty"], ["student", "Student"], ["staff", "Staff"]] }, { key: "nameOfTraining", label: "Name of Training", type: "text" }, { key: "duration", label: "Duration", type: "number" }, { key: "startDate", label: "Start Date", type: "date" }, { key: "closingDate", label: "Closing Date", type: "date" }, { key: "numberOfParticipants", label: "Participants", type: "number" }, { key: "expenditure", label: "Expenditure", type: "number" }, { key: "sponsoredBy", label: "Sponsored By", type: "text" },
  ]},
  budget: { title: "Budget", collection: "budget", columns: [
    { key: "session", label: "Financial Year", type: "select", options: [["2020-21", "2020-21"], ["2021-22", "2021-22"], ["2022-23", "2022-23"], ["2023-24", "2023-24"], ["2024-25", "2024-25"], ["2025-26", "2025-26"], ["2026-27", "2026-27"]] }, { key: "allocation", label: "Allocation", type: "number" }, { key: "internalRevenue", label: "Internal Revenue Generation", type: "number" }, { key: "total", label: "Total", type: "computed" }, { key: "expenditure", label: "Expenditure", type: "number" }, { key: "surplus", label: "Surplus", type: "computed" }, { key: "deficit", label: "Deficit", type: "computed" },
  ]},
  mou: { title: "MoU", collection: "mou", columns: [
    { key: "type", label: "Type", type: "select", options: [["national", "National"], ["international", "International"]] }, { key: "purpose", label: "Purpose", type: "text" }, { key: "organizationName", label: "Organization Name", type: "text" }, { key: "executionDate", label: "Execution Date", type: "date" }, { key: "expiryDate", label: "Expiry Date", type: "date" }, { key: "status", label: "Status", type: "computed" }, { key: "outcome", label: "Outcome", type: "text" },
  ]},
};

export function calculateBudget(row) {
  const allocation = Number(row.allocation || 0), internalRevenue = Number(row.internalRevenue || 0), expenditure = Number(row.expenditure || 0);
  const total = allocation + internalRevenue, difference = total - expenditure;
  return { total, surplus: Math.max(difference, 0), deficit: Math.max(-difference, 0) };
}

export function calculateMouStatus(row) {
  if (!row.executionDate) return "";
  if (!row.expiryDate) return "Active";
  const execution = new Date(`${row.executionDate}T00:00:00`), expiry = new Date(`${row.expiryDate}T23:59:59`), now = new Date();
  if (expiry < execution) return "Invalid dates";
  return now >= execution && now <= expiry ? "Active" : "Inactive";
}

export function calculateFacultyVacancies(row) {
  const pairs = [
    ["AssistantProfessorP", "vacantAssistantProfessorP"], ["AssistantProfessorT", "vacantAssistantProfessorT"],
    ["AssociateProfessorP", "vacantAssociateProfessorP"], ["AssociateProfessorT", "vacantAssociateProfessorT"],
    ["ProfessorP", "vacantProfessorP"], ["ProfessorT", "vacantProfessorT"],
  ];
  return Object.fromEntries(pairs.map(([suffix, key]) => [key, Math.max(0, Number(row[`sanctioned${suffix}`] || 0) - Number(row[`filled${suffix}`] || 0))]));
}
