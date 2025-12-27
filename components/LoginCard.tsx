'use client';

import React from 'react';

const CheckIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 6.5 5.5 10.5 14.5 1.5" stroke="#3ccf72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8h8m0 0-3-3m3 3-3 3" stroke="#7bec9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TelegramIcon = () => (
  <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.2 1.54 1.7 8.9c-1.33.53-1.32 1.28-.24 1.6l4.87 1.52 1.79 5.37c.21.58.11.82.72.82.47 0 .68-.21.95-.47l2.28-2.22 4.74 3.5c.88.49 1.51.24 1.73-.82l3.13-14.93c.32-1.3-.52-1.9-1.47-1.54Z"
      fill="white"
    />
  </svg>
);

export const LoginCard: React.FC = () => {
  const handleClick = () => {
    console.log('Telegram login clicked');
  };

  return (
    <section
      className="fade-in-up card-glass w-full rounded-[20px] px-5 py-5 text-left sm:px-6 sm:py-6"
      style={{ animationDelay: '0.24s' }}
    >
      <div className="space-y-1.5">
        <h2 className="text-xl font-extrabold leading-[26px] text-textPrimary">Начни прямо сейчас</h2>
        <p className="text-sm font-medium leading-[22px] text-textSecondary">Два простых шага для входа</p>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-2xl bg-[rgba(24,62,138,0.9)] px-3.5 py-2.5 text-textPrimary shadow-soft">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-[13px] font-semibold">1</div>
            <div>
              <p className="text-sm font-semibold leading-[20px]">Подпишись на канал</p>
              <div className="flex items-center gap-1 text-[13px] leading-[18px] text-[rgba(187,208,255,0.95)]">
                <span>@PavelDurov</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5.25 8.75 8.75 5.25M9.625 9.625V5.25H5.25"
                    stroke="#bbd0ff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]">
            <CheckIcon />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[rgba(20,64,49,0.9)] px-3.5 py-2.5 text-textPrimary shadow-soft">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-[13px] font-semibold">2</div>
            <div>
              <p className="text-sm font-semibold leading-[20px]">Нажми кнопку ниже</p>
              <p className="text-[13px] font-semibold text-[#7bec9c]">Код не придёт — просто нажми</p>
            </div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]">
            <ArrowIcon />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="telegram-button mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-telegramBlue px-5 py-2.5 text-base font-semibold text-white transition hover:brightness-105"
      >
        <TelegramIcon />
        Войти через Telegram
      </button>

      <p className="mt-3 text-center text-[13px] font-medium leading-[20px] text-textSecondary">
        Нажми синюю кнопку и разреши доступ в Telegram
      </p>

      <div className="mt-4 flex items-center gap-3 text-[13px] font-semibold text-textSecondary">
        <div className="flex items-center gap-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0f3e2d]">
            <CheckIcon />
          </span>
          Бесплатно
        </div>
        <div className="flex items-center gap-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0f3e2d]">
            <CheckIcon />
          </span>
          Без спама
        </div>
      </div>
    </section>
  );
};
