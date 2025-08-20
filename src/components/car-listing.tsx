"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Share2, Star, Zap, Gauge, Users, Eye, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>("")

  // Cars state değişikliklerini izle
  useEffect(() => {
    console.log("🔥 Cars state değişti:", { length: cars.length, cars })
  }, [cars])

  useEffect(() => {
    fetchCars()
  }, [filters]) // Filtreler değiştiğinde yeniden yükle

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
        const carsData = result.data.map((car: any) => {
          console.log("🔥 İşlenen araç verisi:", {
            id: car.id,
            name: car.name,
            status: car.status,
            available_from: car.available_from,
            available_from_type: typeof car.available_from
          })
          
          return {
            ...car,
            // Images array'ini düzelt
            images: car.images && Array.isArray(car.images) 
              ? car.images.map((img: any) => {
                  if (typeof img === 'string') return img
                  if (img && img.url) return img.url
                  if (img && img.image_url) return img.image_url
                  return img
                }).filter(Boolean)
              : [],
          }
        })
        
        console.log("🔥 İşlenmiş araç listesi:", carsData)
        console.log("🔥 SetCars çağrılıyor, uzunluk:", carsData.length)
        setCars(carsData)
      } else {
        console.log("🔥 API başarısız veya data yok:", { success: result.success, hasData: !!result.data })
        throw new Error("Geçersiz API yanıtı")
      }
    } catch (error: any) {
      console.error("🔥 Araç listesi yüklenirken hata:", error)
      console.error("🔥 Hata detayı:", error.message)
      console.error("🔥 Hata stack:", error.stack)
      toast.error(`Araç listesi yüklenemedi: ${error.message}`)
    } finally {
      console.log("🔥 Loading false yapılıyor")
      setLoading(false)
    }
  }

  // Filtrelenmiş araçları hesapla
  const filteredCars = cars.filter(car => {
    // Lokasyon filtresi
    if (filters?.locationIds && filters.locationIds.length > 0) {
      if (!car.location_id || !filters.locationIds.includes(Number(car.location_id))) {
        return false
      }
    }
    // Kategori filtresi
    if (filters?.category && filters.category !== 'all') {
      if (car.category?.toLowerCase() !== filters.category.toLowerCase()) {
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
          return false
        }
      }
      
      // Bakımda veya meşgul araçları gösterme
      if (car.status === 'maintenance' || car.status === 'busy') {
        return false
      }
    }

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          {filteredCars.map((car) => {
            const statusInfo = getStatusBadge(car.status, car.available_from)
            const mainImage = car.images && car.images.length > 0 ? car.images[0] : "/car-animated.gif"
            
            return (
              <Card
                key={car.id}
                className="bg-gray-900/50 border-gray-800 overflow-hidden hover:bg-gray-800/70 transition-all duration-300 group"
              >
                <div className="relative">
                  <Image
                    src={mainImage}
                    alt={car.name}
                    width={500}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {car.status === "available" && car.daily_price > 2000 && (
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                      Premium
                    </Badge>
                  )}

                  {(!statusInfo.available || car.status === 'maintenance' || car.status === 'busy' || car.status === 'reserved') && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center">
                        <Badge variant="destructive" className="text-lg px-4 py-2 mb-2">
                          {statusInfo.label}
                        </Badge>
                        {statusInfo.showAvailabilityDate && statusInfo.availableDate && (
                          <p className="text-white text-sm">
                            Müsait olacağı tarih: {statusInfo.availableDate.toLocaleDateString('tr-TR')}
                          </p>
                        )}
                        {car.status === 'maintenance' && (
                          <p className="text-white text-sm">
                            Bu araç bakımdadır
                          </p>
                        )}
                        {car.status === 'busy' && (
                          <p className="text-white text-sm">
                            Bu araç şu anda meşguldür
                          </p>
                        )}
                        {car.status === 'reserved' && (
                          <p className="text-white text-sm">
                            Bu araç rezerve edilmiştir
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                        <span className="text-white font-medium">{car.rating || 4.5}</span>
                        <span className="text-gray-300 text-sm">({car.review_count || 0})</span>
                      </div>
                      <Badge variant="outline" className="border-orange-500 text-orange-500 bg-black/50">
                        {car.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-white mb-4">{car.name}</h3>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="text-white text-sm font-medium">{car.year}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <Gauge className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="text-white text-sm font-medium">{car.fuel_type}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <Users className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="text-white text-sm font-medium">{car.transmission}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-3xl font-bold text-orange-500">₺{formatPrice(car.daily_price)}</span>
                      <span className="text-gray-400 ml-1">/gün</span>
                    </div>
                    <div className="text-right">
                      {/* Sadece gelecekte müsait olacak araçlar için tarih göster */}
                      {statusInfo.showAvailabilityDate && statusInfo.availableDate && (
                        <div>
                          <div className="text-sm text-gray-400">Müsait olacağı tarih:</div>
                          <div className="text-orange-500 font-medium">
                            {statusInfo.availableDate.toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link href={{ pathname: `/cars/${car.id}`, query: (filters?.locationIds && filters.locationIds.length > 0) ? { locations: filters.locationIds.join(',') } : undefined }} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detaylar
                      </Button>
                    </Link>
                    <div className="flex-1">
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!statusInfo.available}
                        onClick={() => {
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
                          // Car detail sayfasına yönlendir (tarih seçimi için)
                          console.log('🔥 Redirecting to car detail:', `/cars/${car.id}`)
                          window.location.href = `/cars/${car.id}`
                        }}
                      >
                        {car.status === 'busy' 
                          ? "Meşgul" 
                          : car.status === 'maintenance' 
                          ? "Bakımda" 
                          : car.status === 'reserved'
                          ? "Şu anda rezerve"
                          : "Rezerve Et"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
