import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { SocialProofSection } from "@/components/SocialProofSection"
import { Footer } from "@/components/Footer"
import { FeedbackSection } from "@/components/SocialProofSection"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroSection />
      <FeaturesSection />
      <FeedbackSection />
      <Footer/>
    </main>
  )
}

