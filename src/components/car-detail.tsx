import React from "react"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Award, Clock,  Users, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car as CarType } from "@/types/car"

interface CarDetailProps {
  car?: CarType
}

export function CarDetail({ car }: CarDetailProps) {
  // Varsayılan değerler (car prop'u yoksa)
  const defaultCar: CarType = {
    id: 1,
    name: "Lamborghini Huracán EVO",
    brand: "Lamborghini",
    model: "Huracán EVO",
    year: 2023,
    category: "Süper Spor",
    price: 8500000,
    daily_price: 12000,
    fuel_type: "Benzin",
    transmission: "Otomatik",
    color: "Sarı",
    images: ["/car-animated.gif"],
    status: "available",
    available_from: "2024-01-15",
    description: "İtalyan mühendisliğinin zirvesi Lamborghini Huracán EVO, 640 beygir gücüyle size unutulmaz bir sürüş deneyimi sunar. V10 motorun nefes kesen sesi ve mükemmel aerodinamik tasarımıyla yollarda tüm dikkatleri üzerinize çekeceksiniz.",
    min_driver_age: 25,
    min_license_years: 3,
    requires_credit_card: true,
    requires_deposit: true,
    created_at: "2024-01-15T10:30:00Z",
    seating_capacity: "",
    max_speed: "",
    engine_power: ""
  }

  const currentCar = car || defaultCar

  // Galeri görselleri ve seçili görsel state'i

  // const availabilityInfo = getAvailabilityStatus()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-gradient-to-r from-green-500 to-green-600"
      case "busy":
        return "bg-gradient-to-r from-orange-500 to-orange-600"
      case "maintenance":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600"
      case "reserved":
        return "bg-gradient-to-r from-purple-500 to-purple-600"
      default:
        return "bg-gradient-to-r from-red-500 to-red-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Müsait"
      case "busy":
        return "Meşgul"
      case "maintenance":
        return "Bakımda"
      case "reserved":
        return "Rezerve Edilmiş"
      default:
        return currentCar.category
    }
  }

  const specs = [
    {
      icon: Users,
      label: "Min. Sürücü Yaşı",
      value: `${(car || currentCar).min_driver_age || 21} yaş`
    },
    {
      icon: Award,
      label: "Min. Ehliyet Yılı",
      value: `${(car || currentCar).min_license_years || 2} yıl`
    },
    {
      icon: CreditCard,
      label: "Kredi Kartı",
      value: (car || currentCar).requires_credit_card ? "Gerekli" : "İsteğe Bağlı"
    },
    {
      icon: Shield,
      label: "Depozito",
      value: (car || currentCar).requires_deposit ? "Gerekli" : "Gerekli Değil"
    }
  ]
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <Badge className={`${getStatusColor((car || currentCar).status)} text-white border-0`}>
            {getStatusLabel((car || currentCar).status)}
          </Badge>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
            <span className="text-white font-medium">{(car || currentCar).rating || 5.0}</span>
            <span className="text-gray-400">({(car || currentCar).review_count || 24} değerlendirme)</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{(car || currentCar).name}</h1>
        
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{formatPrice((car || currentCar).daily_price)}</div>
            <div className="text-gray-400">/ günlük</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{formatPrice((car || currentCar).price)}</div>
            <div className="text-gray-400">toplam fiyat</div>
          </div>
        </div>

        <p className="text-xl text-gray-300 leading-relaxed">
          {(car || currentCar).description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 rounded-2xl p-6 text-center">
          <Shield className="h-8 w-8 text-orange-500 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">Tam Sigorta</h3>
          <p className="text-gray-400 text-sm">Kapsamlı sigorta dahil</p>
        </div>

        <div className="bg-gray-900/50 rounded-2xl p-6 text-center">
          <Award className="h-8 w-8 text-orange-500 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">Premium Hizmet</h3>
          <p className="text-gray-400 text-sm">VIP müşteri deneyimi</p>
        </div>

        <div className="bg-gray-900/50 rounded-2xl p-6 text-center">
          <Clock className="h-8 w-8 text-orange-500 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">7/24 Destek</h3>
          <p className="text-gray-400 text-sm">Kesintisiz müşteri desteği</p>
        </div>
      </div>

       

       <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Kiralama koşulları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specs.map((spec, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <spec.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">{spec.label}</div>
                <div className="text-white font-semibold text-lg">{spec.value}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
