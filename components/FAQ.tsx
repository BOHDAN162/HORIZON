import React from 'react';

const questions = [
  {
    q: 'Почему не приходит код?',
    a: 'Код не нужен! Просто нажми синюю кнопку и разреши доступ в Telegram.'
  },
  {
    q: 'Подписался, но не могу войти?',
    a: 'После подписки на канал нажми кнопку входа ещё раз.'
  }
];

export const FAQ: React.FC = () => {
  return (
    <section className="faq-glass rounded-2xl px-5 py-5 text-left text-sm sm:px-6 sm:py-6">
      <h3 className="mb-3 text-base font-semibold text-textPrimary">Частые вопросы:</h3>
      <div className="space-y-4">
        {questions.map((item) => (
          <div key={item.q} className="space-y-1">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-[#6fb5ff]">Q:</span>
              <p className="text-textPrimary">{item.q}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-[#7bec9c]">A:</span>
              <p className="text-textSecondary">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
