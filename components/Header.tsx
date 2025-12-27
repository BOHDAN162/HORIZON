import React from 'react';

const BrainIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#paint0_linear)" opacity="0.9" />
    <path
      d="M15.5 8.5c-2.2 0-4 1.8-4 4v6.4c0 1.1.9 2 2 2h1.2v-3.6h-1.2c-.2 0-.4-.2-.4-.4v-1.6h1.6v-1.8c0-.8.6-1.4 1.4-1.4h.8c.2 0 .4.2.4.4v9.6h2v-9.8c0-1.1-.9-2-2-2H15.5Z"
      fill="#e9eef7"
    />
    <defs>
      <linearGradient id="paint0_linear" x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5f9cff" />
        <stop offset="1" stopColor="#9f6bff" />
      </linearGradient>
    </defs>
  </svg>
);

export const Header: React.FC = () => {
  return (
    <header className="mx-auto flex w-full max-w-[1240px] items-center justify-start px-6 pt-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(99,130,255,0.18)]">
          <BrainIcon />
        </div>
        <span className="text-base font-semibold leading-[1.1] text-textPrimary">HORIZON</span>
      </div>
    </header>
  );
};
