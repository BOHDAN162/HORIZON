import { NextRequest, NextResponse } from 'next/server';
import { personalityProfiles } from '@/lib/personalityProfiles';

type RequestPayload = {
  interests?: unknown;
  limit?: unknown;
};

const MAX_INTERESTS = 30;
const DEFAULT_LIMIT = 14;
const MAX_LIMIT = 30;

const sanitizeInterests = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, MAX_INTERESTS);
};

const normalizeLimit = (raw: unknown) => {
  if (typeof raw !== 'number' || Number.isNaN(raw)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(raw), 4), MAX_LIMIT);
};

const dedupe = (values: string[]) => Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));

const buildProfileScores = (interests: string[]) => {
  const normalized = interests.map((item) => item.toLowerCase());
  return personalityProfiles
    .map((profile) => {
      const score = profile.keywords.reduce((acc, keyword) => {
        const key = keyword.toLowerCase();
        const hits = normalized.some((interest) => interest.includes(key) || key.includes(interest));
        return acc + (hits ? 1 : 0);
      }, 0);
      return { profile, score };
    })
    .sort((a, b) => b.score - a.score);
};

const fallbackForInterests = (interests: string[], limit: number) => {
  const lowerSet = new Set(interests.map((item) => item.toLowerCase()));
  const ranked = buildProfileScores(interests);
  const pool = ranked
    .filter((entry, idx) => entry.score > 0 || idx < 4)
    .flatMap((entry) => entry.profile.keywords)
    .filter((keyword) => !lowerSet.has(keyword.toLowerCase()));

  const extras = [
    'робототехника',
    'цифровая этика',
    'поведенческая экономика',
    'устойчивые города',
    'микрообучение',
    'нейромаркетинг',
    'креативные индустрии',
    'большие данные',
    'web3 и децентрализация',
    'сценарное планирование',
    'история технологий',
  ].filter((keyword) => !lowerSet.has(keyword.toLowerCase()));

  const combined = dedupe([...pool, ...extras]);
  return combined.slice(0, limit);
};

const generateWithAI = async (interests: string[], limit: number) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('AI key missing');
  }

  const prompt = `Ты предлагаешь новые интересы на русском языке. Учитывай список пользователя: ${interests.join(
    ', '
  )}. Дай ${limit} коротких интересов (одно- или двусловные), которые дополняют их карту знаний. Верни только JSON массив строк без пояснений.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Отвечай только JSON массивом строк.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 220,
    }),
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? '[]';
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
};

export async function POST(request: NextRequest) {
  let body: RequestPayload;
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
  const uniqueInterests = dedupe(interests);

  try {
    const aiResult = await generateWithAI(uniqueInterests, limit);
    if (aiResult.length) {
      const cleaned = dedupe(aiResult).filter(
        (item) => !uniqueInterests.some((interest) => interest.toLowerCase() === item.toLowerCase())
      );
      if (cleaned.length) {
        return NextResponse.json({ items: cleaned.slice(0, limit) }, { status: 200 });
      }
    }
  } catch {
    // ignore and fall back
  }

  const fallback = fallbackForInterests(uniqueInterests, limit);
  return NextResponse.json({ items: fallback }, { status: 200 });
}
