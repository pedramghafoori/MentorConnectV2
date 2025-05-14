import React from 'react';
import { Helmet } from 'react-helmet';

const ForumThreadMeta = ({ question, slug }) => (
  <Helmet>
    <title>{question ? `${question.title} · MentorConnect Forum` : 'Question Not Found · MentorConnect Forum'}</title>
    <link rel="canonical" href={`https://mentorconnect.ca/forum/${slug}`} />
  </Helmet>
);

export default ForumThreadMeta; 