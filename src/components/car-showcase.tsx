// Type for featured car with extra fields

"use client"
type FeaturedCar = Partial<Car> & { featured?: boolean; specs?: string[] };
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Car } from "@/types/car"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

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
    const topCars = carsResult.data.slice(0, 3).map((car: Partial<Car>, index: number) => ({
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
        const processedCars = result.data.map((car: Partial<Car>, index: number) => ({
          ...car,
          featured: index === 0, // İlk araç featured
          name: car.name || `${car.brand} ${car.model} ${car.year}`,
          specs: [
            `${car.engine_power || '400'} HP`,
            `${car.max_speed || '250'} km/h`,
            `${car.seating_capacity || '4'} Kişi`
          ],
          images: car.images && Array.isArray(car.images) 
            ? car.images.map((img: string | { url?: string; image_url?: string }) => {
                if (typeof img === 'string') return img;
                if (img && typeof img === 'object' && 'url' in img && img.url) return img.url;
                if (img && typeof img === 'object' && 'image_url' in img && img.image_url) return img.image_url;
                return '';
              }).filter(Boolean)
            : [],
        }))
        setFeaturedCars(processedCars)
      }
    } catch (error: unknown) {
      console.error("🔥 Öne çıkan araçlar yüklenirken hata:", error)
      // Hata durumunda fallback olarak normal cars API'sini dene
      try {
        const carsResponse = await fetch("/api/cars")
        const carsResult = await carsResponse.json()
        
        if (carsResult.success && carsResult.data) {
          const topCars = carsResult.data.slice(0, 3).map((car: Partial<Car>, index: number) => ({
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

  const formatISODate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const createBookingHref = (car: FeaturedCar) => {
    const carId = car.id ?? 0
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const dayAfterTomorrow = new Date(now)
    dayAfterTomorrow.setDate(now.getDate() + 2)

    const startDate = formatISODate(tomorrow)
    const endDate = formatISODate(dayAfterTomorrow)
    const rentalDays = 1

    const dailyPrice = car.daily_price ?? 0
    const subtotal = dailyPrice * rentalDays
    const tax = subtotal * 0.2
    const total = subtotal + tax

    const params = new URLSearchParams({
      carId: String(carId),
      startDate,
      endDate,
      rentalDays: String(rentalDays),
      subtotal: String(subtotal),
      tax: String(tax),
      total: String(total),
    })

    return `/booking?${params.toString()}`
  }

  const movingItems = useMemo(() => {
    return (featuredCars as FeaturedCar[]).map((car) => {
      const name = car.name ?? `${car.brand ?? "Araç"} ${car.model ?? ""}`.trim()
      const specs = car.specs ?? [
        `${car.engine_power || "400"} HP`,
        `${car.max_speed || "250"} km/h`,
        `${car.seating_capacity || "4"} Kişi`,
      ]
      const mainImage = Array.isArray(car.images) && car.images.length > 0
        ? car.images[0]
        : "/car-animated.gif"

      return {
        quote: car.description || `${name} premium sürüş deneyimi sunar.`,
        name,
        title: `${car.brand ?? ""} ${car.model ?? ""} ${car.year ?? ""}`.trim(),
        image: typeof mainImage === "string" ? mainImage : "/car-animated.gif",
        price: `₺${formatPrice(car.daily_price ?? 0)}`,
        category: car.category ?? "Premium",
        rating: `${car.rating ?? 4.8}`,
        specs,
        ctaHref: createBookingHref(car),
        ctaLabel: "Rezerve Et",
      }
    })
  }, [featuredCars])

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
    <section className="relative overflow-hidden py-20 bg-[radial-gradient(80%_120%_at_10%_0%,rgba(249,115,22,0.16),transparent_55%),radial-gradient(70%_110%_at_100%_20%,rgba(59,130,246,0.14),transparent_60%),linear-gradient(to_bottom,#020617,#030712)]">
      <div className="container mx-auto px-6">
        <div className="mb-14 flex flex-col gap-4 text-center">
          <p className="mx-auto w-fit rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-orange-200">
            Sezonun Favorileri
          </p>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            En Çok Kiralanan <span className="text-orange-400">Araçlar</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            Müşterilerimizin en çok tercih ettiği premium araçları, anında rezervasyon akışıyla keşfedin.
          </p>
        </div>

        {featuredCars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white text-xl">Öne çıkan araç bulunmuyor.</p>
            <p className="text-gray-400 mt-2">Lütfen daha sonra tekrar kontrol edin.</p>
          </div>
        ) : (
          <InfiniteMovingCards
            items={movingItems}
            direction="left"
            speed="normal"
            className="max-w-none"
          />
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