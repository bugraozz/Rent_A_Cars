import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Zap, Gauge, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const relatedCars = [
  {
    id: 2,
    name: "Ferrari F8 Tributo",
    category: "Süper Spor",
    price: 3200,
    rating: 5.0,
    specs: ["720 HP", "340 km/h", "2 Kişi"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "BMW M8 Competition",
    category: "Lüks Spor",
    price: 1800,
    rating: 4.9,
    specs: ["625 HP", "305 km/h", "4 Kişi"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    name: "Porsche 911 Turbo S",
    category: "Spor",
    price: 2000,
    rating: 4.9,
    specs: ["650 HP", "330 km/h", "4 Kişi"],
    image: "/placeholder.svg?height=200&width=300",
  },
]

export function RelatedCars() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Benzer Araçlar</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Size uygun olabilecek diğer premium araçları keşfedin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedCars.map((car) => (
            <Card
              key={car.id}
              className="bg-gray-800/50 border-gray-700 overflow-hidden hover:bg-gray-800/70 transition-all duration-300 group"
            >
              <div className="relative">
                <Image
                  src={car.image || "/placeholder.svg"}
                  alt={car.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute top-4 left-4">
                  <Badge variant="outline" className="border-orange-500 text-orange-500 bg-black/50">
                    {car.category}
                  </Badge>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    <span className="text-white font-medium">{car.rating}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-white mb-4">{car.name}</h3>

                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  {car.specs.map((spec, index) => (
                    <div key={index} className="text-center p-2 bg-gray-900/50 rounded-lg">
                      <div className="flex justify-center mb-1">
                        {index === 0 && <Zap className="h-3 w-3 text-orange-500" />}
                        {index === 1 && <Gauge className="h-3 w-3 text-orange-500" />}
                        {index === 2 && <Users className="h-3 w-3 text-orange-500" />}
                      </div>
                      <span className="text-white text-xs">{spec}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold text-orange-500">₺{car.price}</span>
                    <span className="text-gray-400 ml-1">/gün</span>
                  </div>
                </div>

                <Link href={`/cars/${car.id}`}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                    İncele
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
