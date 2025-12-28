'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AddInterestModal } from './AddInterestModal';
import { ContentDrawer, RecommendationItem } from './ContentDrawer';
import { InterestDrawer } from './InterestDrawer';
import { OnboardingInterestsOverlay } from './OnboardingInterestsOverlay';
import { UniverseCanvas, UniverseEdge, UniverseNode, UniverseView } from './UniverseCanvas';
import { generateInitialLayout, stableIdFromLabel } from '@/lib/graphLayout';
import { PersonalityProfile, personalityProfiles } from '@/lib/personalityProfiles';

interface UniverseScreenProps {
  onBack: () => void;
}

const PRESET_INTERESTS = [
  'Предпринимательство',
  'Бизнес-мышление',
  'Финансовая грамотность',
  'Самодисциплина',
  'Продуктивность',
  'Психология',
  'Коммуникация',
  'Лидерство',
  'Soft Skills',
  'Маркетинг',
  'Продажи',
  'IT и технологии',
  'Искусственный интеллект',
  'Дизайн',
  'Наука',
  'История',
  'Философия',
  'Спорт и здоровье',
  'Саморазвитие',
  'Английский язык',
];

const FALLBACK_PROFILE: PersonalityProfile = {
  name: 'Исследователь смыслов',
  description: 'Собирает идеи из разных областей и соединяет их в свою карту.',
  keywords: ['мышление', 'идеи', 'развитие', 'контекст', 'обучение'],
};

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const normalizeInterest = (label: string) => label.trim().toLowerCase();

const deriveProfile = (interests: string[]): PersonalityProfile => {
  if (!interests.length) return FALLBACK_PROFILE;
  const normalized = interests.map(normalizeInterest);
  const scored = personalityProfiles
    .map((profile) => {
      const hits = profile.keywords.reduce((acc, keyword) => {
        const key = keyword.toLowerCase();
        const match = normalized.some((interest) => interest.includes(key) || key.includes(interest));
        return acc + (match ? 1 : 0);
      }, 0);
      return { profile, hits };
    })
    .sort((a, b) => b.hits - a.hits);

  const top = scored[0];
  if (!top || top.hits === 0) {
    const softMatch = personalityProfiles.find((profile) =>
      profile.keywords.some((keyword) => normalized.some((interest) => interest.includes(keyword.toLowerCase())))
    );
    return softMatch ?? FALLBACK_PROFILE;
  }
  return top.profile;
};

const relatedInterestMap: Record<string, string[]> = {
  технологии: ['робототехника', 'квантовые вычисления', 'интернет вещей'],
  философия: ['этика технологий', 'философия сознания', 'феноменология'],
  бизнес: ['операционный менеджмент', 'юнит-экономика', 'финансовое моделирование'],
  маркетинг: ['бренд-стратегия', 'поведенческая экономика', 'customer journey'],
  дизайн: ['UX-копирайтинг', 'дизайн-система', 'моушн-дизайн'],
  искусство: ['современное искусство', 'арт-менеджмент', 'визуальные нарративы'],
  путешествия: ['культурный код', 'цифровые кочевники', 'языковые практики'],
  образование: ['микрообучение', 'learning design', 'адаптивные программы'],
  спорт: ['функциональный тренинг', 'дыхательные практики', 'осознанное движение'],
  психология: ['когнитивные искажения', 'эмоциональный интеллект', 'психология влияния'],
  'ai': ['прикладные нейросети', 'mlops', 'генеративные модели'],
};

const capitalizeLabel = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

const buildLocalSuggestions = (interests: string[], profile: PersonalityProfile) => {
  const lowerSet = new Set(interests.map(normalizeInterest));
  const pool = new Set<string>();

  profile.keywords.forEach((keyword) => {
    const lower = normalizeInterest(keyword);
    if (!lowerSet.has(lower)) {
      pool.add(capitalizeLabel(keyword));
    }
    relatedInterestMap[lower]?.forEach((item) => {
      const normalized = normalizeInterest(item);
      if (!lowerSet.has(normalized)) {
        pool.add(capitalizeLabel(item));
      }
    });
  });

  interests.forEach((interest) => {
    const normalized = normalizeInterest(interest);
    relatedInterestMap[normalized]?.forEach((item) => {
      const key = normalizeInterest(item);
      if (!lowerSet.has(key)) pool.add(capitalizeLabel(item));
    });
  });

  const extended = [
    'системное мышление',
    'редактура смысла',
    'цифровая гигиена',
    'устойчивые города',
    'сценарное планирование',
    'продуктовое мышление',
  ];
  extended.forEach((item) => {
    const key = normalizeInterest(item);
    if (!lowerSet.has(key)) pool.add(capitalizeLabel(item));
  });

  return Array.from(pool).slice(0, 14);
};

