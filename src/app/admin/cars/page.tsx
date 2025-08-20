"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Plus, Edit, Trash2, CarIcon, Calendar, Fuel, Settings, Palette, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Image from "next/image"

interface Car {
  id: number
  name: string
  brand: string
  model: string
  year: number
  category: string
  price: number
  daily_price: number
  fuel_type: string
  transmission: string
  color: string
  images: string[]
  description: string
  status: "available" | "busy" | "maintenance"
  available_from?: string
  created_at?: string
}

const categories = ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Pickup", "Van"]
const statuses = [
  { value: "available", label: "Müsait", color: "bg-green-500" },
  { value: "busy", label: "Meşgul", color: "bg-blue-500" },
  { value: "maintenance", label: "Bakımda", color: "bg-yellow-500" },
]

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/cars", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Araçlar yüklenemedi");
      }
      const result = await response.json();
      if (result.success && result.data) {
        setCars(result.data);
        console.log("Araçlar yüklendi:", result.data);
      } else {
        throw new Error("Veri formatı hatalı");
      }
    } catch (error) {
      console.error("Araç yükleme hatası:", error);
      toast.error("Araçlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCars()
  }, [])

  // Helper function to get actual availability status
  const getActualAvailabilityStatus = (car: Car) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (car.status === "busy") return "busy"
    if (car.status === "maintenance") return "maintenance"
    
    if (car.status === "available") {
      // Check if available_from is in the future
      if (car.available_from) {
        const availableDate = new Date(car.available_from)
        if (!isNaN(availableDate.getTime())) {
          availableDate.setHours(0, 0, 0, 0)
          if (availableDate > today) {
            return "pending" // Available in the future
          }
        }
      }
      return "available" // Available now
    }
    
    return "unavailable"
  }

  // Calculate stats based on actual availability
  const getStats = () => {
    const availableNow = cars.filter(car => getActualAvailabilityStatus(car) === "available").length
    const availableLater = cars.filter(car => getActualAvailabilityStatus(car) === "pending").length
    const busy = cars.filter(car => getActualAvailabilityStatus(car) === "busy").length
    const maintenance = cars.filter(car => getActualAvailabilityStatus(car) === "maintenance").length
    
    return { availableNow, availableLater, busy, maintenance }
  }

  const stats = getStats()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (status: string, availableFrom?: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Eğer status "available" ise ve available_from tarihi varsa kontrol et
    if (status === "available" && availableFrom) {
      const availableDate = new Date(availableFrom)
      if (!isNaN(availableDate.getTime())) {
        availableDate.setHours(0, 0, 0, 0)
        
        // Eğer available_from gelecekte ise, "yakında müsait" göster
        if (availableDate > today) {
          const diffTime = availableDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return { 
            value: "pending", 
            label: `${diffDays} gün sonra müsait`, 
            color: "bg-blue-500" 
          }
        }
      }
    }
    
    // Varsayılan status mapping
    const statusInfo = statuses.find((s) => s.value === status)
    return statusInfo || { value: status, label: status, color: "bg-gray-500" }
  }

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || car.category === categoryFilter
    const matchesStatus = statusFilter === "all" || car.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = async (id: number) => {
    if (confirm("Bu aracı silmek istediğinizden emin misiniz?")) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        setCars(cars.filter((car) => car.id !== id))
        toast.success("İşlem tamamlandı")
      } catch {
        toast.error("Hata oluştu")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <div className="text-white text-lg">Araçlar yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black" >
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Araç Yönetimi</h1>
              <p className="text-slate-400">Araçlarınızı yönetin ve takip edin</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <CarIcon className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Araç adı, marka veya model ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 h-12"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white h-12">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white h-12">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add New Button */}
          <Link href="/admin/cars/new">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white h-9 px-6  hover:from-orange-600 hover:to-red-600">
              <Plus className="w-5 h-5 mr-2" />
              Yeni Araç Ekle
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Toplam Araç</p>
                  <p className="text-2xl font-bold text-white">{cars.length}</p>
                </div>
                <CarIcon className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Şimdi Müsait</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.availableNow}
                  </p>
                  {stats.availableLater > 0 && (
                    <p className="text-xs text-slate-500">+{stats.availableLater} gelecekte</p>
                  )}
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Meşgul</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.busy}
                  </p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Bakımda</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.maintenance}
                  </p>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => {
            const statusInfo = getStatusBadge(car.status, car.available_from)
            // Görsel yolu normalize: uploads ile başlıyorsa başına / ekle
            let mainImage = car.images?.[0] || "/placeholder.svg?height=200&width=400";
            if (typeof mainImage === "string" && mainImage.startsWith("uploads/")) {
              mainImage = "/" + mainImage;
            }
            // Next.js Image için width/height zorunlu
            const imageWidth = 400;
            const imageHeight = 200;
            return (
              <Card
                key={car.id}
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="relative">
                  <Image
                    src={mainImage}
                    alt={car.name}
                    width={imageWidth}
                    height={imageHeight}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={`${statusInfo.color} text-white border-0`}>{statusInfo.label}</Badge>
                  </div>
                  {car.images && car.images.length > 1 && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-black/50 text-white border-0">+{car.images.length - 1} resim</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">{car.name}</h3>
                    <p className="text-slate-400">
                      {car.brand} {car.model} • {car.year}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span>{car.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Fuel className="w-4 h-4" />
                      <span>{car.fuel_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Settings className="w-4 h-4" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Palette className="w-4 h-4" />
                      <span>{car.color}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg font-bold text-blue-400">{formatPrice(car.daily_price)}</span>
                      <span className="text-slate-400 text-sm ml-1">/gün</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-slate-400">Toplam</span>
                      <div className="text-lg font-semibold text-white">{formatPrice(car.price)}</div>
                    </div>
                  </div>

                  <Separator className="bg-white/10 mb-4" />

                  <div className="flex gap-2">
                    <Link href={`/cars/${car.id}`} className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detay
                      </Button>
                    </Link>
                    <Link href={`/admin/cars/${car.id}?mode=edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                      onClick={() => handleDelete(car.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <CarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Araç bulunamadı</h3>
            <p className="text-slate-500">Arama kriterlerinizi değiştirmeyi deneyin</p>
          </div>
        )}
      </div>
    </div>
  )
}