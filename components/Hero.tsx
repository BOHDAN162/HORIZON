import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="space-y-6 pt-10 text-left lg:pt-14">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[32px] font-bold leading-[36px] text-textPrimary lg:text-[34px]">
          <span className="text-gradient">Gorisont</span>
          <span>—</span>
        </div>
        <div className="text-[56px] font-black leading-[64px] text-textPrimary sm:text-[64px] sm:leading-[70px] lg:text-[72px] lg:leading-[78px]">
          <p>исследуй своё</p>
          <p>мышление</p>
        </div>
      </div>
      <p className="max-w-2xl text-lg leading-8 text-textSecondary">
        Визуализируй свои интересы, находи единомышленников и открывай новые горизонты. Расскажи о себе — ИИ сделает
        остальное.
      </p>
    </section>
  );
};
