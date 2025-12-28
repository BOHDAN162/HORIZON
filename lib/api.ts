type Edge = { source: string; target: string };

export const fetchEdges = async (interests: string[], maxEdgesPerNode = 2) => {
  const response = await fetch('/api/graph/edges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interests, maxEdgesPerNode }),
  });

  if (!response.ok) {
    throw new Error('edges_request_failed');
  }

  const data = (await response.json()) as { edges?: Edge[] };
  return data.edges ?? [];
};

export const fetchInterestRecommendations = async (interests: string[]) => {
  const response = await fetch('/api/recommend/interests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interests }),
  });

  if (!response.ok) {
    throw new Error('recommend_request_failed');
  }

  const data = (await response.json()) as { items?: string[]; interests?: string[] };
  return data.items ?? data.interests ?? [];
};

export type YoutubeItem = {
  title: string;
  url: string;
  channelTitle: string;
  publishedAt: string;
};

export const fetchYoutubeForInterests = async (interests: string[], limit = 10) => {
  const response = await fetch('/api/recommend/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interests, limit }),
  });

  if (!response.ok) {
    throw new Error('youtube_request_failed');
  }

  const data = (await response.json()) as { items?: YoutubeItem[] };
  return data.items ?? [];
};
