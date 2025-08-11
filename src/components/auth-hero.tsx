import { Badge } from "@/components/ui/badge"

interface AuthHeroProps {
  title: string
  subtitle: string
  badge: string
}

export function AuthHero({ title, subtitle, badge }: AuthHeroProps) {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-10" />
      <div className="relative container mx-auto px-6 text-center">
        <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2">
          {badge}
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black mb-6">
          <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </section>
  )
}
