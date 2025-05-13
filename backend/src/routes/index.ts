import { Router } from 'express';
import authRoutes from './auth.js';
import mentorRoutes from './mentor.js';
import menteeRoutes from './mentee.js';
import { authenticateToken } from '../middleware/auth.js';
import usersRoutes from './users.js';
import courseRoutes from './course.js';
import courseTypeRoutes from './courseType.js';
import opportunityRoutes from './opportunity.js';
import facilityRoutes from './facility.js';
import certificationCategories from './certificationCategories.js';
import accountRoutes from './account.js';
import forumRoutes from './forum.js';
import assignmentRoutes from './assignment.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (no authentication required)
router.use('/auth', authRoutes);

// Protected routes
router.use('/mentor', authenticateToken, mentorRoutes);
router.use('/mentee', authenticateToken, menteeRoutes);
router.use('/users', usersRoutes);
router.use('/courses', courseRoutes);
router.use('/course-types', courseTypeRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/facilities', facilityRoutes);
router.use('/certification-categories', certificationCategories);
router.use('/account', authenticateToken, accountRoutes);

// Forum routes - mounted at /v1/forum
router.use('/v1/forum', forumRoutes);

router.use('/assignments', assignmentRoutes);
router.use('/notifications', notificationRoutes);

export default router; 