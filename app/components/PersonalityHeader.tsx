import React from 'react';

type Props = {
  name: string;
};

export const PersonalityHeader: React.FC<Props> = ({ name }) => (
  <div className="flex flex-col items-center text-center" data-ui-layer="true">
    <p className="text-[22px] font-semibold text-[var(--text-primary)] sm:text-[28px]">Ты — {name}</p>
  </div>
);
