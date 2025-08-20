import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Users, Car, Globe } from "lucide-react"

export function AboutStory() {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-blue-950">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="mb-6 bg-gradient-to-r from-orange-600 to-orange-800 text-white border-0 px-4 py-2">
              Hikayemiz
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">Lüks Araç Kiralama Sektöründe 15 Yıllık Deneyim</h2>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                2009 yılında kurulan DRIVE, Türkiye&#39;nin en prestijli araç kiralama şirketi olma vizyonuyla yola çıktı.
                İlk günden itibaren müşteri memnuniyetini ön planda tutarak, sektörde fark yaratan hizmetler sunmaya
                odaklandık.
              </p>
              <p>
                Bugün 50+ şehirde hizmet veren DRIVE, 500+ premium araçlık filomuzla müşterilerimize unutulmaz
                deneyimler yaşatmaya devam ediyor. Her araç özenle seçilmiş, düzenli bakımdan geçmiş ve en yüksek
                standartlarda tutulmaktadır.
              </p>
              <p>
                Lamborghini&rsquo;den Ferrari&rsquo;ye, BMW&rsquo;den Mercedes&rsquo;e kadar dünyanın en prestijli markalarının en yeni
                modellerini filomuzda bulabilirsiniz.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-gradient-to-b from-blue-950/30 to-black/30 border-orange-600/50 text-center p-6 backdrop-blur-sm">
              <Award className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">15+</div>
              <div className="text-gray-400">Yıllık Deneyim</div>
            </Card>

            <Card className="bg-gradient-to-b from-blue-950/30 to-black/30 border-orange-600/50 text-center p-6 backdrop-blur-sm">
              <Users className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Mutlu Müşteri</div>
            </Card>

            <Card className="bg-gradient-to-b from-blue-950/30 to-black/30 border-orange-600/50 text-center p-6 backdrop-blur-sm">
              <Car className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400">Premium Araç</div>
            </Card>

            <Card className="bg-gradient-to-b from-blue-950/30 to-black/30 border-orange-600/50 text-center p-6 backdrop-blur-sm">
              <Globe className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Şehir</div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
