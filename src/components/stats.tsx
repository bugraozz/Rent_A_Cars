import { TrendingUp, Shield, Clock, Award } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    number: "98%",
    label: "Müşteri Memnuniyeti",
    description: "Yüksek kalite standartları",
  },
  {
    icon: Shield,
    number: "100%",
    label: "Güvenlik Garantisi",
    description: "Tam kapsamlı sigorta",
  },
  {
    icon: Clock,
    number: "24/7",
    label: "Kesintisiz Hizmet",
    description: "Her zaman yanınızda",
  },
  {
    icon: Award,
    number: "15+",
    label: "Yıllık Deneyim",
    description: "Sektör lideri",
  },
]

export function Stats() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-950 to-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-xl font-semibold text-orange-500 mb-2">{stat.label}</div>
              <div className="text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
