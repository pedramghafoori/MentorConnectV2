import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import PathwayStepper from "./PathwayStepper";

import { getCertifications } from "../../features/profile/getCertifications";
import {
  badgeLabel,
  markdownToHtml,
  getExaminerNextSteps,
  STREAMS,
  AWARDS,
} from "../../utils/examinerRoadmapUtils";

import "./ExaminerRoadmap.css";

/**
 * <ExaminerRoadmap />
 * -------------------
 * Props:
 *   • lssId (required) – string ID to fetch certifications
 *   • goal  (optional) – stream key (“nl”, “firstAid”, “bronze”, …) to emphasise
 */
export default function ExaminerRoadmap({ lssId, goal }) {
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lssId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { certifications } = await getCertifications(lssId);
        setSteps(getExaminerNextSteps(certifications));
      } catch (err) {
        console.error(err);
        setError("Could not fetch certifications.");
      } finally {
        setLoading(false);
      }
    })();
  }, [lssId]);

  if (loading) return <p>Loading examiner roadmap…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;
  if (!steps)  return null;

  /* ---------- derive primary + recommended streams ---------- */
  const primaryStep =
    goal && steps[goal] ? { key: goal, ...steps[goal] } : null;

  const recommendedSteps = Object.entries(steps)
    .filter(
      ([k, v]) => k !== goal && v.status === "need_examiner_course"
    )
    .map(([k, v]) => ({ key: k, ...v }));

  /* --------------------------- UI --------------------------- */
  return (
    <>
      {primaryStep && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Your Selected Goal</h2>
          {/* full pathway bar */}
          <PathwayStepper
            path={STREAMS[goal || "nl"].path}          // use chosen stream
            missingIndex={primaryStep.missingIndex}
            awardNames={AWARDS}
          />
          <div className={`roadmap-card primary-goal status-${primaryStep.status}`}>
            <header>
              <h3>{primaryStep.label}</h3>
              <span className="badge">{badgeLabel(primaryStep.status)}</span>
            </header>

            <p
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(primaryStep.message),
              }}
            />

            {primaryStep.status !== "complete" && (
              <button className="action-btn">Book Course</button>
            )}
          </div>
        </section>
      )}

      {recommendedSteps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">You’re Also Ready For</h2>
          <div className="examiner-roadmap">
            {recommendedSteps.map((step) => (
              <div key={step.key} className={`roadmap-card status-${step.status}`}>
                <header>
                  <h3>{step.label}</h3>
                  <span className="badge">{badgeLabel(step.status)}</span>
                </header>

                <p
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(step.message),
                  }}
                />

                <button className="action-btn">Book Course</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* fallback – show everything when no goal picked */}
      {!primaryStep && recommendedSteps.length === 0 && (
        <div className="examiner-roadmap">
          {Object.values(steps).map((step) => (
            <div key={step.label} className={`roadmap-card status-${step.status}`}>
              <header>
                <h3>{step.label}</h3>
                <span className="badge">{badgeLabel(step.status)}</span>
              </header>

              <p
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(step.message),
                }}
              />

              {step.status !== "complete" && (
                <button className="action-btn">Book Course</button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

ExaminerRoadmap.propTypes = {
  lssId: PropTypes.string.isRequired,
  goal : PropTypes.string,
};