'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/app/components/ThemeSwitcher';
import { useTheme } from '@/lib/useTheme';
import { useProfile } from '@/lib/useProfile';

const AvatarBadge: React.FC<{ name: string }> = ({ name }) => (
  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-[#7c9dff] via-[#8b5cf6] to-[#4b91f7] shadow-[0_16px_55px_rgba(0,0,0,0.4)]">
    <div className="flex h-full w-full items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-10 w-10 text-white/80"
        role="img"
        aria-label={`${name} avatar placeholder`}
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
      </svg>
    </div>
  </div>
);

const Switch: React.FC<{ checked: boolean; onChange: (value: boolean) => void; theme: 'light' | 'dark' }> = ({
  checked,
  onChange,
  theme,
}) => {
  const activeColor = theme === 'dark' ? 'bg-[#825AF7]' : 'bg-[#4B91F7]';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
        checked ? activeColor : 'bg-[rgba(148,163,184,0.35)]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const BioEditModal: React.FC<{
  open: boolean;
  draft: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  isDark: boolean;
}> = ({ open, draft, onChange, onCancel, onSave, isDark }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`w-[min(560px,90vw)] rounded-2xl border px-6 py-5 shadow-[0_32px_90px_rgba(0,0,0,0.45)] ${
          isDark ? 'border-[#2a3b64] bg-[#0f1c3a]/95 text-white' : 'border-[#d8e0ee] bg-white/95 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Редактировать описание</h3>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onCancel}
            className="rounded-full p-2 text-base text-[var(--text-secondary)] transition hover:bg-[var(--hover-color)]"
          >
            ✕
          </button>
        </div>
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(event) => onChange(event.target.value)}
            className={`h-40 w-full resize-none rounded-xl border px-4 py-3 text-base outline-none transition ${
              isDark
                ? 'border-[#2e3f68] bg-[#0e234a]/80 text-white placeholder:text-slate-400 focus:border-[#825AF7]'
                : 'border-[#d6deeb] bg-[#edf2fa]/90 text-slate-900 placeholder:text-slate-500 focus:border-[#4B91F7]'
            }`}
            placeholder="Напиши пару предложений о себе..."
          />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isDark
                ? 'bg-white/5 text-slate-100 hover:bg-white/10'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#4b91f7] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(79,114,255,0.45)] transition hover:brightness-110"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal: React.FC<{ open: boolean; onClose: () => void; isDark: boolean }> = ({ open, onClose, isDark }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`w-[min(440px,90vw)] rounded-2xl border px-6 py-6 shadow-[0_32px_90px_rgba(0,0,0,0.45)] ${
          isDark ? 'border-[#3a2531] bg-[#160c14]/95 text-white' : 'border-[#f4c7cb] bg-white/95 text-slate-900'
        }`}
      >
        <h3 className="text-lg font-semibold">Удалить аккаунт</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Это действие удалит все данные без возможности восстановления. Вы уверены, что хотите продолжить?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isDark ? 'bg-white/5 text-slate-100 hover:bg-white/10' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            Отмена
          </button>
          <button
            type="button"
            className="rounded-xl border border-[#f2939a] bg-[#2a0d11] px-5 py-2 text-sm font-semibold text-[#f2939a] shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:bg-[#3a1117]"
            onClick={onClose}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { profile, updateBio, setAllowContact } = useProfile();
  const router = useRouter();
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [draftBio, setDraftBio] = useState(profile.bio);
  const isDark = theme === 'dark';

  useEffect(() => {
    setDraftBio(profile.bio);
  }, [profile.bio]);

  const cardBase = isDark
    ? 'border-[#1f2c4d] bg-[rgba(14,25,52,0.86)] text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)]'
    : 'border-[#dfe5f2] bg-white/92 text-slate-900 shadow-[0_22px_80px_rgba(15,23,42,0.12)]';

  const subtleSurface = isDark
    ? 'border-[#24345d] bg-[rgba(15,36,83,0.9)] text-white'
    : 'border-[#d6deeb] bg-[#edf2fa]/90 text-slate-900';

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/universe');
    }
  };

  const handleSaveBio = () => {
    const trimmed = draftBio.trim();
    updateBio(trimmed || profile.bio);
    setIsBioModalOpen(false);
  };

  return (
    <div className={`${theme} relative min-h-screen overflow-hidden`} data-theme={theme}>
      <div
        className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-[#0b1740] via-[#0a1538] to-[#050e2d]' : 'bg-gradient-to-b from-[#f5f7fa] via-[#edf2f7] to-[#e2e8f0]'}`}
      />
      <div className="starry-layer pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col px-4 pb-16 pt-16 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Назад"
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-lg text-[var(--text-primary)] shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              ←
            </button>
            <h1 className="text-center text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">Профиль</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Поделиться профилем"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-lg text-[var(--text-primary)] shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              ↗
            </button>
            <div className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2">
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 md:gap-8">
          <div className={`w-full rounded-3xl border ${cardBase} backdrop-blur-xl`}>
            <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:gap-5 sm:px-8 sm:py-7">
              <AvatarBadge name={profile.displayName} />
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-lg font-semibold sm:text-xl">{profile.displayName}</p>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span>@{profile.handle}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`w-full rounded-3xl border ${subtleSurface} backdrop-blur-xl`}>
            <div className="flex items-start justify-between gap-4 px-6 py-6 sm:px-8 sm:py-7">
              <div>
                <p className="text-base font-semibold sm:text-lg">Кто я?</p>
                <p className={`mt-3 text-sm leading-relaxed sm:text-base ${isDark ? 'text-white/85' : 'text-slate-800'}`}>
                  {profile.bio}
                </p>
              </div>
              <button
                type="button"
                aria-label="Редактировать описание"
                title="Редактировать описание"
                onClick={() => {
                  setDraftBio(profile.bio);
                  setIsBioModalOpen(true);
                }}
                className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-lg text-[var(--text-primary)] transition hover:border-[var(--panel-border)] hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                ✎
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className={`flex w-full items-center gap-4 rounded-3xl border px-6 py-4 sm:px-8 sm:py-5 ${cardBase} backdrop-blur-xl`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isDark ? 'bg-[#0f234e]' : 'bg-[#e5edff]'
                  }`}
                >
                  <span className="text-2xl text-[#4b91f7]">✈️</span>
                </div>
                <div>
                  <p className="text-sm font-semibold sm:text-base">Telegram для связи</p>
                  <p className="text-xs text-[var(--text-secondary)] sm:text-sm">Другие могут написать</p>
                </div>
              </div>
              <div className="ml-auto">
                <Switch checked={profile.allowContact} onChange={setAllowContact} theme={theme} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className={`flex w-full items-center justify-between rounded-3xl border px-6 py-4 text-left sm:px-8 sm:py-5 ${isDark ? 'border-[#3a2531] bg-[#140c12]/90 text-white hover:border-[#f2939a]/60 hover:bg-[#1b0f17]/90' : 'border-[#f2d1d4] bg-[#fff6f7] text-[#7c1d29] hover:border-[#e57373] hover:bg-[#ffe8ea]'} shadow-[0_22px_70px_rgba(0,0,0,0.28)] transition`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2a0d11] text-xl text-[#f2939a]">
                  🗑️
                </div>
                <div>
                  <p className="text-sm font-semibold sm:text-base">Удалить аккаунт</p>
                  <p className="text-xs text-[var(--text-secondary)] sm:text-sm">Навсегда удалить все данные</p>
                </div>
              </div>
              <span className="text-lg text-[var(--text-secondary)]">›</span>
            </button>
          </div>
        </div>
      </div>

      <BioEditModal
        open={isBioModalOpen}
        draft={draftBio}
        onChange={setDraftBio}
        onCancel={() => setIsBioModalOpen(false)}
        onSave={handleSaveBio}
        isDark={isDark}
      />
      <DeleteConfirmModal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDark={isDark} />
    </div>
  );
};
