import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { Location } from "@/types/location"

export function CarFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/locations')
        const json = await res.json()
        if (json.success) setLocations(json.data)
      } catch (e) {
        console.error('Lokasyonlar yüklenemedi', e)
      }
    }
    load()
  }, [])

  // Initialize from URL
  useEffect(() => {
    const locs = ((searchParams && searchParams.get('locations')) || '')
      .split(',')
      .map((s) => parseInt(s))
      .filter((n) => !isNaN(n))
    setSelected(locs)
  }, [searchParams])

  const applyFilters = () => {
    const qp = new URLSearchParams(searchParams ? searchParams.toString() : '')
    if (selected.length > 0) qp.set('locations', selected.join(','))
    else qp.delete('locations')
    router.push(`/cars?${qp.toString()}`)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Lokasyonlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-56 overflow-auto pr-2">
            {locations.map((loc) => {
              const checked = selected.includes(loc.id)
              return (
                <label key={loc.id} className="flex items-center gap-3 text-gray-300 cursor-pointer">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => {
                      setSelected((prev) => {
                        const set = new Set(prev)
                        if (v) set.add(loc.id); else set.delete(loc.id)
                        return Array.from(set)
                      })
                    }}
                    className="border-gray-600 data-[state=checked]:bg-orange-500"
                  />
                  <span>{loc.name} ({loc.city})</span>
                </label>
              )
            })}
          </div>
          <Button onClick={applyFilters} className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
            Uygula
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            Fiyat Aralığı
            <Badge className="ml-2 bg-orange-500 text-black text-xs">₺/Gün</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              defaultValue={[500, 2500]}
              max={5000}
              step={100}
              className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>₺500</span>
              <span>₺2,500</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Araç Kategorisi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Süper Spor", "Lüks Sedan", "SUV Premium", "Gran Turismo", "Klasik"].map((category) => (
              <div key={category} className="flex items-center space-x-3">
                <Checkbox id={category} className="border-gray-600 data-[state=checked]:bg-orange-500" />
                <Label htmlFor={category} className="text-gray-300 hover:text-white cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Marka</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Lamborghini", "Ferrari", "BMW", "Mercedes", "Porsche", "Audi"].map((brand) => (
              <div key={brand} className="flex items-center space-x-3">
                <Checkbox id={brand} className="border-gray-600 data-[state=checked]:bg-orange-500" />
                <Label htmlFor={brand} className="text-gray-300 hover:text-white cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Özellikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Otomatik Vites", "Spor Modu", "Panoramik Tavan", "Premium Ses", "Deri Döşeme"].map((feature) => (
              <div key={feature} className="flex items-center space-x-3">
                <Checkbox id={feature} className="border-gray-600 data-[state=checked]:bg-orange-500" />
                <Label htmlFor={feature} className="text-gray-300 hover:text-white cursor-pointer">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
        Filtreleri Uygula
      </Button>
    </div>
  )
}
