import { Card, CardContent } from "@/components/ui/card"
import { Shield, Heart, Zap, Award, Users, Clock } from "lucide-react"

const values = [
  {
    icon: Shield,
    title: "Güvenlik",
    description: "Tüm araçlarımız kapsamlı sigorta ile korunur ve düzenli güvenlik kontrollerinden geçer.",
  },
  {
    icon: Heart,
    title: "Müşteri Odaklılık",
    description: "Müşteri memnuniyeti bizim için her şeyden önce gelir. 7/24 destek ile yanınızdayız.",
  },
  {
    icon: Zap,
    title: "Hızlı Hizmet",
    description: "Rezervasyondan teslime kadar tüm süreçleri hızlı ve sorunsuz bir şekilde yönetiyoruz.",
  },
  {
    icon: Award,
    title: "Kalite",
    description: "Sadece en yüksek kalitedeki araçları filomuzda bulundurur, mükemmel durumda tutarız.",
  },
  {
    icon: Users,
    title: "Profesyonellik",
    description: "Deneyimli ve eğitimli ekibimizle size en profesyonel hizmeti sunmaya odaklanırız.",
  },
  {
    icon: Clock,
    title: "Güvenilirlik",
    description: "15 yıllık deneyimimizle verdiğimiz sözleri tutma konusunda güvenilir bir partneriz.",
  },
]

export function AboutValues() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-950 to-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Değerlerimiz</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            DRIVE olarak bizi farklı kılan değerler ve ilkelerimiz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card
              key={index}
              className="bg-gradient-to-b from-blue-950/30 to-black/30 border-orange-600/50 hover:from-blue-950/50 hover:to-black/50 transition-all duration-300 group backdrop-blur-sm"
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
