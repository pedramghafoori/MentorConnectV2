import api from './api';

/**
 * Notification schema (server returns these fields)
 * {
 *   _id:        string,
 *   type:       'MENTEE_APPLICATION' | 'APPLICATION_ACCEPTED' | ...,
 *   message:    string,
 *   link?:      string,
 *   read:       boolean,
 *   createdAt:  string,           // ISO date
 *   applicationId?: string        // for action buttons
 * }
 */

/*----------- CRUD wrappers -------------------------------------------*/

// Fetch latest notifications (backend returns newest‑first array)
export const fetchNotifications = () =>
  api.get('/notifications').then(res => res.data);

// Mark ONE notification read
export const markRead = id =>
  api.patch(`/notifications/${id}/read`);

// Mark ALL notifications read
export const markAllRead = () =>
  api.patch('/notifications/read-all');