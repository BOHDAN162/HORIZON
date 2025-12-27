import React from 'react';
import { FAQ } from './FAQ';
import { FeatureCards } from './FeatureCards';
import { Footer } from './Footer';
import { Header } from './Header';
import { Hero } from './Hero';
import { LoginCard } from './LoginCard';

interface LandingScreenProps {
  onEnterUniverse: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnterUniverse }) => {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col px-6 lg:px-8">
      <Header />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          <Hero />
        </div>
        <div className="order-2 lg:col-start-2 lg:row-start-1">
          <LoginCard onEnter={onEnterUniverse} />
        </div>
        <div className="order-3 lg:col-start-1 lg:row-start-2">
          <FeatureCards />
        </div>
        <div className="order-4 lg:col-start-2 lg:row-start-2">
          <FAQ />
        </div>
      </div>
      <Footer />
    </div>
  );
};
