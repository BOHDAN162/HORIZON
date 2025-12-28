import React from 'react';

type Props = {
  name: string;
};

export const PersonalityHeader: React.FC<Props> = ({ name }) => (
  <div
    className="pointer-events-none fixed left-1/2 top-4 z-40 -translate-x-1/2 px-4 text-center"
    data-ui-layer="true"
  >
    <p className="whitespace-nowrap text-lg font-semibold text-[var(--text-primary)] sm:text-[22px]">Ты — {name}</p>
  </div>
);
