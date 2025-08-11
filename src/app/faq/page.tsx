import { ModernHeader } from "@/components/modern-header"
import { ModernFooter } from "@/components/modern-footer"
import { FaqHero } from "@/components/faq-hero"
import { FaqContent } from "@/components/faq-content"

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
      <ModernHeader />
      <FaqHero />
      <FaqContent />
      <ModernFooter />
    </div>
  )
}
