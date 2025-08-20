"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ImagePlus, Loader2, X, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { Car } from "@/types/car"
import type { Location } from "@/types/location"

interface CarFormProps {
  car?: Car | null
  onSave: (carData: Partial<Car>) => Promise<void> | void
  onCancel: () => void
  loading?: boolean
}

const categories = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Pickup",
  "Van",
  "Süper Spor",
  "Lüks Sedan",
  "Gran Turismo",
]
const fuelTypes = ["Benzin", "Dizel", "Elektrik", "Hibrit", "LPG"]
const transmissions = ["Manuel", "Otomatik", "Yarı Otomatik"]
const statuses = [
  { value: "available", label: "Müsait" },
  { value: "busy", label: "Meşgul" },
  { value: "maintenance", label: "Bakımda" },
  { value: "reserved", label: "Rezerve" },
  { value: "sold", label: "Satıldı" },
]

export default function CarForm({ car, onSave, onCancel, loading = false }: CarFormProps) {
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [formLoading, setFormLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Partial<Car>>({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    category: "",
    price: 0,
    daily_price: 0,
    fuel_type: "",
    transmission: "",
    color: "",
    images: [],
    description: "",
    status: "available",
    available_from: "",
    min_driver_age: 21,
    min_license_years: 2,
    requires_credit_card: true,
    requires_deposit: true,
    location_id: undefined,
  })

  // Locations
  const [locations, setLocations] = useState<Location[]>([])
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch('/api/admin/locations?onlyActive=true')
        const json = await res.json()
        if (json.success) setLocations(json.data)
      } catch (e) {
        console.error('Lokasyonlar yüklenemedi', e)
      }
    }
    loadLocations()
  }, [])

  // Car prop'u değiştiğinde formData'yı güncelle
  useEffect(() => {
    if (car) {
      setFormData({
        name: car.name || "",
        brand: car.brand || "",
        model: car.model || "",
        year: car.year || new Date().getFullYear(),
        category: car.category || "",
        price: car.price || 0,
        daily_price: car.daily_price || 0,
        fuel_type: car.fuel_type || "",
        transmission: car.transmission || "",
        color: car.color || "",
        images: car.images || [],
        description: car.description || "",
        status: car.status || "available",
        available_from: car.available_from || "",
        min_driver_age: car.min_driver_age || 21,
        min_license_years: car.min_license_years || 2,
        requires_credit_card: car.requires_credit_card ?? true,
        requires_deposit: car.requires_deposit ?? true,
  location_id: car.location_id ?? undefined,
      })
    }
  }, [car])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    try {
      const uploadedImagePaths: string[] = []

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        const response = await fetch("/api/admin/uploads", {
          method: "POST",
          body: formDataUpload,
        })

        const result = await response.json()

        if (result.success) {
          uploadedImagePaths.push(result.filePath)
        }
      }

      if (uploadedImagePaths.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedImagePaths],
        }))

        toast.success(`${uploadedImagePaths.length} resim başarıyla yüklendi`)
      }
    } catch (error) {
      console.error("Failed to upload images:", error)
      toast.error("Resim yükleme başarısız")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      await onSave(formData)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onCancel}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{car ? "Araç Düzenle" : "Yeni Araç Ekle"}</h1>
              <p className="text-slate-400">Araç bilgilerini girin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="general" className="data-[state=active]:bg-slate-700">
              Genel Bilgiler
            </TabsTrigger>
            <TabsTrigger value="rental" className="data-[state=active]:bg-slate-700">
              Kiralama Koşulları
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-slate-700">
              Resimler
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="general">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Genel Bilgiler</CardTitle>
                  <CardDescription className="text-slate-400">Araç detaylarını girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        Araç Adı *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="brand" className="text-white">
                        Marka *
                      </Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="model" className="text-white">
                        Model *
                      </Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="year" className="text-white">
                        Yıl *
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-white">
                        Kategori *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                        <Label htmlFor="location" className="text-white">
                          Lokasyon
                        </Label>
                        <Select
                          value={formData.location_id ? String(formData.location_id) : ''}
                          onValueChange={(value) => setFormData({ ...formData, location_id: Number(value) })}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Lokasyon seçin (opsiyonel)" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {locations.map((loc) => (
                              <SelectItem key={loc.id} value={String(loc.id)}>
                                {loc.name} ({loc.city})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                      <Label htmlFor="price" className="text-white">
                        Satış Fiyatı (₺) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="daily_price" className="text-white">
                        Günlük Kiralama Fiyatı (₺) *
                      </Label>
                      <Input
                        id="daily_price"
                        type="number"
                        min="0"
                        value={formData.daily_price}
                        onChange={(e) => setFormData({ ...formData, daily_price: Number.parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="fuel_type" className="text-white">
                        Yakıt Türü *
                      </Label>
                      <Select
                        value={formData.fuel_type}
                        onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Yakıt türü seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {fuelTypes.map((fuel) => (
                            <SelectItem key={fuel} value={fuel}>
                              {fuel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="transmission" className="text-white">
                        Vites *
                      </Label>
                      <Select
                        value={formData.transmission}
                        onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Vites türü seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {transmissions.map((trans) => (
                            <SelectItem key={trans} value={trans}>
                              {trans}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="color" className="text-white">
                        Renk *
                      </Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-white">
                        Durum *
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => {
                          const newFormData = { ...formData, status: value as "available" | "busy" | "maintenance" | "reserved" | "sold" }
                          // Status "available" değilse available_from'u temizle
                          if (value !== "available") {
                            newFormData.available_from = ""
                          }
                          setFormData(newFormData)
                        }}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-400 mt-1">
                        &quot;Müsait&quot; seçerseniz araç hemen kiralanabilir. Gelecek tarih ayarlamak isterseniz yukarıdaki alanı kullanın.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">
                      Açıklama
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      rows={3}
                      placeholder="Araç hakkında detaylı bilgi girin..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rental">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Kiralama Koşulları</CardTitle>
                  <CardDescription className="text-slate-400">
                    Kiralama için gerekli koşulları belirleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Müsaitlik Tarihi - sadece status "available" ise göster */}
                    {formData.status === "available" && (
                      <div>
                        <Label htmlFor="available_from" className="text-white">
                          Gelecek Müsaitlik Tarihi (İsteğe Bağlı)
                        </Label>
                        <Input
                          id="available_from"
                          type="date"
                          value={formData.available_from}
                          onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Boş bırakırsanız araç hemen müsait olur. Doldurursanız belirlenen tarihten sonra müsait olur.
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="min_driver_age" className="text-white">
                        Minimum Sürücü Yaşı
                      </Label>
                      <Input
                        id="min_driver_age"
                        type="number"
                        min="18"
                        max="30"
                        value={formData.min_driver_age}
                        onChange={(e) => setFormData({ ...formData, min_driver_age: Number.parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">18-30 yaş arası</p>
                    </div>

                    <div>
                      <Label htmlFor="min_license_years" className="text-white">
                        Minimum Ehliyet Yılı
                      </Label>
                      <Input
                        id="min_license_years"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.min_license_years}
                        onChange={(e) =>
                          setFormData({ ...formData, min_license_years: Number.parseInt(e.target.value) })
                        }
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">1-10 yıl arası</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Gereksinimler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg">
                        <Checkbox
                          id="requires_credit_card"
                          checked={formData.requires_credit_card}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, requires_credit_card: checked as boolean })
                          }
                          className="border-slate-600 data-[state=checked]:bg-orange-500"
                        />
                        <div>
                          <Label htmlFor="requires_credit_card" className="text-white font-medium">
                            Kredi Kartı Zorunlu
                          </Label>
                          <p className="text-xs text-slate-400">Kiralama için kredi kartı gerekli</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg">
                        <Checkbox
                          id="requires_deposit"
                          checked={formData.requires_deposit}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, requires_deposit: checked as boolean })
                          }
                          className="border-slate-600 data-[state=checked]:bg-orange-500"
                        />
                        <div>
                          <Label htmlFor="requires_deposit" className="text-white font-medium">
                            Depozito Gerekli
                          </Label>
                          <p className="text-xs text-slate-400">Kiralama için depozito alınacak</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.daily_price && formData.daily_price > 0 && (
                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Fiyat Özeti</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span>Günlük Kiralama:</span>
                          <span>₺{formData.daily_price}</span>
                        </div>
                        {formData.requires_deposit && (
                          <div className="flex justify-between text-slate-300">
                            <span>Tahmini Depozito:</span>
                            <span>₺{Math.round(formData.daily_price * 0.3)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Araç Resimleri</CardTitle>
                  <CardDescription className="text-slate-400">
                    Araç resimlerini yükleyin (JPG, PNG formatında)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-600 rounded-lg p-12 hover:border-orange-500/50 transition-colors">
                    <div className="flex flex-col items-center space-y-2">
                      {uploading ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                          <div className="text-sm text-slate-400">Resimler yükleniyor...</div>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-8 w-8 text-slate-400" />
                          <div className="text-sm text-slate-400 text-center">
                            Resimlerinizi buraya sürükleyip bırakın veya dosya seçmek için tıklayın
                          </div>
                          <div className="text-xs text-slate-500">Maksimum 10 resim, her biri 5MB&#39;dan küçük</div>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            id="image-upload"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent hover:border-orange-500"
                          >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            Dosya Seç
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {formData.images && formData.images.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-medium">Yüklenen Resimler ({formData.images.length})</h4>
                        <div className="text-xs text-slate-400">İlk resim ana resim olarak kullanılacak</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-md overflow-hidden border border-slate-600 group hover:border-orange-500 transition-colors"
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Araç resmi ${index + 1}`}
                              className="object-cover w-full h-full"
                              width={200}
                              height={200}
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                                Ana Resim
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex gap-3 pt-6">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1" disabled={loading || formLoading}>
                {loading || formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {car ? "Güncelle" : "Kaydet"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                İptal
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
