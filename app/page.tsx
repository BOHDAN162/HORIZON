import { FAQ } from '@/components/FAQ';
import { FeatureCards } from '@/components/FeatureCards';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { LoginCard } from '@/components/LoginCard';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col px-6 lg:px-8">
        <Header />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-2 lg:items-start lg:gap-10">
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <Hero />
          </div>
          <div className="order-2 lg:col-start-2 lg:row-start-1">
            <LoginCard />
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
    </main>
  );
}
