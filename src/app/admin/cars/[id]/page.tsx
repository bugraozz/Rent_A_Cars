"use client"

import { Car } from "@/types/car"
import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Calendar, Fuel, Settings, Palette } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import CarForm from "@/components/car-form"
import { toast } from "sonner"

const statuses = [
  { value: "available", label: "Müsait", color: "bg-green-500" },
  { value: "busy", label: "Meşgul", color: "bg-orange-500" },
  { value: "maintenance", label: "Bakımda", color: "bg-yellow-500" },
]

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams?.get("mode") === "edit"

  useEffect(() => {
    fetchCar()
  }, [resolvedParams.id])

  const fetchCar = async () => {
    setLoading(true)
    try {
      console.log(`API çağrısı yapılıyor: /api/admin/cars/${resolvedParams.id}`)
      
      const response = await fetch(`/api/admin/cars/${resolvedParams.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`API hatası: ${response.status} - ${response.statusText}`)
        throw new Error(`API hatası: ${response.status}`)
      }

      const result = await response.json()
      console.log("API'den gelen sonuç:", result)
      
      if (result.success && result.data) {
        // API'den gelen veriyi uygun formata çevir
        const carData = result.data
        
        // Images array'ini düzelt
        if (carData.images && Array.isArray(carData.images)) {
          carData.images = carData.images.map((img: any) => {
            if (typeof img === 'string') {
              return img
            } else if (img && img.url) {
              return img.url
            } else if (img && img.image_url) {
              return img.image_url
            }
            return img
          }).filter(Boolean)
        } else {
          carData.images = []
        }
        
        console.log("İşlenmiş araç verisi:", carData)
        setCar(carData)
      } else {
        console.error("API'den geçersiz veri:", result)
        throw new Error("Geçersiz API yanıtı")
      }
    } catch (error: any) {
      console.error("Araç bilgileri yüklenirken hata:", error)
      toast.error(`Araç bilgileri yüklenemedi: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (carData: Partial<Car>) => {
    try {
      console.log("Güncellenecek araç verisi:", carData)
      
      const response = await fetch(`/api/admin/cars/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Araç güncellenirken bir hata oluştu: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        toast.success("Araç başarıyla güncellendi!")
        
        // Fetch the updated car data to get the complete record with images
        await fetchCar()
        
        // Edit mode'dan çık
        router.push(`/admin/cars/${resolvedParams.id}`)
      } else {
        throw new Error(result.message || "Güncelleme başarısız")
      }
    } catch (error: any) {
      console.error("Güncelleme hatası:", error)
      toast.error(error.message || "Araç güncellenirken hata oluştu")
    }
  }

  const handleDelete = async () => {
    if (confirm("Bu aracı silmek istediğinizden emin misiniz?")) {
      try {
        const response = await fetch(`/api/admin/cars/${resolvedParams.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Araç silinirken bir hata oluştu")
        }

        const result = await response.json()
        
        if (result.success) {
          toast.success("Araç başarıyla silindi")
          router.push("/admin/cars")
        } else {
          throw new Error(result.message || "Silme işlemi başarısız")
        }
      } catch (error: any) {
        console.error("Silme hatası:", error)
        toast.error(error.message || "Araç silinirken hata oluştu")
      }
    }
  }

  const handleCancel = () => {
    router.push(`/admin/cars/${resolvedParams.id}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = statuses.find((s) => s.value === status)
    return statusInfo || { value: status, label: status, color: "bg-gray-500" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <div className="text-white text-lg">Araç bilgileri yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Araç bulunamadı</h2>
          <Link href="/cars">
            <Button>Araç Listesine Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isEditMode) {
    return <CarForm car={car} onSave={handleSave} onCancel={handleCancel} />
  }

  const statusInfo = getStatusBadge(car.status)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cars">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{car.name}</h1>
                <p className="text-slate-400">
                  {car.brand} {car.model} • {car.year}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${statusInfo.color} text-white border-0 px-3 py-1`}>{statusInfo.label}</Badge>
              <Link href={`/admin/cars/${car.id}?mode=edit`}>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Düzenle
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={car.images[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
                    alt={`${car.name} - Resim ${currentImageIndex + 1}`}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {car.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-2">
                        {car.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? "border-blue-500" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Price */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-1">{formatPrice(car.daily_price)}</div>
                    <div className="text-slate-400">Günlük Kiralama</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">{formatPrice(car.price)}</div>
                    <div className="text-slate-400">Satış Fiyatı</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Teknik Özellikler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-400">Kategori</div>
                      <div className="text-white font-medium">{car.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-400">Yakıt Türü</div>
                      <div className="text-white font-medium">{car.fuel_type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-400">Vites</div>
                      <div className="text-white font-medium">{car.transmission}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-400">Renk</div>
                      <div className="text-white font-medium">{car.color}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {car.description && (
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Açıklama</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{car.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Availability Info */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Müsaitlik Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Müsaitlik Tarihi</span>
                  <span className="text-white">
                    {car.available_from ? new Date(car.available_from).toLocaleDateString("tr-TR") : "Belirtilmemiş"}
                  </span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Durum</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      car.status === 'available' ? 
                        (car.available_from && new Date(car.available_from) > new Date() ? 'bg-yellow-500' : 'bg-green-500') :
                        car.status === 'busy' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}></div>
                    <Badge className={`${statusInfo.color} text-white border-0`}>{statusInfo.label}</Badge>
                  </div>
                </div>
                {car.available_from && new Date(car.available_from) > new Date() && (
                  <>
                    <Separator className="bg-white/10" />
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <div className="text-yellow-400 text-sm font-medium">
                        Bu araç {new Date(car.available_from).toLocaleDateString("tr-TR")} tarihinde müsait olacak
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Ek Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Araç ID</span>
                  <span className="text-white">#{car.id}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Eklenme Tarihi</span>
                  <span className="text-white">
                    {car.created_at ? new Date(car.created_at).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                  </span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Durum</span>
                  <Badge className={`${statusInfo.color} text-white border-0`}>{statusInfo.label}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
