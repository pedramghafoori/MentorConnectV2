import { Request, Response } from 'express';
import { Question, IQuestion } from '../models/question.js';
import { Answer, IAnswer } from '../models/answer.js';
import slugifyLib from 'slugify';
import { Types } from 'mongoose';

// Helper function to generate slug
const generateSlug = (title: string): string => {
  return (slugifyLib as any)(title, {
    lower: true,
    strict: true,
    trim: true
  });
};

// Questions
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'firstName lastName avatarUrl');

    const total = await Question.countDocuments();

    res.json({
      questions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
};

export const getQuestionBySlug = async (req: Request, res: Response) => {
  try {
    const question = await Question.findOne({ slug: req.params.slug })
      .populate('authorId', 'firstName lastName avatarUrl')
      .populate('acceptedAnswerId');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answers = await Answer.find({ questionId: question._id })
      .sort({ score: -1, createdAt: -1 })
      .populate('authorId', 'firstName lastName avatarUrl');

    res.json({ question, answers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching question', error });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { title, body } = req.body;
    const slug = generateSlug(title);

    // Check if slug already exists
    const existingQuestion = await Question.findOne({ slug });
    if (existingQuestion) {
      return res.status(400).json({ message: 'A question with this title already exists' });
    }

    const question = new Question({
      title,
      body,
      slug,
      authorId: new Types.ObjectId(req.user.userId)
    });

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error });
  }
};

export const upvoteQuestion = async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.score += 1;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error upvoting question', error });
  }
};

export const downvoteQuestion = async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.score -= 1;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error downvoting question', error });
  }
};

export const acceptAnswer = async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the question author
    if (question.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the question author can accept answers' });
    }

    const answer = await Answer.findById(req.body.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    question.acceptedAnswerId = answer._id as Types.ObjectId;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting answer', error });
  }
};

// Answers
export const createAnswer = async (req: Request, res: Response) => {
  try {
    // Find question by slug instead of _id
    const question = await Question.findOne({ slug: req.params.id });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      questionId: question._id,
      body: req.body.body,
      authorId: req.user._id as Types.ObjectId
    });

    await answer.save();

    // Increment answersCount on question
    question.answersCount += 1;
    await question.save();

    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating answer', error });
  }
};

export const upvoteAnswer = async (req: Request, res: Response) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    answer.score += 1;
    await answer.save();
    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Error upvoting answer', error });
  }
};

export const downvoteAnswer = async (req: Request, res: Response) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    answer.score -= 1;
    await answer.save();
    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Error downvoting answer', error });
  }
}; 