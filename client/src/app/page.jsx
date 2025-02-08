"use client"

import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { Footer } from "@/components/Footer"
import { FeedbackSection } from "@/components/SocialProofSection"
import { SocketProvider } from "./context/socket"

export default function Home() {
  return (
    //<SocketProvider>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <HeroSection />
        <FeaturesSection />
        <FeedbackSection />
        <Footer/>
      </main>
    //</SocketProvider>
  )
}

