import { ModernHeader } from "@/components/modern-header"
import { ModernFooter } from "@/components/modern-footer"
import { AboutHero } from "@/components/about-hero"
import { AboutStory } from "@/components/about-story"

import { AboutValues } from "@/components/about-values"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
      <ModernHeader />
      <AboutHero />
      <AboutStory />
      <AboutValues />
      
      <ModernFooter />
    </div>
  )
}
