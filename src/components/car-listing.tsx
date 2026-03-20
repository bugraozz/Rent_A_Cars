"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, CheckCircle2, ChevronDown, Gauge, Loader2, Shield, Sparkles, Users, Zap } from "lucide-react"
import { toast } from "sonner"
import { Car } from "@/types/car"

interface CarListingProps {
  filters?: {
  location?: string
  locationIds?: number[]
    startDate?: string
    endDate?: string
    category?: string
  }
}

export function CarListing({ filters }: CarListingProps) {
  const router = useRouter()
  // DEBUG: fetchCars otomatik çağrılıyor mu?
  useEffect(() => {
    console.log("[DEBUG] useEffect: fetchCars çağrılıyor!");
    fetchCars();
    // fetchCars fonksiyonu stable değilse, dependency array'den kaldırmak için aşağıdaki satırı kullanabilirsiniz:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>("")
  const [expandedCarId, setExpandedCarId] = useState<number | null>(null)

  // Cars ve filteredCars state değişikliklerini izle
  useEffect(() => {
    console.log("🔥 Cars state değişti:", { length: cars.length, cars })
    console.log("🔥 Aktif filtreler:", filters)
    console.log("🔥 filteredCars state:", { length: filteredCars.length, filteredCars })
    // filteredCars fonksiyonu stable değilse, dependency array'den kaldırmak için aşağıdaki satırı kullanabilirsiniz:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars, filters]);

  // fetchCars fonksiyonunu useCallback ile sarmala
  const fetchCars = async () => {
    try {
      setLoading(true)
      console.log("🔥 Araç listesi API çağrısı yapılıyor...")
      console.log("🔥 Filters:", filters)
      
      // URL parametrelerini oluştur
      const queryParams = new URLSearchParams()
      if (filters?.startDate && filters?.endDate) {
        queryParams.set('startDate', filters.startDate)
        queryParams.set('endDate', filters.endDate)
      }
      if (filters?.category && filters.category !== 'all') {
        queryParams.set('category', filters.category)
      }
      if (filters?.locationIds && filters.locationIds.length > 0) {
        queryParams.set('locations', filters.locationIds.join(','))
      }
      
      const apiUrl = `/api/cars${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      console.log("🔥 API URL:", apiUrl)
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("🔥 Response status:", response.status)
      console.log("🔥 Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("🔥 Error response:", errorText)
        throw new Error(`API hatası: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("🔥 API'den gelen ham veri:", result)
      console.log("🔥 Success durumu:", result.success)
      console.log("🔥 Data array uzunluğu:", result.data?.length)
      
      if (result.success && result.data) {
        console.log("🔥 API başarılı, veri işleniyor...")
        console.log("🔥 Ham araç verisi:", result.data)
        
        // API'den gelen veriyi uygun formata çevir
        const carsData = result.data.map((car: Car) => {
          console.log("🔥 İşlenen araç verisi:", {
            id: car.id,
            name: car.name,
            status: car.status,
            available_from: car.available_from,
            available_from_type: typeof car.available_from
          })
          
          let imagesArr: string[] = [];
          if (typeof car.images === 'string' && (car.images as string).length > 0) {
            imagesArr = [car.images as string];
          } else if (Array.isArray(car.images)) {
            imagesArr = car.images.map((img: string | { url?: string; image_url?: string }) => {
              if (typeof img === 'string') return img;
              if (img && img.url) return img.url;
              if (img && img.image_url) return img.image_url;
              return '';
            }).filter(Boolean);
          }
          return {
            ...car,
            images: imagesArr,
          }
        })
        
        console.log("🔥 İşlenmiş araç listesi:", carsData)
        console.log("🔥 SetCars çağrılıyor, uzunluk:", carsData.length)
        setCars(carsData)
      } else {
        console.log("🔥 API başarısız veya data yok:", { success: result.success, hasData: !!result.data })
        throw new Error("Geçersiz API yanıtı")
      }
    } catch (error) {
      console.error("🔥 Araç listesi yüklenirken hata:", error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      console.error("🔥 Hata detayı:", errorMessage)
      if (error instanceof Error) {
        console.error("🔥 Hata stack:", error.stack)
      }
      toast.error(`Araç listesi yüklenemedi: ${errorMessage}`)
    } finally {
      console.log("🔥 Loading false yapılıyor")
      setLoading(false)
    }
  }

  // Filtrelenmiş araçları hesapla
  const filteredCars = cars.filter(car => {
    // Log: Tüm filtreler ve araç
    console.log('[FILTRE] Araç kontrol ediliyor:', car)
    console.log('[FILTRE] Aktif filtreler:', filters)
    // Eğer hiç filtre yoksa, tüm araçları göster
    if (!filters || Object.keys(filters).length === 0) {
      console.log('[FILTRE] Filtre yok, araç gösteriliyor:', car)
      return true;
    }
    // Lokasyon filtresi
    if (filters?.locationIds && filters.locationIds.length > 0) {
      if (!car.location_id || !filters.locationIds.includes(Number(car.location_id))) {
        console.log('[FILTRE] Araç elendi (lokasyon):', car)
        return false
      }
    }
    // Kategori filtresi
    if (filters?.category && filters.category !== 'all') {
      if (car.category?.toLowerCase() !== filters.category.toLowerCase()) {
        console.log('[FILTRE] Araç elendi (kategori):', car)
        return false
      }
    }

    // Tarih aralığında müsaitlik kontrolü (sadece available araçlar için)
    if (filters?.startDate && filters?.endDate) {
      // Eğer araç rezerve edilmişse ve available_from tarihi filtrelenen tarihten sonraysa, gösterme
      if (car.status === 'reserved' && car.available_from) {
        const availableDate = new Date(car.available_from)
        const filterStartDate = new Date(filters.startDate)
        if (availableDate > filterStartDate) {
          console.log('[FILTRE] Araç elendi (tarih - reserved):', car)
          return false
        }
      }
      // Bakımda veya meşgul araçları gösterme
      if (car.status === 'maintenance' || car.status === 'busy') {
        console.log('[FILTRE] Araç elendi (bakımda/meşgul):', car)
        return false
      }
    }
    console.log('[FILTRE] Araç gösterilecek:', car)
    return true
  })

  const handleSortChange = (value: string) => {
    setSortBy(value)
    const sortedCars = [...filteredCars]
    
    switch (value) {
      case "price-low":
        sortedCars.sort((a, b) => a.daily_price - b.daily_price)
        break
      case "price-high":
        sortedCars.sort((a, b) => b.daily_price - a.daily_price)
        break
      case "rating":
        sortedCars.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "popular":
        sortedCars.sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
        break
      default:
        break
    }
    
    // Sıralanmış araçları ana cars state'ine geri koy
    setCars(prevCars => {
      const otherCars = prevCars.filter(car => !filteredCars.some(fc => fc.id === car.id))
      return [...otherCars, ...sortedCars]
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getMainImage = (car: Car) => {
    let mainImage = "/car-animated.gif"

    if (Array.isArray(car.images) && car.images.length > 0) {
      const img = car.images[0] as unknown
      if (typeof img === "string") {
        mainImage = img
      } else if (img && typeof img === "object" && "url" in img && typeof (img as { url?: string }).url === "string") {
        mainImage = (img as { url?: string }).url as string
      } else if (img && typeof img === "object" && "image_url" in img && typeof (img as { image_url?: string }).image_url === "string") {
        mainImage = (img as { image_url?: string }).image_url as string
      }
    } else if (typeof car.images === "string" && (car.images as string).length > 0) {
      mainImage = car.images as string
    }

    if (typeof mainImage === "string" && mainImage.startsWith("uploads/")) {
      mainImage = "/" + mainImage
    }

    if (!mainImage || typeof mainImage !== "string" || mainImage.trim() === "") {
      mainImage = "/car-animated.gif"
    }

    return mainImage
  }

  const getStatusBadge = (status: string, availableFrom?: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Bugünün başlangıcına ayarla
    
    switch (status) {
      case "available":
        // Available araçlar için her zaman müsait göster
        return { 
          label: "Şimdi müsait", 
          available: true,
          availableDate: null,
          showAvailabilityDate: false
        }
        
      case "reserved":
        // Sadece şu anda aktif rezervasyon varsa "X gün sonra müsait" göster
        if (availableFrom) {
          const availableDate = new Date(availableFrom)
          if (!isNaN(availableDate.getTime())) {
            availableDate.setHours(0, 0, 0, 0)
            
            if (availableDate > today) {
              const diffTime = availableDate.getTime() - today.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              
              return { 
                label: `${diffDays} gün sonra müsait`, 
                available: false,
                availableDate,
                showAvailabilityDate: true
              }
            }
          }
        }
        return { label: "Şu anda rezerve", available: false, availableDate: null, showAvailabilityDate: false }
        
      case "busy":
        return { label: "Meşgul", available: false, availableDate: null, showAvailabilityDate: false }
      case "maintenance":
        return { label: "Bakımda", available: false, availableDate: null, showAvailabilityDate: false }
      default:
        return { label: "Müsait Değil", available: false, availableDate: null, showAvailabilityDate: false }
    }
  }

  const formatISODate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const handleReserve = (car: Car, statusInfo: ReturnType<typeof getStatusBadge>) => {
    console.log('🔥 Car button clicked:', { car: car.id, status: car.status })

    if (car.status === 'busy') {
      toast.info('Bu araç şu anda meşgul')
      return
    }
    if (car.status === 'maintenance') {
      toast.info('Bu araç bakımda')
      return
    }
    if (car.status === 'reserved') {
      const availableDate = car.available_from ? new Date(car.available_from).toLocaleDateString('tr-TR') : 'belirtilmemiş'
      toast.info(`Bu araç şu anda rezerve edilmiş. ${availableDate} tarihinde müsait olacak.`)
      return
    }

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const dayAfterTomorrow = new Date(now)
    dayAfterTomorrow.setDate(now.getDate() + 2)

    const startDate = filters?.startDate || formatISODate(tomorrow)
    const endDate = filters?.endDate || formatISODate(dayAfterTomorrow)

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))

    const subtotal = car.daily_price * diffDays
    const tax = subtotal * 0.2
    const total = subtotal + tax

    const params = new URLSearchParams({
      carId: String(car.id),
      startDate,
      endDate,
      rentalDays: String(diffDays),
      subtotal: String(subtotal),
      tax: String(tax),
      total: String(total),
    })

    if (filters?.location) {
      params.set("pickupLocation", filters.location)
    }
    if (filters?.locationIds && filters.locationIds.length > 0) {
      params.set("pickupLocationId", String(filters.locationIds[0]))
    }

    if (!statusInfo.available) {
      toast.info('Araç şu an müsait değil')
      return
    }

    router.push(`/booking?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-white">Araçlar yükleniyor...</p>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-8 ">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Premium Araçlar</h2>
          <p className="text-gray-400">
            {filteredCars.length} araç bulundu
            {filters && (filters.location || filters.startDate || filters.endDate || filters.category) && 
              ` (${cars.length} toplam araçtan filtrelendi)`
            }
          </p>
        </div>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48 bg-gray-900 border-blue-950 text-white">
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent className="bg-gray-500 border-blue-950">
            <SelectItem value="price-low">Fiyat: Düşük → Yüksek</SelectItem>
            <SelectItem value="price-high">Fiyat: Yüksek → Düşük</SelectItem>
            <SelectItem value="rating">En Yüksek Puan</SelectItem>
            <SelectItem value="popular">En Popüler</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCars.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white text-xl">
            {filters && (filters.location || filters.startDate || filters.endDate || filters.category) 
              ? "Arama kriterlerinize uygun araç bulunamadı." 
              : "Henüz araç bulunmuyor."
            }
          </p>
          <p className="text-gray-400 mt-2">
            {filters && (filters.location || filters.startDate || filters.endDate || filters.category)
              ? "Lütfen farklı filtreler deneyin."
              : "Lütfen daha sonra tekrar kontrol edin."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCars.map((car) => {
            const statusInfo = getStatusBadge(car.status, car.available_from)
            const mainImage = getMainImage(car)
            const isExpanded = expandedCarId === car.id

            return (
              <Collapsible
                key={car.id}
                open={isExpanded}
                onOpenChange={(open) => setExpandedCarId(open ? car.id : null)}
              >
                <Card className="group overflow-hidden border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 py-0 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_20px_60px_-25px_rgba(249,115,22,0.25)]">
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-6">
                    <div className="group/image relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg shadow-black/20 md:aspect-auto md:h-36 md:w-[210px]">
                      {/* Gradient Overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 transition-opacity duration-300 group-hover/image:opacity-40" />
                      
                      {/* Shine Effect */}
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] opacity-0 transition-opacity duration-500 group-hover/image:opacity-100" />
                      
                      <img
                        src={mainImage}
                        alt={car.name}
                        className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover/image:scale-105"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/car-animated.gif"
                        }}
                      />
                      
                      {/* Status Badge */}
                      {statusInfo.available ? (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                          Musait
                        </div>
                      ) : (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
                          {statusInfo.label}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold text-white md:text-2xl">{car.name}</h3>
                        <Badge variant="outline" className="border-orange-400/50 bg-orange-500/10 text-orange-300">
                          {car.category}
                        </Badge>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-3 text-sm">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-gray-300">
                          <Users className="h-4 w-4 text-orange-400" /> {car.seating_capacity || "4"} Kisi
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-gray-300">
                          <Gauge className="h-4 w-4 text-orange-400" /> {car.transmission}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-gray-300">
                          <Zap className="h-4 w-4 text-orange-400" /> {car.fuel_type}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-gray-300">
                          <Shield className="h-4 w-4 text-emerald-400" /> Temel koruma
                        </span>
                      </div>

                      <CollapsibleTrigger asChild>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-orange-400 hover:text-orange-300"
                        >
                          Detaylari Gor
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <div className="flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:items-end md:min-w-[180px]">
                      <div className="text-left md:text-right">
                        <div className="text-xs uppercase tracking-wider text-gray-400">Gunluk fiyat</div>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-orange-400">{formatPrice(car.daily_price)}</span>
                          <span className="text-lg text-gray-400">TL</span>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-600 hover:shadow-orange-500/30 md:w-auto md:min-w-[140px]"
                        disabled={!statusInfo.available}
                        onClick={() => handleReserve(car, statusInfo)}
                      >
                        Rezerve Et
                      </Button>
                    </div>
                    </div>

                    <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-out data-[state=closed]:max-h-0 data-[state=closed]:opacity-0 data-[state=open]:max-h-[820px] data-[state=open]:opacity-100">
                      <Separator className="bg-white/10" />
                      <div className="grid grid-cols-1 gap-5 bg-gradient-to-b from-slate-950/80 to-black/40 p-4 md:grid-cols-3 md:gap-6 md:p-6">
                        <div
                          className={`rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2 transition-all duration-500 ${
                            isExpanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                          }`}
                          style={{ transitionDelay: isExpanded ? "40ms" : "0ms" }}
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-orange-300" />
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200">Araç Hakkında</h4>
                          </div>
                          <p className="text-sm leading-7 text-gray-300">
                            {car.description || `${car.brand} ${car.model} konfor, güvenlik ve performansı bir arada sunar.`}
                          </p>

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div
                              className={`rounded-xl border border-white/10 bg-black/35 p-3 text-center transition-all duration-500 ${
                                isExpanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                              }`}
                              style={{ transitionDelay: isExpanded ? "110ms" : "0ms" }}
                            >
                              <div className="text-xs uppercase tracking-wide text-gray-400">Model</div>
                              <div className="mt-1 text-sm font-semibold text-white">{car.year}</div>
                            </div>
                            <div
                              className={`rounded-xl border border-white/10 bg-black/35 p-3 text-center transition-all duration-500 ${
                                isExpanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                              }`}
                              style={{ transitionDelay: isExpanded ? "160ms" : "0ms" }}
                            >
                              <div className="text-xs uppercase tracking-wide text-gray-400">Yakıt</div>
                              <div className="mt-1 text-sm font-semibold text-white">{car.fuel_type}</div>
                            </div>
                            <div
                              className={`rounded-xl border border-white/10 bg-black/35 p-3 text-center transition-all duration-500 ${
                                isExpanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                              }`}
                              style={{ transitionDelay: isExpanded ? "210ms" : "0ms" }}
                            >
                              <div className="text-xs uppercase tracking-wide text-gray-400">Şanzıman</div>
                              <div className="mt-1 text-sm font-semibold text-white">{car.transmission}</div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-500 ${
                            isExpanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                          }`}
                          style={{ transitionDelay: isExpanded ? "90ms" : "0ms" }}
                        >
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-200">Kiralama Bilgisi</h4>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className={`flex items-center justify-between transition-all duration-500 ${isExpanded ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0"}`} style={{ transitionDelay: isExpanded ? "130ms" : "0ms" }}><span>Min. yaş</span><span className="text-white">{car.min_driver_age}</span></li>
                            <li className={`flex items-center justify-between transition-all duration-500 ${isExpanded ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0"}`} style={{ transitionDelay: isExpanded ? "160ms" : "0ms" }}><span>Ehliyet yılı</span><span className="text-white">{car.min_license_years}</span></li>
                            <li className={`flex items-center justify-between transition-all duration-500 ${isExpanded ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0"}`} style={{ transitionDelay: isExpanded ? "190ms" : "0ms" }}><span>Kredi kartı</span><span className="text-white">{car.requires_credit_card ? "Gerekli" : "Opsiyonel"}</span></li>
                            <li className={`flex items-center justify-between transition-all duration-500 ${isExpanded ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0"}`} style={{ transitionDelay: isExpanded ? "220ms" : "0ms" }}><span>Depozito</span><span className="text-white">{car.requires_deposit ? "Gerekli" : "Yok"}</span></li>
                            <li className={`flex items-center justify-between transition-all duration-500 ${isExpanded ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0"}`} style={{ transitionDelay: isExpanded ? "250ms" : "0ms" }}><span>Müsaitlik</span><span className="inline-flex items-center gap-1 text-white"><CalendarDays className="h-4 w-4" /> {statusInfo.label}</span></li>
                          </ul>

                          <div
                            className={`mt-4 rounded-xl border border-green-400/25 bg-green-500/10 p-3 text-xs text-green-200 transition-all duration-500 ${
                              isExpanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                            }`}
                            style={{ transitionDelay: isExpanded ? "280ms" : "0ms" }}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Ücretsiz iptal ve temel koruma dahil
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            )
          })}
        </div>
      )}

      {filteredCars.length > 6 && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black px-8 bg-transparent"
            onClick={fetchCars}
          >
            Yenile
          </Button>
        </div>
      )}
    </div>
  )
}
