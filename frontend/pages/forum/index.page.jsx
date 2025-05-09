import { Helmet } from 'react-helmet-async';
import ForumHome from '../../src/pages/forum/ForumHome';

export { Page };

function Page() {
  return (
    <>
      <Helmet>
        <title>Forum · LifeguardHub</title>
        <meta name="description" content="Ask questions and get answers from the LifeguardHub community." />
        <link rel="canonical" href="https://lifeguardhub.ca/forum" />
      </Helmet>
      <ForumHome />
    </>
  );
} 