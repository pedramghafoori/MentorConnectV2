import PropTypes from "prop-types";
import "./PathwayStepper.css";

/**
 * Vertical stepper that renders a full prerequisite chain as a vertical tree.
 * Each step alternates left/right of a central vertical line, with step number and details.
 */
export default function PathwayStepper({ path, missingIndex, awardNames }) {
  const currentIdx = missingIndex === -1 ? path.length - 1 : missingIndex - 1;

  return (
    <div className="vertical-stepper">
      <div className="vertical-stepper-line" />
      {path.map((code, idx) => {
        const state =
          idx < missingIndex || missingIndex === -1
            ? idx === currentIdx
              ? "current"
              : "done"
            : "todo";
        const isLeft = idx % 2 === 0;
        return (
          <div key={code} className={`vertical-stepper-row ${isLeft ? "left" : "right"}`}>
            <div className={`vertical-stepper-card ${state}`}>
              <div className="vertical-stepper-stepnum">Step {idx + 1}</div>
              <div className="vertical-stepper-title">{awardNames[code] || code}</div>
              {state === "current" && <span className="vertical-stepper-badge">YOU ARE HERE</span>}
              <div className="vertical-stepper-details">Details about this step...</div>
            </div>
            <div className="vertical-stepper-dot" />
          </div>
        );
      })}
    </div>
  );
}

PathwayStepper.propTypes = {
  path: PropTypes.arrayOf(PropTypes.string).isRequired,
  missingIndex: PropTypes.number.isRequired,
  awardNames: PropTypes.object.isRequired,
};