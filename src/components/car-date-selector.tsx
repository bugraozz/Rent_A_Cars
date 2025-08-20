"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, AlertCircle, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Car } from "@/types/car"
import type { Location } from "@/types/location"

interface CarDateSelectorProps {
  car: Car
}

interface UnavailableDate {
  start: string
  end: string
  status: string
}

interface AvailabilityData {
  success: boolean
  car: Car
  unavailableDates: UnavailableDate[]
}

export function CarDateSelector({ car }: CarDateSelectorProps) {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([])
  const [loading, setLoading] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [isDateRangeValid, setIsDateRangeValid] = useState(false)
  
  const [rentalDays, setRentalDays] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)
  
  // Helper function to get minimum selectable date
  const getMinSelectableDate = () => {
    // Sadece bugünün tarihini döndür
    // available_from tarihini kontrol etme çünkü artık gelecekteki rezervasyonlar 
    // diğer müşterileri engellemeyecek
    return new Date().toISOString().split('T')[0]
  }

  // Fetch unavailable dates from API - DEVRE DIŞI
  // Artık sadece API ile real-time kontrol yapıyoruz
  const fetchUnavailableDates = async () => {
    // Bu fonksiyon artık kullanılmıyor çünkü
    // gelecekteki rezervasyonlar tarih seçimini engellemeyecek
    console.log('🔥 fetchUnavailableDates devre dışı - sadece API kontrolü yapılıyor')
  }

  // Check if a specific date is unavailable - DEVRE DIŞI
  const isDateUnavailable = (dateString: string) => {
    // Bu kontrol artık yapılmıyor çünkü sadece API ile kontrol ediyoruz
    return false
  }

  // Get next available date
  const getNextAvailableDate = (fromDate: string) => {
    let checkDate = new Date(fromDate)
    const maxDays = 365 // 1 yıl ileriye kadar kontrol et
    
    for (let i = 0; i < maxDays; i++) {
      const dateString = checkDate.toISOString().split('T')[0]
      if (!isDateUnavailable(dateString)) {
        return dateString
      }
      checkDate.setDate(checkDate.getDate() + 1)
    }
    
    return fromDate // Hiç müsait tarih bulunamazsa orijinali döndür
  }

  // Load unavailable dates on component mount
  useEffect(() => {
    fetchUnavailableDates()
  }, [car?.id])

  // Load active locations and set default from car
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/locations')
        const json = await res.json()
        if (json.success) {
          setLocations(json.data)
          // Default selection: car.location_id if present
          if (car?.location_id) {
            setSelectedLocationId(Number(car.location_id))
            const found = json.data.find((l: Location) => l.id === Number(car.location_id))
            if (found) setPickupLocation(`${found.name} (${found.city})`)
          }
        }
      } catch (e) {
        console.error('Lokasyonlar yüklenemedi', e)
      }
    }
    load()
  }, [car?.location_id])

  // Validate date range and calculate pricing
  useEffect(() => {
    if (startDate && endDate) {
      checkDateAvailability()
      calculatePricing()
    } else {
      setIsDateRangeValid(false)
      setAvailabilityMessage('')
      setRentalDays(0)
      setSubtotal(0)
      setTax(0)
      setTotal(0)
    }
  }, [startDate, endDate, unavailableDates])

  const checkDateAvailability = async () => {
    if (!startDate || !endDate || !car?.id) {
      setIsDateRangeValid(false)
      setAvailabilityMessage('')
      return
    }

    console.log('🔥 Checking availability for:', { startDate, endDate, carId: car.id })

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Temel tarih kontrolü
    if (start >= end) {
      console.log('🔥 Start date is not before end date')
      setAvailabilityMessage('Alış tarihi dönüş tarihinden önce olmalı')
      setIsDateRangeValid(false)
      return
    }

    // Bugünün tarihini al (saat kısmı olmadan)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (start < today) {
      console.log('🔥 Start date is in the past')
      setAvailabilityMessage('Alış tarihi bugünden önce olamaz')
      setIsDateRangeValid(false)
      return
    }

    // unavailableDates kontrolünü kaldır - sadece API ile kontrol et
    // Bu sayede gelecekteki rezervasyonlar tarih seçimini engellemez

    // API ile real-time availability kontrolü
    try {
      const url = `/api/cars/availability?carId=${car.id}&startDate=${startDate}&endDate=${endDate}`
      console.log('🔥 Making availability request to:', url)
      
      const response = await fetch(url)
      console.log('🔥 Availability response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔥 Availability response data:', data)
        
        if (data.success && data.available) {
          setAvailabilityMessage('Seçilen tarihler müsait ✓')
          setIsDateRangeValid(true)
          console.log('🔥 Dates are available!')
        } else {
          setAvailabilityMessage(data.reason || 'Seçilen tarihler müsait değil')
          setIsDateRangeValid(false)
          console.log('🔥 Dates are NOT available:', data.reason)
        }
      } else {
        console.log('🔥 Response not ok:', response.status)
        setAvailabilityMessage('Müsaitlik kontrolü yapılamadı')
        setIsDateRangeValid(false)
      }
    } catch (error) {
      console.error('🔥 Müsaitlik kontrolü hatası:', error)
      setAvailabilityMessage('Müsaitlik kontrolü yapılamadı')
      setIsDateRangeValid(false)
    }
  }

  const calculatePricing = () => {
    if (!startDate || !endDate || !car?.daily_price) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    const subtotalAmount = days * car.daily_price
    const taxAmount = subtotalAmount * 0.18 // 18% KDV
    const totalAmount = subtotalAmount + taxAmount

    setRentalDays(days)
    setSubtotal(subtotalAmount)
    setTax(taxAmount)
    setTotal(totalAmount)
  }

  const handleBookingRedirect = () => {
    console.log('🔥 BUTTON CLICKED! handleBookingRedirect called')
    console.log('🔥 Current state:', {
      startDate,
      endDate, 
      isDateRangeValid,
      rentalDays,
      subtotal,
      total,
      carId: car?.id
    })
    
    if (!startDate || !endDate) {
      console.log('🔥 No dates selected')
      alert('Lütfen tarih seçin')
      return
    }
    if (!selectedLocationId) {
      alert('Lütfen bir alış lokasyonu seçin')
      return
    }
    
    if (!isDateRangeValid) {
      console.log('🔥 Date range is not valid')
      alert('Lütfen müsait olan tarihleri seçin')
      return
    }
    
    // Booking verilerini localStorage'a kaydet
    const bookingData = {
      carId: car.id,
      startDate,
      endDate,
      pickupLocation,
      pickupLocationId: selectedLocationId,
      rentalDays,
      subtotal,
      tax,
      total,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    console.log('🔥 Booking data saved to localStorage:', bookingData)

    // Booking sayfasına query params ile veri gönder
    const params = new URLSearchParams({
      carId: car.id.toString(),
      startDate,
      endDate,
      pickupLocation,
      pickupLocationId: selectedLocationId ? String(selectedLocationId) : '',
      rentalDays: rentalDays.toString(),
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString()
    })

    const url = `/booking?${params.toString()}`
    console.log('🔥 Redirecting to:', url)
    
    try {
      // Router kullanarak yönlendir
      router.push(url)
    } catch (error) {
      console.error('🔥 Redirect error:', error)
      // Fallback olarak window.location kullan
      window.location.href = url
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 sticky top-24">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center">
          <Calendar className="mr-3 h-6 w-6 text-orange-500" />
          Kiralama Detayları
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label className="text-gray-300 mb-2 block">Alış Tarihi *</Label>
            <Input
              required
              type="date"
              value={startDate}
              onChange={(e) => {
                const selectedDate = e.target.value
                console.log('🔥 Start date selected:', selectedDate)
                
                if (isDateUnavailable(selectedDate)) {
                  console.log('🔥 Selected start date is unavailable, finding next available')
                  const nextAvailable = getNextAvailableDate(selectedDate)
                  console.log('🔥 Next available date:', nextAvailable)
                  setStartDate(nextAvailable)
                  setAvailabilityMessage(`Seçilen tarih müsait değil. ${new Date(nextAvailable).toLocaleDateString('tr-TR')} tarihine yönlendirildi.`)
                } else {
                  setStartDate(selectedDate)
                }
              }}
              min={getMinSelectableDate()}
              className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-2 block">Dönüş Tarihi *</Label>
            <Input
              required
              type="date"
              value={endDate}
              onChange={(e) => {
                const selectedDate = e.target.value
                console.log('🔥 End date selected:', selectedDate)
                
                if (isDateUnavailable(selectedDate)) {
                  console.log('🔥 Selected end date is unavailable, finding next available')
                  const nextAvailable = getNextAvailableDate(selectedDate)
                  console.log('🔥 Next available end date:', nextAvailable)
                  setEndDate(nextAvailable)
                  setAvailabilityMessage(`Seçilen tarih müsait değil. ${new Date(nextAvailable).toLocaleDateString('tr-TR')} tarihine yönlendirildi.`)
                } else {
                  setEndDate(selectedDate)
                }
              }}
              min={startDate || getMinSelectableDate()}
              className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
            />
          </div>
        </div>

        {/* Availability Status */}
        {availabilityMessage && (
          <div className={`flex items-center space-x-3 p-3 rounded-lg ${
            isDateRangeValid 
              ? 'bg-green-900/20 border border-green-500/30' 
              : 'bg-red-900/20 border border-red-500/30'
          }`}>
            {isDateRangeValid ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className={isDateRangeValid ? 'text-green-400' : 'text-red-400'}>
              {availabilityMessage}
            </span>
          </div>
        )}

        {/* Unavailable Dates Display */}
        {unavailableDates.length > 0 && (
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <h4 className="text-yellow-400 font-semibold mb-2">Müsait Olmayan Tarihler:</h4>
            <div className="space-y-1 text-sm text-yellow-300">
              {unavailableDates.map((date, index) => (
                <div key={index}>
                  {new Date(date.start).toLocaleDateString('tr-TR')} - {new Date(date.end).toLocaleDateString('tr-TR')} 
                  <span className="ml-2 text-xs text-gray-400">({date.status})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label className="text-gray-300 mb-2 block">Alış Lokasyonu *</Label>
          <Select
            value={selectedLocationId ? String(selectedLocationId) : ''}
            onValueChange={(value) => {
              const id = Number(value)
              const loc = locations.find((l) => l.id === id)
              if (!loc) return
              const isCarLoc = car?.location_id ? Number(car.location_id) === loc.id : true
              if (!isCarLoc) return
              setSelectedLocationId(id)
              setPickupLocation(`${loc.name} (${loc.city})`)
            }}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Lokasyon seçin" />
            </SelectTrigger>
            <SelectContent className="bg-gray-400 border-gray-700">
              {locations.map((loc) => {
                const isCarLoc = car?.location_id ? Number(car.location_id) === loc.id : true
                return (
                  <SelectItem key={loc.id} value={String(loc.id)} disabled={!isCarLoc}>
                    {loc.name} ({loc.city}){!isCarLoc ? ' — uygun değil' : ''}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Pricing Summary */}
        {rentalDays > 0 && (
          <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex justify-between text-gray-300">
              <span>Günlük Ücret</span>
              <span>₺{car?.daily_price?.toLocaleString('tr-TR') || 0}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>{rentalDays} Gün × ₺{car?.daily_price?.toLocaleString('tr-TR')}</span>
              <span>₺{subtotal.toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>KDV (%18)</span>
              <span>₺{tax.toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-2">
              <span>Toplam</span>
              <span className="text-orange-500">₺{total.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        )}

        <Button 
          onClick={handleBookingRedirect}
          disabled={!startDate || !endDate || !isDateRangeValid || !selectedLocationId}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!startDate || !endDate ? 'Tarih Seçin' : !isDateRangeValid ? 'Müsait Tarih Seçin' : !selectedLocationId ? 'Lokasyon Seçin' : 'Rezervasyona Devam Et'}
        </Button>

        <div className="text-center text-sm text-gray-400 space-y-1">
          <p>• Ücretsiz iptal (24 saat öncesine kadar)</p>
          <p>• Anında onay</p>
          <p>• 7/24 müşteri desteği</p>
        </div>
      </CardContent>
    </Card>
  )
}