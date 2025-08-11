import { ModernHero } from "@/components/modern-hero"
import { QuickSearch } from "@/components/quick-search"
import { CarShowcase } from "@/components/car-showcase"
import { ModernHeader } from "@/components/modern-header"
import { Stats } from "@/components/stats"
import { Testimonials } from "@/components/testimonials"
import { ModernFooter } from "@/components/modern-footer"



export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <ModernHeader />
      <ModernHero />
      <QuickSearch />
      <CarShowcase />
      <Stats />
      <Testimonials />
      <ModernFooter />
    </div>
  )
}