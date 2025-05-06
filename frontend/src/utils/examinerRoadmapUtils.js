// Examiner Roadmap – shared helpers
// -------------------------------------------------
// This file stays super-small: no React hooks, just utilities.

import getExaminerNextSteps from "./getExaminerNextSteps";

// ----- Canonical award codes -----
export const AWARDS = {
  BM:     "Bronze Medallion",
  BC:     "Bronze Cross",
  SFA:    "Standard First Aid",
  LSI:    "Lifesaving Instructor",
  NL:     "National Lifeguard (Pool)",
  NLI:    "National Lifeguard Instructor",
  FAI:    "First Aid Instructor",

  EX_BR:  "Bronze Examiner",
  EX_FA:  "First Aid Examiner",
  EX_NL:  "National Lifeguard Examiner",
};

// ----- Full prerequisite pathways -----
export const STREAMS = {
  bronze: {
    label: "Bronze Examiner",
    path : ["BM", "BC", "SFA", "LSI", "EX_BR"],
  },
  firstAid: {
    label: "First Aid Examiner",
    path : ["SFA", "FAI", "EX_FA"],
  },
  nl: {
    label: "National Lifeguard Examiner",
    path : ["BM", "BC", "SFA", "NL", "LSI", "NLI", "EX_NL"],
  },
};

/** Convert status → badge text */
export function badgeLabel(status) {
  switch (status) {
    case "complete":
      return "✓ Complete";
    case "missing_instructor":
      return "Instructor Needed";
    case "need_examiner_course":
      return "Next: Examiner";
    default:
      return "";
  }
}

/** **bold** → <strong>bold</strong>  (tiny helper) */
export function markdownToHtml(str = "") {
  return str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export { getExaminerNextSteps };