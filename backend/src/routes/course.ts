import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';

const router = Router();

// All course routes require authentication
router.use(authenticateToken);

// Create a new course
router.post('/', createCourse);

// Get all courses (with optional filtering)
router.get('/', getCourses);

// Get a specific course by ID
router.get('/:id', getCourseById);

// Update a course
router.put('/:id', updateCourse);

// Partial update a course
router.patch('/:id', updateCourse);

// Delete a course
router.delete('/:id', deleteCourse);

export default router; 