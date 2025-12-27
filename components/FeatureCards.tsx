import React from 'react';

const features = [
  {
    title: 'Карта интересов',
    description: 'Визуализируй свои интересы в виде интерактивного графа',
    icon: (
      <svg width="22" height="22" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="13" r="11.5" stroke="#6f87ff" strokeWidth="2" />
        <path d="M8.5 13h9M13 8.5v9" stroke="#6f87ff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'AI-анализ',
    description: 'Расскажи о себе голосом — ИИ создаст твою карту автоматически',
    icon: (
      <svg width="22" height="22" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5.5" y="5.5" width="15" height="15" rx="7.5" stroke="#6f87ff" strokeWidth="2" />
        <path d="M10.5 13c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5" stroke="#6f87ff" strokeWidth="2" />
      </svg>
    )
  },
  {
    title: 'Находи единомышленников',
    description: 'Знакомься с людьми, которые разделяют твои интересы',
    icon: (
      <svg width="22" height="22" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9.5" cy="11" r="2.8" fill="#6f87ff" opacity="0.8" />
        <circle cx="16.5" cy="11" r="2.8" fill="#6f87ff" opacity="0.6" />
        <path d="M6.2 17.5c.75-1.65 2.3-2.75 4.1-2.75s3.35 1.1 4.1 2.75" stroke="#6f87ff" strokeWidth="2" strokeLinecap="round" />
        <path d="M12.7 17.5c.6-1.35 1.9-2.3 3.3-2.3 1.25 0 2.3.65 2.8 1.7" stroke="#6f87ff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  },
  {
    title: 'Общайся напрямую',
    description: 'Пиши в Telegram тем, кто тебе интересен',
    icon: (
      <svg width="22" height="22" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <section className="fade-in-up grid grid-cols-1 gap-2.5 sm:grid-cols-2" style={{ animationDelay: '0.16s' }}>
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex items-start gap-3 rounded-2xl bg-[rgba(255,255,255,0.04)] px-3.5 py-2.5 text-left shadow-soft backdrop-blur-md"
        >
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(102,130,255,0.14)]">
            {feature.icon}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-[15px] font-semibold leading-[22px] text-textPrimary">{feature.title}</h3>
            <p className="text-[13px] leading-[20px] text-textSecondary">{feature.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
};
