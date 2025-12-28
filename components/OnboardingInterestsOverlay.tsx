import React, { useEffect, useState } from 'react';

interface OnboardingInterestsOverlayProps {
  open: boolean;
  interests: string[];
  selected: string[];
  onToggle: (label: string) => void;
  onContinue: () => void;
  onClose?: () => void;
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M3 8.2 6.4 11.5 13.2 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const OnboardingInterestsOverlay: React.FC<OnboardingInterestsOverlayProps> = ({
  open,
  interests,
  selected,
  onToggle,
  onContinue,
  onClose,
}) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => setVisible(false), 240);
    return () => clearTimeout(timer);
  }, [open]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-4 sm:px-6 transition ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ backdropFilter: 'blur(18px)' }}
    >
      <div className="absolute inset-0 bg-[rgba(4,6,14,0.7)]" aria-hidden />

      <div
        className={`relative z-10 w-full max-w-5xl overflow-hidden rounded-[26px] border border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_20%_20%,rgba(159,107,255,0.14),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(95,156,255,0.14),transparent_26%),linear-gradient(135deg,rgba(18,24,42,0.92)_0%,rgba(22,16,40,0.9)_55%,rgba(25,20,48,0.92)_100%)] shadow-[0_30px_120px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7b9bff] via-[#9f6bff] to-[#5ec2ff]" aria-hidden />
        <div className="absolute -left-24 -top-28 h-56 w-56 rounded-full bg-[rgba(111,135,255,0.13)] blur-[120px]" aria-hidden />
        <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-[rgba(159,107,255,0.14)] blur-[140px]" aria-hidden />

        <div className="relative px-6 pb-6 pt-8 sm:px-10 sm:pb-10 sm:pt-12">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-lg font-semibold uppercase tracking-[0.16em] text-[rgba(255,255,255,0.65)]">Шаг 2 • Настройка</p>
            <h2 className="text-2xl font-bold text-white sm:text-[32px]">Выберите ваши интересы</h2>
            <p className="text-sm text-[rgba(233,238,247,0.75)] sm:text-base">
              Отметьте темы, которые вам реально интересны. Можно выбрать несколько.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {interests.map((interest) => {
              const isSelected = selected.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => onToggle(interest)}
                  className={`group flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'border-[rgba(146,120,255,0.7)] bg-[rgba(116,94,255,0.18)] text-white shadow-[0_12px_32px_rgba(115,133,255,0.35)]'
                      : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[rgba(233,238,247,0.9)] hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.05)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.3)]'
                  } ${isSelected ? 'ring-1 ring-[rgba(129,104,255,0.45)]' : ''}`}
                >
                  <span className="flex-1 leading-tight">{interest}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-white transition ${
                      isSelected
                        ? 'border-[rgba(255,255,255,0.2)] bg-gradient-to-br from-[#8a6bff] to-[#5f9cff] shadow-[0_12px_24px_rgba(115,133,255,0.45)]'
                        : 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.65)]'
                    } group-hover:border-[rgba(255,255,255,0.2)]`}
                    aria-hidden
                  >
                    {isSelected ? <CheckIcon /> : <span className="text-xs font-bold">+</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-end">
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-[rgba(255,255,255,0.1)] px-5 py-3 text-sm font-semibold text-[rgba(233,238,247,0.9)] transition hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)] sm:w-auto"
              >
                Пропустить
              </button>
            ) : null}
            <button
              type="button"
              onClick={onContinue}
              disabled={!selected.length}
              className="w-full rounded-xl bg-gradient-to-r from-[#8a6bff] via-[#9f6bff] to-[#5f9cff] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(115,133,255,0.4)] transition enabled:hover:brightness-110 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
