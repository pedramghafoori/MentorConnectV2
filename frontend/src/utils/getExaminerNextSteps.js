/**
 * getExaminerNextSteps (v2 – complete pathways)
 * ---------------------------------------------
 * Walks each stream’s full prerequisite *chain* and tells the UI which
 * award the user should earn next.  Designed around the Lifesaving
 * Society Ontario pathways published on lifesavingsociety.com  [oai_citation:0‡Lifesaving Society](https://www.lifesavingsociety.com/teaching/examiners/national-lifeguard-examiner.aspx) [oai_citation:1‡Lifesaving Society](https://www.lifesavingsociety.com/teaching/examiners/first-aid-examiner.aspx) [oai_citation:2‡Lifesaving Society](https://www.lifesavingsociety.com/teaching/examiners/bronze-examiner.aspx) [oai_citation:3‡Lifesaving Society](https://www.lifesavingsociety.com/teaching/instructors/national-lifeguard-instructor.aspx)
 *
 * Returned shape per stream:
 *   {
 *     label         // e.g. "National Lifeguard Examiner"
 *     status        // "complete" | "next_required"
 *     missingIndex  // index of the first missing award in `path`
 *     nextAwardKey  // award code to earn next (null if complete)
 *     message       // readable string with **bold** award name
 *   }
 *
 * The UI does the rest.
 */

/* ------------------------------------------------------------------ */
/* 1. Canonical award codes                                            */
/* ------------------------------------------------------------------ */

const AWARDS = {
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
  
  /* ------------------------------------------------------------------ */
  /* 2. Stream definitions – FULL pathways                               */
  /* ------------------------------------------------------------------ */
  
  const STREAMS = {
    bronze: {
      label: "Bronze Examiner",
      /** Path:
       *  Bronze Medallion ➜ Bronze Cross ➜ SFA ➜ LSI ➜ Bronze Examiner
       */
      path: ["BM", "BC", "SFA", "LSI", "EX_BR"],
    },
    firstAid: {
      label: "First Aid Examiner",
      /** Path:
       *  SFA ➜ First Aid Instructor ➜ First Aid Examiner
       */
      path: ["SFA", "FAI", "EX_FA"],
    },
    nl: {
      label: "National Lifeguard Examiner",
      /** Path:
       *  BM ➜ BC ➜ SFA ➜ NL ➜ LSI ➜ NLI ➜ NL Examiner
       */
      path: ["BM", "BC", "SFA", "NL", "LSI", "NLI", "EX_NL"],
    },
  };
  
  /* ------------------------------------------------------------------ */
  /* 3. Core function                                                    */
  /* ------------------------------------------------------------------ */
  
  /**
   * @param {Record<string, {hasCredential:boolean}>} certifications
   *        Raw data keyed by award code (exactly as in AWARDS/path)
   */
  export default function getExaminerNextSteps(certifications = {}) {
    const result = {};
  
    Object.entries(STREAMS).forEach(([key, { label, path }]) => {
      // first award the user does NOT have:
      const missingIndex = path.findIndex(
        (code) => !(certifications[code]?.hasCredential)
      );
  
      let status, nextAwardKey, message;
  
      if (missingIndex === -1) {
        status        = "complete";
        nextAwardKey  = null;
        message       = "You’re already fully certified as an Examiner. 🎉";
      } else {
        status        = "next_required";
        nextAwardKey  = path[missingIndex];
        const nice    = AWARDS[nextAwardKey] || nextAwardKey;
        message       = `Earn **${nice}** next.`;
      }
  
      result[key] = {
        label,
        status,
        missingIndex,
        nextAwardKey,
        message,
      };
    });
  
    return result;
  }