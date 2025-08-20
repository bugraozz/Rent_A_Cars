"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Zap, Gauge, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Car } from "@/types/car"

type RelatedCarsProps = {
  currentCarId?: number
  category?: string
}

export function RelatedCars({ currentCarId, category }: RelatedCarsProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/cars", { headers: { "Content-Type": "application/json" } })
        const json = await res.json()
        if (isMounted && json?.success && Array.isArray(json.data)) {
          setCars(json.data)
        }
      } catch (e) {
        console.error("Related cars fetch failed", e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  const related = useMemo(() => {
    // Önce mevcut aracı çıkar
    const base = currentCarId ? cars.filter((c) => c.id !== currentCarId) : cars

    const norm = (s?: string) => (s || "").trim().toLowerCase()
    let filtered = base

    // Kategoriye göre filtrele; boş gelirse fallback olarak tüm listeden devam et
    if (category) {
      filtered = base.filter((c) => norm(c.category) === norm(category))
      if (filtered.length === 0) {
        filtered = base
      }
    }

    // Tercihen müsait olanları öne al, sonra fiyata göre azalan sırala
    const sorted = [...filtered].sort((a, b) => {
      const sa = a.status === "available" ? 0 : 1
      const sb = b.status === "available" ? 0 : 1
      if (sa !== sb) return sa - sb
      return (b.daily_price || 0) - (a.daily_price || 0)
    })
    return sorted.slice(0, 3)
  }, [cars, currentCarId, category])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0 }).format(price || 0)

  if (loading) {
    return null
  }

  if (related.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Benzer Araçlar</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Size uygun olabilecek diğer premium araçları keşfedin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {related.map((car) => {
            const name = car.name || `${car.brand} ${car.model} ${car.year}`
            const image = Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : "/car-animated.gif"
            const specs = [
              // Bu alanlar veritabanında olmayabilir; kullanıcıya bilgi veren 3 ufak özellik gösterelim
              (car.features && car.features[0]) || (car.fuel_type ? car.fuel_type.toUpperCase() : ""),
              car.transmission || "Otomatik",
              `${car.year || ""}`,
            ].filter(Boolean)

            return (
              <Card
                key={car.id}
                className="bg-gray-800/50 border-gray-700 overflow-hidden hover:bg-gray-800/70 transition-all duration-300 group"
              >
                <div className="relative">
                  <Image
                    src={image}
                    alt={name}
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
                      <span className="text-white font-medium">{car.rating ?? 4.7}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-white mb-4">{name}</h3>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    {specs.slice(0, 3).map((spec, index) => (
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
                      <span className="text-2xl font-bold text-orange-500">₺{formatPrice(car.daily_price)}</span>
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
            )
          })}
        </div>
      </div>
    </section>
  )
}
