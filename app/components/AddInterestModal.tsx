import React, { useEffect, useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (label: string) => { success: boolean; error?: string };
};

export const AddInterestModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const result = onAdd(value);
    if (result.success) {
      onClose();
    } else if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.45)] px-4 backdrop-blur-sm" data-ui-layer="true">
      <div className="w-full max-w-md rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-[var(--text-primary)]">Добавить интерес</p>
            <p className="text-sm text-[var(--text-secondary)]">Введите одно или два слова</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === 'Escape') onClose();
            }}
            autoFocus
            className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="Например: системное мышление"
          />
          {error ? <p className="text-xs font-semibold text-[#f2939a]">{error}</p> : null}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--hover-color)]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-[var(--accent-gradient)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(96,123,255,0.35)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};
