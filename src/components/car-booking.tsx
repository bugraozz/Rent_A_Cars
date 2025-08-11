import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, CreditCard } from "lucide-react"
import { Car } from "@/types/car"

interface CarBookingProps {
  car?: Car
}

export function CarBooking({ car }: CarBookingProps) {
  const getStatusInfo = () => {
    if (!car) {
      return { label: "Müsait", color: "bg-green-500", canBook: true }
    }
    
    switch (car.status) {
      case "available":
        // Available araçlar her zaman rezerve edilebilir
        return { label: "Müsait", color: "bg-green-500", canBook: true }
      case "reserved":
        // Reserved araçlar rezerve edilemez
        return { label: "Şu anda rezerve", color: "bg-purple-500", canBook: false }
      case "busy":
        return { label: "Meşgul", color: "bg-orange-500", canBook: false }
      case "maintenance":
        return { label: "Bakımda", color: "bg-yellow-500", canBook: false }
      default:
        return { label: "Müsait Değil", color: "bg-red-500", canBook: false }
    }
  }
  
  const statusInfo = getStatusInfo()
  
  return (
    <Card className="bg-gray-900/50 border-gray-800 sticky top-24">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center justify-between">
          Rezervasyon
          <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
          <div className="text-4xl font-black text-orange-500 mb-2">₺2,500</div>
          <div className="text-gray-400">/gün</div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-300 mb-2 block">Alış Tarihi & Saati</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                type="datetime-local"
                className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Dönüş Tarihi & Saati</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                type="datetime-local"
                className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Alış Lokasyonu</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                placeholder="İstanbul Merkez Ofis"
                className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-gray-300">
            <span>Günlük Ücret</span>
            <span>₺{car?.daily_price ? car.daily_price.toLocaleString('tr-TR') : '2,500'}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>3 Gün</span>
            <span>₺{car?.daily_price ? (car.daily_price * 3).toLocaleString('tr-TR') : '7,500'}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Sigorta</span>
            <span>Dahil</span>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Toplam</span>
              <span>₺{car?.daily_price ? (car.daily_price * 3).toLocaleString('tr-TR') : '7,500'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {statusInfo.canBook ? (
            <>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold">
                <CreditCard className="mr-2 h-5 w-5" />
                Hemen Rezerve Et
              </Button>
              <Button
                variant="outline"
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent"
              >
                <Clock className="mr-2 h-5 w-5" />
                Fiyat Teklifi Al
              </Button>
            </>
          ) : (
            <>
              <Button 
                disabled 
                className="w-full bg-gray-600 text-gray-400 h-12 text-lg font-semibold cursor-not-allowed"
              >
                Rezervasyon Yapılamaz
              </Button>
              {car?.status === 'reserved' && car.available_from && (
                <div className="text-center text-sm text-orange-400 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                  <p>Bu araç şu anda rezerve edilmiş</p>
                  {(() => {
                    const today = new Date()
                    const availableDate = new Date(car.available_from)
                    if (availableDate > today) {
                      const diffTime = availableDate.getTime() - today.getTime()
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      return <p>{diffDays} gün sonra ({availableDate.toLocaleDateString('tr-TR')}) müsait olacak</p>
                    }
                    return null
                  })()}
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>• Ücretsiz iptal (24 saat öncesine kadar)</p>
          <p>• Anında onay</p>
          <p>• 7/24 müşteri desteği</p>
        </div>
      </CardContent>
    </Card>
  )
}
