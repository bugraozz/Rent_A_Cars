"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Search } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function QuickSearch() {
  const router = useRouter()
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    pickupDate: "",
    returnDate: "",
    carType: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSearch = () => {
    // URL query parametrelerini oluştur
    const queryParams = new URLSearchParams()
    
    if (searchFilters.location) queryParams.set('location', searchFilters.location)
    if (searchFilters.pickupDate) queryParams.set('startDate', searchFilters.pickupDate)
    if (searchFilters.returnDate) queryParams.set('endDate', searchFilters.returnDate)
    if (searchFilters.carType) queryParams.set('category', searchFilters.carType)
    
    // Cars sayfasına yönlendir
    const queryString = queryParams.toString()
    router.push(`/cars${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <section className="py-12 bg-black-900">
      <div className="container mx-auto px-6">
        <Card className="max-w-6xl mx-auto bg-gray-800/50 border-gray-700 shadow-2xl">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="pickup-location" className="text-gray-300">
                  Alış Yeri
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="pickup-location"
                    placeholder="Şehir seçin"
                    value={searchFilters.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-600 text-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup-date" className="text-gray-300">
                  Alış Tarihi
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="pickup-date"
                    type="date"
                    value={searchFilters.pickupDate}
                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-600 text-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="return-date" className="text-gray-300">
                  Dönüş Tarihi
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="return-date"
                    type="date"
                    value={searchFilters.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-600 text-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="car-type" className="text-gray-300">
                  Araç Tipi
                </Label>
                <Select onValueChange={(value) => handleInputChange('carType', value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white focus:border-orange-500">
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="supercar">Süper Spor</SelectItem>
                    <SelectItem value="luxury">Lüks</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="classic">Klasik</SelectItem>
                    <SelectItem value="economy">Ekonomik</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                Ara
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
