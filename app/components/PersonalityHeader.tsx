import React from 'react';

type Props = {
  name: string;
  description: string;
};

export const PersonalityHeader: React.FC<Props> = ({ name, description }) => (
  <div className="flex flex-col items-center gap-1 text-center" data-ui-layer="true">
    <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">Ты —</p>
    <p className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">{name}</p>
    <p className="max-w-xl text-sm text-[var(--text-secondary)] sm:text-base">{description}</p>
  </div>
);
