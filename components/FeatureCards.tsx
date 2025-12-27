import React from 'react';

const features = [
  {
    title: 'Карта интересов',
    description: 'Визуализируй свои интересы в виде интерактивного графа',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="13" r="12" stroke="#6f87ff" strokeWidth="2" />
        <path d="M8 13h10M13 8v10" stroke="#6f87ff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'AI-анализ',
    description: 'Расскажи о себе голосом — ИИ создаст твою карту автоматически',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="16" height="16" rx="8" stroke="#6f87ff" strokeWidth="2" />
        <path d="M10 13c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3" stroke="#6f87ff" strokeWidth="2" />
      </svg>
    )
  },
  {
    title: 'Находи единомышленников',
    description: 'Знакомься с людьми, которые разделяют твои интересы',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="11" r="3" fill="#6f87ff" opacity="0.8" />
        <circle cx="17" cy="11" r="3" fill="#6f87ff" opacity="0.6" />
        <path d="M5.5 18c.8-1.8 2.5-3 4.5-3s3.7 1.2 4.5 3" stroke="#6f87ff" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 18c.6-1.4 2-2.4 3.5-2.4 1.3 0 2.4.7 3 1.8" stroke="#6f87ff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  },
  {
    title: 'Общайся напрямую',
    description: 'Пиши в Telegram тем, кто тебе интересен',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 6.5 11 12l4 2 1 5 2-3 3-9Z"
          stroke="#6f87ff"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    )
  }
];

export const FeatureCards: React.FC = () => {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex items-start gap-3 rounded-2xl bg-[rgba(255,255,255,0.04)] px-4 py-3 text-left shadow-soft backdrop-blur-md"
        >
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(102,130,255,0.14)]">
            {feature.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-textPrimary">{feature.title}</h3>
            <p className="text-sm leading-6 text-textSecondary">{feature.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
};
