import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MapPin, Clock, Car, Headphones } from "lucide-react"

const contactInfo = [
  {
    icon: Phone,
    title: "Telefon",
    details: ["+90 850 123 45 67", "+90 212 123 45 67"],
    description: "7/24 müşteri hizmetleri",
  },
  {
    icon: Mail,
    title: "E-posta",
    details: ["info@drive.com", "destek@drive.com"],
    description: "24 saat içinde yanıt garantisi",
  },
  {
    icon: MapPin,
    title: "Merkez Ofis",
    details: ["Maslak Mahallesi", "İstanbul, Türkiye"],
    description: "Ana ofisimizi ziyaret edin",
  },
  {
    icon: Clock,
    title: "Çalışma Saatleri",
    details: ["Pazartesi - Pazar", "24 Saat Açık"],
    description: "Kesintisiz hizmet",
  },
]

const services = [
  {
    icon: Car,
    title: "Araç Teslimi",
    description: "İstediğiniz lokasyona araç teslimi",
  },
  {
    icon: Headphones,
    title: "7/24 Destek",
    description: "Kesintisiz müşteri desteği",
  },
]

export function ContactInfo() {
  return (
    <div className="space-y-8">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-8">
          <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2">
            İletişim Bilgileri
          </Badge>

          <div className="space-y-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <info.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-300">
                      {detail}
                    </p>
                  ))}
                  <p className="text-gray-400 text-sm mt-1">{info.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-8">
          <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2">
            Hizmetlerimiz
          </Badge>

          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <service.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{service.title}</h4>
                  <p className="text-gray-400 text-sm">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Acil Durum Desteği</h3>
          <p className="text-gray-300 mb-6">
            Kiralama süresince herhangi bir sorun yaşarsanız, 7/24 acil durum hattımızı arayabilirsiniz.
          </p>
          <div className="text-2xl font-bold text-orange-500">+90 850 ACIL (2245)</div>
        </CardContent>
      </Card>
    </div>
  )
}
