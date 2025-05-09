import Router from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getQuestions,
  getQuestionBySlug,
  createQuestion,
  upvoteQuestion,
  downvoteQuestion,
  acceptAnswer,
  createAnswer,
  upvoteAnswer,
  downvoteAnswer
} from '../controllers/forumController.js';
import { Question, IQuestion } from '../models/question.js';
import { Document } from 'mongoose';
import { generateSitemap } from '../utils/generateSitemap.js';

const router = Router();

// Sitemap generation endpoint (protected by API key)
router.post('/generate-sitemap', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.SITEMAP_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await generateSitemap();
    res.json(result);
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// Sitemap endpoint
router.get('/sitemap.xml', async (req, res) => {
  try {
    const questions = await Question.find().select('slug updatedAt');
    const baseUrl = 'https://lifeguardhub.ca';
    const urls = questions.map((q: Document & IQuestion) => `
      <url>
        <loc>${baseUrl}/forum/${q.slug}</loc>
        <lastmod>${q.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`).join('');

    // Add static pages
    const staticPages = [
      { url: '/forum', priority: '1.0' },
      { url: '/forum/ask', priority: '0.9' }
    ];

    const staticUrls = staticPages.map(page => `
      <url>
        <loc>${baseUrl}${page.url}</loc>
        <changefreq>daily</changefreq>
        <priority>${page.priority}</priority>
      </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticUrls}
        ${urls}
      </urlset>`;

    res.header('Content-Type', 'application/xml').send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Question routes
router.get('/questions', getQuestions);
router.get('/questions/:slug', getQuestionBySlug);
router.post('/questions', authenticateToken, createQuestion);
router.patch('/questions/:id/upvote', authenticateToken, upvoteQuestion);
router.patch('/questions/:id/downvote', authenticateToken, downvoteQuestion);
router.patch('/questions/:id/accept', authenticateToken, acceptAnswer);

// Answer routes
router.post('/questions/:id/answers', authenticateToken, createAnswer);
router.patch('/answers/:id/upvote', authenticateToken, upvoteAnswer);
router.patch('/answers/:id/downvote', authenticateToken, downvoteAnswer);

export default router; 