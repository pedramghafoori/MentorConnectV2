import { Request, Response } from 'express';
import { Course } from '../models/course.js';

export async function createCourse(req: Request, res: Response) {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify user is a mentor
    if (req.user.role !== 'MENTOR') {
      return res.status(403).json({ message: 'Only mentors can create courses' });
    }

    const { schedule, ...restData } = req.body;
    let courseSchedule;
    
    if (schedule.isExamOnly) {
      courseSchedule = {
        startDate: schedule.examDate,
        endDate: schedule.examDate
      };
    } else {
      const sortedDates = schedule.courseDates.sort((a: Date, b: Date) => new Date(a).getTime() - new Date(b).getTime());
      courseSchedule = {
        startDate: sortedDates[0],
        endDate: sortedDates[sortedDates.length - 1]
      };
    }

    const courseData = {
      ...restData,
      mentorId: req.user.userId, // Use the authenticated user's ID
      schedule: courseSchedule,
      status: 'DRAFT'
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ 
      message: 'Failed to create course',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getCourses(req: Request, res: Response) {
  try {
    const { status, mentorId } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }
    if (mentorId) {
      query.mentorId = mentorId;
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .populate('mentorId', 'firstName lastName');

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
}

export async function getCourseById(req: Request, res: Response) {
  try {
    const course = await Course.findById(req.params.id)
      .populate('mentorId', 'firstName lastName')
      .populate('enrolledUsers', 'firstName lastName');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
}

export async function updateCourse(req: Request, res: Response) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify ownership
    const userId = req.user?._id || req.user?.id;
    if (course.mentorId.toString() !== userId?.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
}

export async function deleteCourse(req: Request, res: Response) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify ownership
    const userId = req.user?._id || req.user?.id;
    if (course.mentorId.toString() !== userId?.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
} 