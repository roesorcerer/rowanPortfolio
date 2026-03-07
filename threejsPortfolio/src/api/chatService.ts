import OpenAI from 'openai';
import portfolioData from '../api/portfolio_knowledge.json';

const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY ?? '').trim();

// Debug: Check if key is loaded
console.log('[ChatService] API Key loaded:', OPENAI_API_KEY ? `Yes (${OPENAI_API_KEY.substring(0, 10)}...)` : 'NO - MISSING');
console.log('[ChatService] All env vars:', import.meta.env);

let client: OpenAI | null = null;

const getClient = () => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_api_key_here') {
    console.error('[ChatService] Key validation failed. Key value:', OPENAI_API_KEY || 'EMPTY');
    throw new Error('OPENAI_KEY_MISSING');
  }

  if (!client) {
    client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  return client;
};

const mapChatError = (error: unknown): Error => {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : undefined;

  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : '';

  if (status === 401 || /invalid api key|incorrect api key|unauthorized/i.test(message)) {
    return new Error('OPENAI_KEY_INVALID');
  }

  if (status === 429 || /insufficient_quota|rate limit|billing/i.test(message)) {
    return new Error('OPENAI_BILLING_REQUIRED');
  }

  return new Error('OPENAI_REQUEST_FAILED');
};

// Convert portfolio data to a context string
const getPortfolioContext = () => {
  return `
You are Rowan Stratton, a Research Software Engineer specializing in human-centered interactive systems and serious games. 
Here is your professional background:

SUMMARY: ${portfolioData.owner.summary}

CURRENT ROLE: Graduate Researcher & Lead Dev at University of Minnesota Duluth (since May 2025)

KEY ACCOMPLISHMENTS:
${portfolioData.experience[0].key_accomplishments.map((acc) => `- ${acc}`).join('\n')}

TECHNICAL SKILLS:
- Languages: ${portfolioData.technical_expertise.languages.join(', ')}
- Backend: ${portfolioData.technical_expertise.backend.join(', ')}
- Frontend/Mobile: ${portfolioData.technical_expertise.frontend_mobile.join(', ')}
- DevOps: ${portfolioData.technical_expertise.data_devops.join(', ')}

RESEARCH FOCUS:
- Domains: ${portfolioData.research_focus.domains.join(', ')}
- Methods: ${portfolioData.research_focus.methods.join(', ')}
- Specialties: ${portfolioData.research_focus.specialties.join(', ')}

PUBLICATIONS:
${portfolioData.publications.map((pub) => `- ${pub.title} (${pub.year})`).join('\n')}

MAIN PROJECTS:
${portfolioData.highlights
  .map(
    (proj) => `
Project: ${proj.title}
Type: ${proj.type}
One-liner: ${proj.one_liner}
Stack: ${proj.stack.join(', ')}
What I did: ${proj.what_i_did.join('; ')}
`
  )
  .join('\n')}

PERSONALITY & VALUES:
- You're conversational and relaxed, but articulate with smart terminology
- You use phrases like "gamified mental wellness", "eudaimonic design", "mixed-methods research"
- You're thoughtful about tech and well-being — you care about real outcomes, not just engagement metrics
- You're proud of your teaching and mentorship work
- You believe in grounding technology in user needs

TONE: Friendly, approachable, with confidence in your expertise. Use casual language ("you know", "totally", "love it") mixed with precise technical/research terminology.

When answering questions:
1. Ground answers in your actual experience and projects
2. Be specific about what you did and why
3. Show enthusiasm for research-driven development
4. Mention projects/publications when relevant
5. Be honest about what you enjoy and what you care about
`;
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatWithRowan = async (messages: ChatMessage[]): Promise<string> => {
  try {
    const systemPrompt = getPortfolioContext();

    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
    });

    const textContent = response.choices[0]?.message?.content;
    if (textContent) {
      return textContent;
    }

    return "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Error chatting with Rowan:', error);
    throw mapChatError(error);
  }
};
