import { NextRequest, NextResponse } from 'next/server';

type Edge = { source: string; target: string };

const sanitizeInterests = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 40);
};

const clampEdgesPerNode = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 3;
  return Math.min(Math.max(Math.floor(value), 1), 4);
};

const parseEdges = (content: string, interests: Set<string>): Edge[] => {
  try {
    const parsed = JSON.parse(content) as { edges?: Array<{ source?: string; target?: string }> };
    if (!parsed || !Array.isArray(parsed.edges)) return [];
    return parsed.edges
      .map((edge) => {
        const source = typeof edge.source === 'string' ? edge.source.trim() : '';
        const target = typeof edge.target === 'string' ? edge.target.trim() : '';
        if (!source || !target || source === target) return null;
        if (!interests.has(source) || !interests.has(target)) return null;
        return { source, target };
      })
      .filter(Boolean) as Edge[];
  } catch {
    return [];
  }
};

const buildFallbackEdges = (interests: string[], maxEdgesPerNode: number): Edge[] => {
  const unique = Array.from(new Set(interests));
  const sorted = [...unique].sort((a, b) => a.localeCompare(b, 'ru'));
  const degrees = new Map<string, number>();
  const edges: Edge[] = [];

  const canConnect = (a: string, b: string) => (degrees.get(a) ?? 0) < maxEdgesPerNode && (degrees.get(b) ?? 0) < maxEdgesPerNode;

  const addEdge = (source: string, target: string) => {
    if (source === target) return;
    const key = [source, target].sort().join('||');
    if (edges.find((e) => [e.source, e.target].sort().join('||') === key)) return;
    if (!canConnect(source, target)) return;
    edges.push({ source, target });
    degrees.set(source, (degrees.get(source) ?? 0) + 1);
    degrees.set(target, (degrees.get(target) ?? 0) + 1);
  };

  for (let i = 0; i < sorted.length - 1; i += 1) {
    addEdge(sorted[i], sorted[i + 1]);
  }

  if (edges.length < 2 && sorted.length >= 3) {
    addEdge(sorted[0], sorted[2]);
  }

  if (edges.length < 3 && sorted.length >= 4) {
    addEdge(sorted[1], sorted[3]);
  }

  return edges;
};

const requestAiEdges = async (interests: string[], maxEdgesPerNode: number): Promise<Edge[]> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('AI unavailable');
  }

  const systemPrompt =
    'Ты строишь ориентированный граф интересов пользователя. Генерируй связи только в формате JSON: { "edges": [ { "source": "...", "target": "..." } ] }. Никаких комментариев.';

  const userPrompt = `У тебя есть интересы: ${interests.join(
    ', '
  )}. Соедини смысловые пары стрелками. Правила: максимум ${maxEdgesPerNode} связи на интерес, избегай полного графа, не соединяй одинаковые узлы, соединяй по смысловой близости (тематики, контекст). Верни ТОЛЬКО JSON с edges, без текста.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? '';
  return parseEdges(content, new Set(interests));
};

export async function POST(_request: NextRequest) {
  let body: { interests?: unknown; maxEdgesPerNode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const interests = sanitizeInterests(body.interests);
  if (interests.length < 2) {
    return NextResponse.json({ edges: [] }, { status: 200 });
  }

  const maxEdgesPerNode = clampEdgesPerNode(body.maxEdgesPerNode);

  try {
    const aiEdges = await requestAiEdges(interests, maxEdgesPerNode);
    if (aiEdges.length) {
      const deduped: Edge[] = [];
      const seen = new Set<string>();
      for (const edge of aiEdges) {
        const key = [edge.source, edge.target].sort().join('||');
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(edge);
      }
      return NextResponse.json({ edges: deduped }, { status: 200 });
    }
  } catch {
    // fallback handled below
  }

  const fallback = buildFallbackEdges(interests, maxEdgesPerNode);
  return NextResponse.json({ edges: fallback }, { status: 200 });
}
