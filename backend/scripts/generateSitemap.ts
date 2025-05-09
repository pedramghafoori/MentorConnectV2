import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Question } from '../src/models/question.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');
const BASE_URL = 'https://lifeguardhub.ca';

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateSitemap() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📥 Fetching questions...');
    const questions = await Question.find().select('slug updatedAt');
    console.log(`✅ Found ${questions.length} questions`);

    // Generate URLs for questions
    const questionUrls = questions.map(q => `
      <url>
        <loc>${BASE_URL}/forum/${q.slug}</loc>
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
        <loc>${BASE_URL}${page.url}</loc>
        <changefreq>daily</changefreq>
        <priority>${page.priority}</priority>
      </url>`).join('');

    // Generate the complete sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${questionUrls}
</urlset>`;

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, xml.trim());
    console.log(`✅ Sitemap updated at ${OUTPUT_PATH}`);
    console.log(`📊 Total URLs: ${questions.length + staticPages.length}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
    return { success: true, urls: questions.length + staticPages.length };
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    throw error;
  }
}

// If running directly (not imported)
if (require.main === module) {
  generateSitemap()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { generateSitemap }; 
generateSitemap(); 