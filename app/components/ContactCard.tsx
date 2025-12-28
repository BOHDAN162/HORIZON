'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/useTheme';

type ContactCardProps = {
  visible: boolean;
  onClose: () => void;
};

export const ContactCard: React.FC<ContactCardProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`relative w-full max-w-[92vw] min-h-[40vh] rounded-2xl border p-4 shadow-[0_22px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-all duration-300 sm:min-h-[150px] sm:w-[320px] ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0'
      } ${isDark ? 'border-[#2f3d68] bg-[rgba(11,23,64,0.72)] text-white' : 'border-[#dbe7ff] bg-[rgba(255,255,255,0.82)] text-slate-900'}`}
      data-ui-layer="true"
    >
      <button
        type="button"
        aria-label="Закрыть карточку связи"
        onClick={onClose}
        className={`absolute right-3 top-3 rounded-full p-1 text-xs transition ${
          isDark
            ? 'text-white/80 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#7c9dff]'
            : 'text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#4B91F7]'
        }`}
      >
        ✕
      </button>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            isDark ? 'bg-[#102145]' : 'bg-[#e6f0ff]'
          }`}
        >
          <span className="text-2xl" aria-hidden>
            ✈️
          </span>
        </div>
        <div className="flex-1 pr-6">
          <p className="text-base font-semibold sm:text-lg">Напиши нам в Telegram</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">Мы читаем все сообщения и отвечаем лично</p>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href="https://t.me/Horizon_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-11 w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#4b91f7] px-4 text-sm font-semibold text-white shadow-[0_14px_38px_rgba(75,145,247,0.45)] transition hover:brightness-110"
        >
          <span>Открыть @Horizon_bot</span>
          <span className="flex items-center gap-1 text-base">
            ↗
            <span className="text-xs opacity-80 transition group-hover:translate-x-0.5">›</span>
          </span>
        </Link>
      </div>
    </div>
  );
};
