"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Location } from "@/types/location"

export function QuickSearch() {
  const router = useRouter()
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    locationIds: [] as number[],
    pickupDate: "",
    returnDate: "",
    carType: ""
  })
  const [locations, setLocations] = useState<Location[]>([])
  const [locSearch, setLocSearch] = useState("")

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch('/api/locations')
        const json = await res.json()
        if (json.success) setLocations(json.data)
      } catch (e) {
        console.error('Lokasyonlar yüklenemedi', e)
      }
    }
    loadLocations()
  }, [])

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
    if (searchFilters.locationIds && searchFilters.locationIds.length > 0) {
      queryParams.set('locations', searchFilters.locationIds.join(','))
    }
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
                <Label className="text-gray-300">Alış Lokasyonu</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-gray-900 border-gray-600 text-white">
                      <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                      {searchFilters.locationIds.length > 0
                        ? `${searchFilters.locationIds.length} lokasyon seçildi`
                        : 'Lokasyon seçin'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 bg-gray-900 border-gray-700">
                    <div className="p-2">
                      <Input
                        placeholder="Ara: şehir, şube..."
                        value={locSearch}
                        onChange={(e) => setLocSearch(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {locations
                        .filter((l) => {
                          const q = locSearch.toLowerCase().trim()
                          if (!q) return true
                          return (
                            l.name.toLowerCase().includes(q) ||
                            l.city.toLowerCase().includes(q) ||
                            (l.address || '').toLowerCase().includes(q)
                          )
                        })
                        .map((loc) => {
                          const checked = searchFilters.locationIds.includes(loc.id)
                          return (
                            <DropdownMenuCheckboxItem
                              key={loc.id}
                              checked={checked}
                              onCheckedChange={(v) => {
                                setSearchFilters((prev) => {
                                  const set = new Set(prev.locationIds)
                                  if (v) set.add(loc.id); else set.delete(loc.id)
                                  return { ...prev, locationIds: Array.from(set) }
                                })
                              }}
                              className="text-gray-200"
                            >
                              {loc.name} ({loc.city})
                            </DropdownMenuCheckboxItem>
                          )
                        })}
                      {locations.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">Lokasyon bulunamadı</div>
                      )}
                    </div>
                    <div className="p-2 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1  text-white-200  hover:bg-gray-300"
                        onClick={() => setSearchFilters((prev) => ({ ...prev, locationIds: [] }))}
                      >
                        Temizle
                      </Button>
                      <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500  text-white" onClick={handleSearch}>
                        Uygula
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                    <SelectValue placeholder="Tümü"  />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-600">
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
