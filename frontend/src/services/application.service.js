import api from './api';

/*--------------------------------------------------------------
  Helpers for mentor‑side Accept / Reject actions triggered
  from the notification list.
--------------------------------------------------------------*/

// Accept a mentee’s application (assignmentId = the assignment record)
export const acceptApplication = assignmentId =>
  api.post(`/assignments/${assignmentId}/accept`);

// Reject a mentee’s application
export const rejectApplication = assignmentId =>
  api.post(`/assignments/${assignmentId}/reject`);