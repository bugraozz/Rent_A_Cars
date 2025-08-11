"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Gauge, Users, Star, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Car } from "@/types/car"

export function CarShowcase() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedCars()
  }, [])

  const fetchFeaturedCars = async () => {
    try {
      setLoading(true)
      console.log("🔥 Öne çıkan araçlar API çağrısı yapılıyor...")
      
      // En çok kiralanan araçları getir
      const response = await fetch("/api/cars/featured", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        // Eğer featured endpoint yoksa normal cars API'sini kullan
        console.log("🔥 Featured endpoint bulunamadı, normal cars API kullanılıyor...")
        const carsResponse = await fetch("/api/cars")
        const carsResult = await carsResponse.json()
        
        if (carsResult.success && carsResult.data) {
          // İlk 3 araçı featured olarak göster
          const topCars = carsResult.data.slice(0, 3).map((car: any, index: number) => ({
            ...car,
            featured: index === 0, // İlk araç featured
            specs: [
              `${car.engine_power || '400'} HP`,
              `${car.max_speed || '250'} km/h`,
              `${car.seating_capacity || '4'} Kişi`
            ]
          }))
          setFeaturedCars(topCars)
        }
        return
      }

      const result = await response.json()
      console.log("🔥 Featured cars API response:", result)
      
      if (result.success && result.data) {
        const processedCars = result.data.map((car: any, index: number) => ({
          ...car,
          featured: index === 0, // İlk araç featured
          name: car.name || `${car.brand} ${car.model} ${car.year}`,
          specs: [
            `${car.engine_power || '400'} HP`,
            `${car.max_speed || '250'} km/h`,
            `${car.seating_capacity || '4'} Kişi`
          ],
          images: car.images && Array.isArray(car.images) 
            ? car.images.map((img: any) => {
                if (typeof img === 'string') return img
                if (img && img.url) return img.url
                if (img && img.image_url) return img.image_url
                return img
              }).filter(Boolean)
            : [],
        }))
        setFeaturedCars(processedCars)
      }
    } catch (error: any) {
      console.error("🔥 Öne çıkan araçlar yüklenirken hata:", error)
      // Hata durumunda fallback olarak normal cars API'sini dene
      try {
        const carsResponse = await fetch("/api/cars")
        const carsResult = await carsResponse.json()
        
        if (carsResult.success && carsResult.data) {
          const topCars = carsResult.data.slice(0, 3).map((car: any, index: number) => ({
            ...car,
            featured: index === 0,
            name: car.name || `${car.brand} ${car.model} ${car.year}`,
            specs: [
              `${car.engine_power || '400'} HP`,
              `${car.max_speed || '250'} km/h`,
              `${car.seating_capacity || '4'} Kişi`
            ]
          }))
          setFeaturedCars(topCars)
        }
      } catch (fallbackError) {
        console.error("🔥 Fallback cars API de başarısız:", fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-transparent to-blue-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Premium <span className="text-orange-500">Koleksiyon</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Dünyanın en prestijli araçları ile lüks deneyimi yaşayın
            </p>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-white">Öne çıkan araçlar yükleniyor...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-blue-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            En Çok Kiralanan <span className="text-orange-500">Araçlar</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Müşterilerimizin en çok tercih ettiği premium araçlar
          </p>
        </div>

        {featuredCars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white text-xl">Öne çıkan araç bulunmuyor.</p>
            <p className="text-gray-400 mt-2">Lütfen daha sonra tekrar kontrol edin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredCars.map((car: any, index: number) => {
              const mainImage = car.images && car.images.length > 0 ? car.images[0] : "/car-animated.gif"
              
              return (
                <Card
                  key={car.id}
                  className={`bg-gray-800/50 border-gray-700 overflow-hidden hover:bg-gray-800/70 transition-all duration-500 group ${
                    index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                  }`}
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={mainImage}
                      alt={car.name}
                      width={600}
                      height={400}
                      className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                        index === 0 ? "h-80" : "h-64"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {car.featured && (
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                        En Popüler
                      </Badge>
                    )}

                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                        <span className="text-white text-sm font-medium">{car.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`font-bold text-white mb-2 ${index === 0 ? "text-2xl" : "text-xl"}`}>
                          {car.name}
                        </h3>
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          {car.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {car.specs && car.specs.map((spec: string, specIndex: number) => (
                        <div key={specIndex} className="text-center">
                          <div className="flex justify-center mb-2">
                            {specIndex === 0 && <Zap className="h-5 w-5 text-orange-500" />}
                            {specIndex === 1 && <Gauge className="h-5 w-5 text-orange-500" />}
                            {specIndex === 2 && <Users className="h-5 w-5 text-orange-500" />}
                          </div>
                          <div className="text-white text-sm font-medium">{spec}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-3xl font-bold text-orange-500">₺{formatPrice(car.daily_price)}</span>
                        <span className="text-gray-400 ml-1">/gün</span>
                      </div>
                      <Link href={`/cars/${car.id}`}>
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                          Rezerve Et
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/cars">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent px-8 py-4"
            >
              Tüm Koleksiyonu Görüntüle
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
