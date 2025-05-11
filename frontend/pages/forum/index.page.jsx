import { Helmet } from 'react-helmet-async';
import ForumHome from '../../src/pages/forum/ForumHome';

export { Page };

function Page() {
  return (
    <>
      <Helmet>
        <title>Forum · MentorConnect</title>
        <meta name="description" content="Ask questions and get answers from the MentorConnect community." />
        <link rel="canonical" href="https://mentorconnect.ca/forum" />
      </Helmet>
      <ForumHome />
    </>
  );
} 