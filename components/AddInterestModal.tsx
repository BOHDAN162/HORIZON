import React, { useEffect, useState } from 'react';

interface AddInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (label: string) => { success: boolean; error?: string };
}

export const AddInterestModal: React.FC<AddInterestModalProps> = ({ isOpen, onClose, onAdd }) => {
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
      setValue('');
      setError('');
      onClose();
      return;
    }
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(5,10,20,0.65)] px-4 backdrop-blur-sm">
      <div className="card-glass w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(15,22,35,0.9)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-textPrimary">Добавить интерес</h3>
            <p className="text-sm text-textSecondary">Например: технологии, философия, бизнес…</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[rgba(255,255,255,0.06)] px-2 py-1 text-sm font-semibold text-textSecondary transition hover:bg-[rgba(255,255,255,0.1)]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Например: технологии, философия, бизнес…"
            className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,14,26,0.8)] px-3.5 py-2.5 text-sm text-textPrimary outline-none ring-1 ring-transparent transition focus:border-[rgba(111,135,255,0.45)] focus:ring-[rgba(111,135,255,0.35)]"
          />
          {error ? <p className="text-[13px] font-medium text-[#ffb4c0]">{error}</p> : null}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-textSecondary transition hover:bg-[rgba(255,255,255,0.04)]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-to-r from-[#6f87ff] to-[#9f6bff] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(100,121,255,0.35)] transition hover:brightness-105"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};
