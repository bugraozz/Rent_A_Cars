import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function CarFilters() {
  return (
    <div className="space-y-6">
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
