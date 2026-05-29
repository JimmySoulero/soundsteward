import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { LearnHearUnderstand } from "@/components/landing/LearnHearUnderstand";
import { Mission } from "@/components/landing/Mission";
import { WhyLearnNumbers } from "@/components/landing/WhyLearnNumbers";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LearnHearUnderstand />
        <Mission />
        <WhyLearnNumbers />
      </main>
      <Footer />
    </>
  );
}
