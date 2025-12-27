import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="space-y-6 pt-10 text-left lg:pt-12">
      <div className="fade-in-up space-y-2.5" style={{ animationDelay: '0s' }}>
        <div className="flex items-center gap-2 text-[28px] font-bold leading-[32px] text-textPrimary lg:text-[30px]">
          <span className="text-gradient">HORIZON</span>
          <span>—</span>
        </div>
        <div className="text-[46px] font-black leading-[54px] text-textPrimary sm:text-[52px] sm:leading-[58px] lg:text-[58px] lg:leading-[64px]">
          <p>исследуй своё</p>
          <p>мышление</p>
        </div>
      </div>
      <p className="fade-in-up max-w-2xl text-base leading-[30px] text-textSecondary" style={{ animationDelay: '0.08s' }}>
        Визуализируй свои интересы, находи единомышленников и открывай новые горизонты. Расскажи о себе — ИИ сделает
        остальное.
      </p>
    </section>
  );
};
