import { NextRequest, NextResponse } from 'next/server';

type RecommendRequest = {
  interests?: unknown;
  limit?: unknown;
};

type RecommendResponse = {
  queries: string[];
  items: Array<{
    videoId: string;
    title: string;
    url: string;
    channelTitle: string;
    publishedAt: string;
  }>;
};

const MAX_INTERESTS = 25;
const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 40;
const MAX_AI_QUERIES = 12;

const sanitizeInterests = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, MAX_INTERESTS);
};

const normalizeLimit = (limit: unknown) => {
  if (typeof limit !== 'number' || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(limit), 1), MAX_LIMIT);
};

const buildFallbackQueries = (interests: string[]) => {
  const fallback: string[] = [];
  for (const interest of interests) {
    if (fallback.length >= MAX_AI_QUERIES) break;
    fallback.push(`${interest} лекция`, `${interest} разбор`);
  }
  return fallback.slice(0, MAX_AI_QUERIES);
};

const parseAiQueries = (raw: string): string[] => {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, MAX_AI_QUERIES);
  } catch {
    return [];
  }
};

const generateQueriesWithAI = async (interests: string[]): Promise<string[]> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('AI service unavailable');
  }

  const prompt = `Ты генератор поисковых запросов для YouTube. Дай 10 коротких запросов на русском (3–7 слов) на основе интересов пользователя: ${interests.join(
    ', '
  )}. Запросы должны быть разнообразными (лекция/разбор/гайд/интервью/кейсы/история/введение). Верни ТОЛЬКО JSON массив строк. Никакого текста кроме JSON.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Генерируй только JSON массив строк без пояснений.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 256,
    }),
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content ?? '';
  return parseAiQueries(content);
};

const searchYouTube = async (query: string): Promise<RecommendResponse['items']> => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube service unavailable');
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '5');
  url.searchParams.set('q', query);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('safeSearch', 'strict');
  url.searchParams.set('relevanceLanguage', 'ru');

  const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });
  if (!response.ok) {
    throw new Error('YouTube request failed');
  }

  const data = (await response.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: { title?: string; channelTitle?: string; publishedAt?: string };
    }>;
  };

  return (
    data.items?.map((item) => {
      const videoId = item.id?.videoId ?? '';
      return {
        videoId,
        title: item.snippet?.title ?? 'Без названия',
        channelTitle: item.snippet?.channelTitle ?? 'Без канала',
        publishedAt: item.snippet?.publishedAt ?? '',
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : '',
      };
    }) ?? []
  ).filter((entry) => entry.videoId && entry.url);
};

export async function POST(request: NextRequest) {
  let body: RecommendRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const interests = sanitizeInterests(body.interests);
  if (!interests.length) {
    return NextResponse.json({ error: 'Нужно передать интересы' }, { status: 400 });
  }

  const limit = normalizeLimit(body.limit);

  let queries: string[] = [];
  try {
    queries = await generateQueriesWithAI(interests);
  } catch {
    queries = [];
  }

  if (!queries.length) {
    queries = buildFallbackQueries(interests);
  }

  const uniqueQueries = Array.from(new Set(queries)).slice(0, MAX_AI_QUERIES);

  try {
    const searchResults = await Promise.all(
      uniqueQueries.map(async (query) => {
        try {
          return await searchYouTube(query);
        } catch {
          return [];
        }
      })
    );

    const mergedMap = new Map<string, RecommendResponse['items'][number]>();
    for (const result of searchResults) {
      for (const item of result) {
        if (!mergedMap.has(item.videoId)) {
          mergedMap.set(item.videoId, item);
        }
      }
    }

    const items = Array.from(mergedMap.values()).slice(0, limit);

    const response: RecommendResponse = {
      queries: uniqueQueries,
      items,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить рекомендации' }, { status: 500 });
  }
}