export const UniverseScreen: React.FC<UniverseScreenProps> = ({ onBack }) => {
  const initialNodes = useMemo<UniverseNode[]>(
    () => [
      { id: 'tech', label: 'Технологии', x: -160, y: -80 },
      { id: 'design', label: 'Дизайн', x: 110, y: -30 },
      { id: 'philosophy', label: 'Философия', x: -60, y: 130 },
      { id: 'business', label: 'Бизнес', x: 180, y: 140 },
      { id: 'ai', label: 'AI', x: 10, y: -180 },
    ],
    []
  );

  const [nodes, setNodes] = useState<UniverseNode[]>(initialNodes);
  const [view, setView] = useState<UniverseView>({ offsetX: 0, offsetY: 0, scale: 1 });
  const [edges, setEdges] = useState<UniverseEdge[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [interestDrawerOpen, setInterestDrawerOpen] = useState(false);
  const [interestSuggestions, setInterestSuggestions] = useState<string[]>([]);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestError, setInterestError] = useState('');
  const [queries, setQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const requestAbortRef = useRef<AbortController | null>(null);
  const onboardingHydratedRef = useRef(false);

  const handleAddInterest = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) {
      return { success: false, error: 'Введите интерес' };
    }
    const exists = nodes.some((node) => node.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      return { success: false, error: 'Уже добавлено' };
    }

    const randomShift = () => (Math.random() - 0.5) * 80;
    const worldX = -view.offsetX / view.scale + randomShift();
    const worldY = -view.offsetY / view.scale + randomShift();

    setNodes((prev) => [...prev, { id: createId(), label: trimmed, x: worldX, y: worldY }]);
    return { success: true as const };
  };

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
  };

  const persistOnboardingState = (interests: string[]) => {
    try {
      const unique = Array.from(new Set(interests));
      localStorage.setItem('horizon:selectedInterests', JSON.stringify(unique));
      localStorage.setItem('horizon:onboardingDone', '1');
    } catch {
      // ignore
    }
  };

  const getWorldCenter = () => ({
    x: -view.offsetX / view.scale,
    y: -view.offsetY / view.scale,
  });

  const createNodesForInterests = (interests: string[], markFresh = false) => {
    if (!interests.length) return;
    const center = getWorldCenter();
    const layout = generateInitialLayout(
      interests,
      center,
      { min: 220, max: 360 },
      120,
      nodes.map((node) => ({ x: node.x, y: node.y }))
    );
    const newNodeIds: string[] = [];

    setNodes((prev) => {
      const existingLabels = new Set(prev.map((node) => node.label.toLowerCase()));
      const existingIds = new Set(prev.map((node) => node.id));

      const additions = layout.flatMap((node) => {
        if (existingLabels.has(node.label.toLowerCase())) return [];
        let id = node.id || stableIdFromLabel(node.label);
        let idx = 1;
        while (existingIds.has(id)) {
          id = `${stableIdFromLabel(node.label)}-${idx}`;
          idx += 1;
        }

        existingLabels.add(node.label.toLowerCase());
        existingIds.add(id);
        newNodeIds.push(id);
        return [{ ...node, id, fresh: markFresh }];
      });

      return additions.length ? [...prev, ...additions] : prev;
    });

    if (markFresh && newNodeIds.length) {
      setTimeout(() => {
        setNodes((prev) => prev.map((node) => (newNodeIds.includes(node.id) ? { ...node, fresh: false } : node)));
      }, 1300);
    }
  };

  const moveNode = (id: string, delta: { dx: number; dy: number }) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, x: node.x + delta.dx, y: node.y + delta.dy } : node)));
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const collectInterests = () => nodes.map((node) => node.label).filter(Boolean);
  const allInterests = useMemo(() => nodes.map((node) => node.label).filter(Boolean), [nodes]);
  const activeProfile = useMemo(() => deriveProfile(allInterests), [allInterests]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (onboardingHydratedRef.current) return;
    onboardingHydratedRef.current = true;

    try {
      const done = localStorage.getItem('horizon:onboardingDone') === '1';
      const stored = localStorage.getItem('horizon:selectedInterests');
      const parsed = stored ? JSON.parse(stored) : [];
      const valid = Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item.trim()) : [];

      if (valid.length) {
        setSelectedInterests(valid);
        if (done) {
          createNodesForInterests(valid);
        }
      }

      if (!done) {
        setIsOnboardingOpen(true);
      }
    } catch {
      setIsOnboardingOpen(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const buildClientFallbackEdges = (interests: string[]) => {
    const unique = Array.from(new Set(interests));
    const sorted = [...unique].sort((a, b) => a.localeCompare(b, 'ru'));
    const maxEdgesPerNode = 2;
    const degrees = new Map<string, number>();
    const addDegree = (key: string) => degrees.set(key, (degrees.get(key) ?? 0) + 1);

    const edgesDraft: Array<{ source: string; target: string }> = [];
    const addEdge = (source: string, target: string) => {
      if (source === target) return;
      const key = [source, target].sort().join('||');
      if (edgesDraft.find((e) => [e.source, e.target].sort().join('||') === key)) return;
      if ((degrees.get(source) ?? 0) >= maxEdgesPerNode || (degrees.get(target) ?? 0) >= maxEdgesPerNode) return;
      edgesDraft.push({ source, target });
      addDegree(source);
      addDegree(target);
    };

    for (let i = 0; i < sorted.length - 1; i += 1) {
      addEdge(sorted[i], sorted[i + 1]);
    }

    if (edgesDraft.length < 2 && sorted.length >= 3) {
      addEdge(sorted[0], sorted[2]);
    }

    const mapByLabel = new Map(nodes.map((node) => [node.label, node.id]));
    return edgesDraft
      .map((edge) => {
        const sourceId = mapByLabel.get(edge.source);
        const targetId = mapByLabel.get(edge.target);
        if (!sourceId || !targetId) return null;
        const id = [sourceId, targetId].sort().join('-');
        return { id, sourceId, targetId };
      })
      .filter(Boolean) as UniverseEdge[];
  };

  useEffect(() => {
    if (nodes.length < 2) {
      setEdges([]);
      return;
    }

    const interests = collectInterests();
    if (requestAbortRef.current) {
      requestAbortRef.current.abort();
    }
    const controller = new AbortController();
    requestAbortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/graph/edges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interests, maxEdgesPerNode: 2 }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('edge_request_failed');
        }

        const data: { edges?: Array<{ source: string; target: string }> } = await response.json();
        const pairs = data.edges ?? [];
        const mapByLabel = new Map(nodes.map((node) => [node.label, node.id]));
        const deduped = new Set<string>();
        const mapped: UniverseEdge[] = [];

        for (const pair of pairs) {
          const sourceId = mapByLabel.get(pair.source);
          const targetId = mapByLabel.get(pair.target);
          if (!sourceId || !targetId || sourceId === targetId) continue;
          const key = [sourceId, targetId].sort().join('-');
          if (deduped.has(key)) continue;
          deduped.add(key);
          mapped.push({ id: key, sourceId, targetId });
        }

        if (!mapped.length) {
          setEdges(buildClientFallbackEdges(interests));
        } else {
          setEdges(mapped);
        }
      } catch {
        setEdges(buildClientFallbackEdges(interests));
      }
    }, 550);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  useEffect(() => {
    if (interestDrawerOpen) {
      fetchInterestSuggestions();
    }
  }, [fetchInterestSuggestions, interestDrawerOpen]);

  const handleOnboardingContinue = () => {
    if (!selectedInterests.length) return;
    createNodesForInterests(selectedInterests, true);
    setIsOnboardingOpen(false);
    persistOnboardingState(selectedInterests);
  };

  const handleOnboardingSkip = () => {
    setIsOnboardingOpen(false);
    persistOnboardingState(selectedInterests);
  };

  const fetchInterestSuggestions = useCallback(async () => {
    const interests = allInterests;
    if (!interests.length) {
      setToast('Сначала добавьте интересы');
      setInterestSuggestions([]);
      return;
    }

    setInterestLoading(true);
    setInterestError('');
    try {
      const response = await fetch('/api/recommend/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, limit: 12 }),
      });

      if (!response.ok) {
        throw new Error('request_failed');
      }

      const data: { items?: string[]; error?: string } = await response.json();
      if (data.error) throw new Error(data.error);

      const cleaned = (data.items ?? []).map(capitalizeLabel).filter(Boolean);
      if (!cleaned.length) {
        throw new Error('empty');
      }
      setInterestSuggestions(cleaned);
    } catch {
      const fallback = buildLocalSuggestions(interests, activeProfile);
      setInterestSuggestions(fallback);
      if (!fallback.length) {
        setInterestError('Не удалось получить рекомендации');
      } else {
        setInterestError('');
        setToast('Показаны локальные рекомендации');
      }
    } finally {
      setInterestLoading(false);
    }
  }, [activeProfile, allInterests]);

  const fetchRecommendations = async () => {
    if (isLoading) return;

    const interests = collectInterests();
    if (!interests.length) {
      setToast('Сначала добавьте интересы');
      return;
    }

    setIsLoading(true);
    setError('');
    setDrawerOpen(true);

    try {
      const response = await fetch('/api/recommend/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, limit: 15 }),
      });

      if (!response.ok) {
        throw new Error('request_failed');
      }

      const data: { queries?: string[]; items?: RecommendationItem[]; error?: string } = await response.json();
      if (data.error) {
        throw new Error('request_failed');
      }

      setRecommendations(data.items ?? []);
      setQueries(data.queries ?? []);
    } catch {
      setRecommendations([]);
      setQueries([]);
      setError('Ошибка подбора контента. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenVideo = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddFromSuggestion = (label: string) => {
    const result = handleAddInterest(label);
    if (result.success) {
      setToast('Интерес добавлен');
      setInterestDrawerOpen(false);
      return;
    }
    if (result.error) {
      setToast(result.error);
    }
  };

  return (
    <div className="fixed inset-0 isolate overflow-hidden bg-[linear-gradient(180deg,#050a16_0%,#0a1230_45%,#080f22_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="cosmic-stars absolute inset-0" aria-hidden />
        <div className="cosmic-fog absolute inset-0" aria-hidden />
      </div>

      <div className="absolute inset-0">
        <UniverseCanvas nodes={nodes} edges={edges} view={view} setView={setView} onMoveNode={moveNode} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        {toast ? (
          <div className="pointer-events-none absolute left-1/2 top-4 z-30 w-full max-w-xl -translate-x-1/2 px-4">
            <div className="pointer-events-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(18,26,42,0.95)] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              {toast}
            </div>
          </div>
        ) : null}

        <div className="pointer-events-auto absolute left-4 top-4 flex items-center gap-2 sm:left-6 sm:top-6">
          <button
            type="button"
            onClick={() => setInterestDrawerOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(10,16,28,0.8)] text-lg font-semibold text-white transition hover:border-[rgba(255,255,255,0.28)] hover:bg-[rgba(15,22,38,0.9)]"
            aria-label="Открыть рекомендации интересов"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,32,0.85)] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:border-[rgba(111,135,255,0.4)] hover:bg-[rgba(111,135,255,0.14)]"
          >
            <span className="text-base leading-none">＋</span>
            Добавить интерес
          </button>
          <button
            type="button"
            onClick={onBack}
            className="hidden items-center gap-1 rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs font-semibold text-textSecondary transition hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)] sm:flex"
          >
            ← Назад
          </button>
        </div>

        <div className="pointer-events-auto absolute left-1/2 top-5 flex -translate-x-1/2 flex-col items-center px-4 sm:top-6">
          <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(11,23,64,0.72)] px-4 py-3 text-center shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-6 sm:py-4">
            <p className="text-lg font-semibold text-white sm:text-2xl">Ты — {activeProfile.name}</p>
            <p className="mt-1 text-xs text-white/75 sm:text-sm">{activeProfile.description}</p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-end justify-center px-4 pb-1 sm:bottom-6 sm:px-8">
          <div className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
            <div className="pointer-events-auto rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(8,12,22,0.78)] px-4 py-2 text-[12px] font-semibold text-white/80 backdrop-blur">
              Тяни — перемещение · Колесо — масштаб · Перетащи узел — обнови связи
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="rounded-full bg-[rgba(111,135,255,0.18)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(115,133,255,0.35)] transition hover:bg-[rgba(111,135,255,0.28)] disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isLoading ? 'Подбираем…' : 'Подобрать контент'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <InterestDrawer
        open={interestDrawerOpen}
        loading={interestLoading}
        suggestions={interestSuggestions}
        error={interestError}
        onRefresh={fetchInterestSuggestions}
        onClose={() => setInterestDrawerOpen(false)}
        onAdd={handleAddFromSuggestion}
      />

      <OnboardingInterestsOverlay
        open={isOnboardingOpen}
        interests={PRESET_INTERESTS}
        selected={selectedInterests}
        onToggle={toggleInterest}
        onContinue={handleOnboardingContinue}
        onClose={handleOnboardingSkip}
      />

      <ContentDrawer
        open={drawerOpen}
        loading={isLoading}
        items={recommendations}
        queries={queries}
        error={error}
        onRefresh={fetchRecommendations}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleOpenVideo}
      />

      <AddInterestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddInterest} />
    </div>
  );
};
