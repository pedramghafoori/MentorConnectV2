import { useState } from "react";
import ExaminerRoadmap from "../components/ExaminerRoadmap/ExaminerRoadmap";

export default function TestPager1() {
  const [manualLssId, setManualLssId] = useState("");
  const [submittedLssId, setSubmitted] = useState("");
  const [goal, setGoal] = useState("");

  return (
    <main className="examiner-sandbox-main">
      <h1 className="examiner-sandbox-title">Examiner Roadmap</h1>
      <div className="examiner-sandbox-card">
        <form
          onSubmit={e => {
            e.preventDefault();
            setSubmitted(manualLssId);
          }}
        >
          <label className="examiner-sandbox-label">Goal/Stream</label>
          <select
            value={goal}
            onChange={e => setGoal(e.target.value)}
            className="examiner-sandbox-input"
          >
            <option value="">All Streams</option>
            <option value="firstAid">First Aid Examiner</option>
            <option value="nl">National Lifeguard Examiner</option>
            <option value="bronze">Bronze Examiner</option>
          </select>

          <label className="examiner-sandbox-label" style={{ marginTop: 16 }}>Your LSS ID</label>
          <input
            type="text"
            placeholder="Enter your LSS ID"
            value={manualLssId}
            onChange={e => setManualLssId(e.target.value.trim())}
            className="examiner-sandbox-input"
          />

          <button
            type="submit"
            className="examiner-sandbox-btn"
            disabled={!manualLssId}
          >
            Show Roadmap
          </button>
        </form>
      </div>

      <div className="examiner-sandbox-result">
        {submittedLssId ? (
          <ExaminerRoadmap lssId={submittedLssId} goal={goal || undefined} />
        ) : (
          <div className="examiner-sandbox-placeholder">
            Enter an LSS ID and click "Show Roadmap" to begin.
          </div>
        )}
      </div>
    </main>
  );
}