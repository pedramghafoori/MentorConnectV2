import { createServerApi } from '../../src/lib/api';

export { onBeforeRender };

async function onBeforeRender(pageContext) {
  const { slug } = pageContext.routeParams;
  const api = createServerApi();

  try {
    const response = await api.get(`/v1/forum/questions/${slug}`);
    const { question, answers } = response.data;

    return {
      pageContext: {
        pageProps: {
          question,
          answers,
          slug
        }
      }
    };
  } catch (error) {
    return {
      pageContext: {
        pageProps: {
          error: 'Question not found',
          slug
        }
      }
    };
  }
} 