import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Gauge, Users, Fuel, Settings, Calendar, Car as CarIcon, Palette } from "lucide-react"
import type { Car } from "@/types/car"

interface CarSpecsProps {
  car?: Car
}

export function CarSpecs({ car }: CarSpecsProps) {
  
  // Dinamik specs (car varsa)
  const dynamicSpecs = car ? [
    { icon: CarIcon, label: "Marka", value: car.brand },
    { icon: Settings, label: "Model", value: car.model },
    { icon: Calendar, label: "Model Yılı", value: car.year.toString() },
    { icon: Gauge, label: "Kategori", value: car.category },
    { icon: Fuel, label: "Yakıt Tipi", value: car.fuel_type },
    { icon: Settings, label: "Şanzıman", value: car.transmission },
    { icon: Palette, label: "Renk", value: car.color },
    { 
      icon: Zap, 
      label: "Durum", 
      value: 
        car.status === "available" ? "Müsait" :
        car.status === "maintenance" ? "Bakımda" :
        car.status === "busy" ? "Dolu" :
        car.status === "reserved" ? "Rezerve" :
        String(car.status)
    },
  ] 

  : [];
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Teknik Özellikler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dynamicSpecs.map((spec, index) => (
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
  )
}
