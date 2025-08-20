"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, CreditCard, Shield, Calendar, MapPin, AlertCircle, Check } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import type { Car } from "@/types/car"
import type { Location } from "@/types/location"

interface BookingFormProps {
  car: Car
  initialData?: {
    startDate?: string
    endDate?: string
    pickupLocation?: string
  pickupLocationId?: number
    rentalDays?: number
    subtotal?: number
    tax?: number
    total?: number
  }
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

export function BookingForm({ car, initialData }: BookingFormProps) {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pickupLocation, setPickupLocation] = useState(initialData?.pickupLocation || '')
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [isDateRangeValid, setIsDateRangeValid] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  
  const [rentalDays, setRentalDays] = useState(initialData?.rentalDays || 0)
  const [subtotal, setSubtotal] = useState(initialData?.subtotal || 0)
  const [tax, setTax] = useState(initialData?.tax || 0)
  const [total, setTotal] = useState(initialData?.total || 0)

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    if (user) {
      console.log('🔥 Loading user data:', user)
      
      // Email'i yükle
      setEmail(user.email || '')
      
      // Telefon numarasını yükle (varsa)
      if (user.phone) {
        setPhone(user.phone)
      }
      
      // İsim ve soyisim varsa onları kullan
      if (user.first_name) {
        setFirstName(user.first_name)
      }
      if (user.last_name) {
        setLastName(user.last_name)
      }
      
      // Kart sahibi adını oluştur
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
      if (fullName) {
        setCardHolder(fullName)
      } else if (user.email) {
        // Email'den ad çıkarmaya çalış
        const emailParts = user.email.split('@')[0].split('.')
        if (emailParts.length >= 2) {
          const firstName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1)
          const lastName = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1)
          setFirstName(firstName)
          setLastName(lastName)
          setCardHolder(`${firstName} ${lastName}`)
        } else {
          // Email'in @ öncesi kısmını kullan
          const name = user.email.split('@')[0]
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
          setFirstName(formattedName)
          setCardHolder(formattedName)
        }
      }
      
      // Daha önceki kullanıcı bilgilerini localStorage'dan yükle
      const savedUserData = localStorage.getItem(`userData_${user.id}`)
      if (savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData)
          console.log('🔥 Loading saved user data from localStorage:', parsed)
          
          // Daha önce kaydedilen bilgileri kullan (eğer henüz dolu değilse)
          if (!firstName && parsed.firstName) setFirstName(parsed.firstName)
          if (!lastName && parsed.lastName) setLastName(parsed.lastName)
          if (!phone && parsed.phone) setPhone(parsed.phone)
          if (!cardHolder && parsed.cardHolder) setCardHolder(parsed.cardHolder)
        } catch (error) {
          console.error('Error parsing saved user data:', error)
        }
      }
      
      console.log('🔥 User data loaded:', {
        firstName: user.first_name || 'from email',
        lastName: user.last_name || 'from email',
        email: user.email,
        phone: user.phone || 'not provided',
        cardHolder: fullName || 'from email'
      })
    }
  }, [user])

  // Araç müsaitlik bilgilerini yükle
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!car?.id) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/cars/${car.id}/availability`)
        if (response.ok) {
          const data: AvailabilityData = await response.json()
          setUnavailableDates(data.unavailableDates)
        }
      } catch (error) {
        console.error('Müsaitlik kontrolü hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [car?.id])

  // Load active locations and default to car location if present
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/locations')
        const json = await res.json()
        if (json.success) {
          setLocations(json.data)
          // If initialData carries selection, prioritize it
          if (initialData?.pickupLocationId) {
            const found = json.data.find((l: Location) => l.id === Number(initialData.pickupLocationId))
            if (found) {
              setSelectedLocationId(found.id)
              if (!pickupLocation) setPickupLocation(`${found.name} (${found.city})`)
            }
          } else if (!pickupLocation && car?.location_id) {
            const found = json.data.find((l: Location) => l.id === Number(car.location_id))
            if (found) {
              setSelectedLocationId(found.id)
              setPickupLocation(`${found.name} (${found.city})`)
            }
          }
        }
      } catch (e) {
        console.error('Lokasyonlar yüklenemedi', e)
      }
    }
    load()
  }, [car?.location_id])

  // Tarih değişikliklerini izle ve müsaitlik kontrolü yap
  useEffect(() => {
    if (startDate && endDate) {
      checkDateAvailability()
      calculatePricing()
    }
  }, [startDate, endDate])

  // Initial data geldiğinde availability check yap
  useEffect(() => {
    console.log('🔥 Initial data effect:', { initialData, startDate, endDate })
    if (initialData && initialData.startDate && initialData.endDate) {
      console.log('🔥 Setting date range as valid from initial data')
      setIsDateRangeValid(true)
      setAvailabilityMessage('Seçilen tarihler müsait ✓')
      checkDateAvailability()
    }
  }, [initialData])

  // Form validation check - Sadece basic validation
  useEffect(() => {
    // Sadece temel gereksinimler: geçerli tarihler ve kullanıcı girişi
    const isValid = isDateRangeValid && !!user
    
    console.log('🔥 Form validation:', {
      isDateRangeValid,
      userLoggedIn: !!user,
      isValid
    })
    
    setIsFormValid(isValid)
  }, [isDateRangeValid, user])

  // Debug log for initial data
  useEffect(() => {
    console.log('🔥 BookingForm state:', {
      initialData,
      startDate,
      endDate,
      firstName,
      lastName,
      email,
      phone,
      pickupLocation,
      isDateRangeValid,
      isFormValid
    })
  }, [initialData, startDate, endDate, firstName, lastName, email, phone, pickupLocation, isDateRangeValid, isFormValid])

  // Kullanıcı bilgilerini localStorage'a kaydet (form değişikliklerinde)
  useEffect(() => {
    if (user && (firstName || lastName || phone || cardHolder)) {
      const userData = {
        firstName,
        lastName,
        phone,
        cardHolder,
        lastUpdated: new Date().toISOString()
      }
      
      localStorage.setItem(`userData_${user.id}`, JSON.stringify(userData))
      console.log('🔥 User data saved to localStorage:', userData)
    }
  }, [firstName, lastName, phone, cardHolder, user])

  const checkDateAvailability = async () => {
    if (!startDate || !endDate || !car?.id) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      setAvailabilityMessage('Dönüş tarihi alış tarihinden sonra olmalıdır')
      setIsDateRangeValid(false)
      return
    }

    if (start < new Date()) {
      setAvailabilityMessage('Alış tarihi bugünden önce olamaz')
      setIsDateRangeValid(false)
      return
    }

    try {
      const response = await fetch(
        `/api/cars/${car.id}/availability?startDate=${startDate}&endDate=${endDate}`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.available) {
          setAvailabilityMessage('Seçilen tarihler müsait ✓')
          setIsDateRangeValid(true)
        } else {
          setAvailabilityMessage('Seçilen tarihler müsait değil')
          setIsDateRangeValid(false)
        }
      }
    } catch (error) {
      console.error('Müsaitlik kontrolü hatası:', error)
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

  const isDateUnavailable = (dateString: string) => {
    const checkDate = new Date(dateString)
    return unavailableDates.some(({ start, end }) => {
      const startDate = new Date(start)
      const endDate = new Date(end)
      return checkDate >= startDate && checkDate <= endDate
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔥 Submit triggered:', { isFormValid, user: !!user })
    
    if (!user) {
      setError('Rezervasyon yapmak için giriş yapmanız gerekiyor')
      return
    }
    
    if (!isDateRangeValid) {
      setError('Seçilen tarihler müsait değil')
      return
    }

    // Gerçek zamanlı müsaitlik kontrolü
    try {
      const availabilityResponse = await fetch(`/api/cars/availability?carId=${car.id}&startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const availabilityData = await availabilityResponse.json()

      if (!availabilityData.success || !availabilityData.available) {
        setError(`Araç bu tarihler için müsait değil: ${availabilityData.reason || 'Bilinmeyen sebep'}`)
        return
      }
    } catch (error) {
      setError('Müsaitlik kontrolü sırasında hata oluştu')
      return
    }

    // Form alanları kontrolü
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !pickupLocation.trim()) {
      setError('Lütfen tüm kişisel bilgileri doldurun')
      return
    }
    if (!selectedLocationId) {
      setError('Lütfen bir alış lokasyonu seçin')
      return
    }

    if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Lütfen geçerli bir kart numarası girin')
      return
    }

    if (!expiryDate.trim() || !cvv.trim() || !cardHolder.trim()) {
      setError('Lütfen tüm kart bilgilerini doldurun')
      return
    }

    setBookingLoading(true)
    setError('')
    setSuccess('')

    try {
      const reservationData = {
        carId: car.id,
        startDate,
        endDate,
        pickupLocation,
        pickupLocationId: selectedLocationId,
        totalPrice: total,
        customerInfo: {
          firstName,
          lastName,
          email,
          phone
        },
        specialRequests,
        paymentInfo: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          cvv,
          cardHolder
        }
      }

      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reservationData)
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Rezervasyonunuz başarıyla oluşturuldu!')
        
        // localStorage'daki pending booking'i temizle
        localStorage.removeItem('pendingBooking')
        console.log('🔥 Pending booking cleared from localStorage')
        
        // Sadece rezervasyon ile ilgili alanları temizle, kullanıcı bilgilerini koru
        setStartDate('')
        setEndDate('')
        setPickupLocation('')
        setSpecialRequests('')
        setCardNumber('')
        setExpiryDate('')
        setCvv('')
        
        // İsteğe bağlı: 3 saniye sonra ana sayfaya yönlendir
        setTimeout(() => {
          window.location.href = '/cars'
        }, 3000)
      } else {
        setError(result.error || 'Rezervasyon oluşturulamadı')
      }
    } catch (error) {
      console.error('Rezervasyon hatası:', error)
      setError('Sunucu hatası oluştu')
    } finally {
      setBookingLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Booking Form */}
      <div className="lg:col-span-2 space-y-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-400">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center space-x-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-green-400">{success}</span>
          </div>
        )}

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center">
              <User className="mr-3 h-6 w-6 text-orange-500" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-300 mb-2 block">Ad *</Label>
                <Input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                  placeholder="Adınız"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Soyad *</Label>
                <Input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">E-posta *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Telefon *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center">
              <Calendar className="mr-3 h-6 w-6 text-orange-500" />
              Kiralama Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-300 mb-2 block">Alış Tarihi *</Label>
                <Input
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Dönüş Tarihi *</Label>
                <Input
                  required
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
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
                <SelectContent className="bg-gray-900 border-gray-700">
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

            <div>
              <Label className="text-gray-300 mb-2 block">Özel Talepler</Label>
              <Textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                placeholder="Varsa özel taleplerinizi belirtiniz..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center">
              <CreditCard className="mr-3 h-6 w-6 text-orange-500" />
              Ödeme Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Kart Numarası *</Label>
              <Input
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-300 mb-2 block">Son Kullanma *</Label>
                <Input 
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500" 
                  placeholder="MM/YY" 
                  maxLength={5}
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">CVV *</Label>
                <Input 
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500" 
                  placeholder="123" 
                  maxLength={4}
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Kart Sahibi *</Label>
              <Input
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                placeholder="Kart üzerindeki isim"
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-green-400 text-sm">256-bit SSL şifreleme ile güvenli ödeme</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="bg-gray-900/50 border-gray-800 sticky top-24">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Rezervasyon Özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex space-x-4">
              <Image
                src={car?.images?.[0] || "/placeholder.svg?height=80&width=120"}
                alt={car?.name || "Araç"}
                width={120}
                height={80}
                className="rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-white">{car?.name}</h3>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 mt-1">
                  {car?.category || 'Araç'}
                </Badge>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Alış Tarihi</span>
                <span>{startDate ? new Date(startDate).toLocaleDateString('tr-TR') : '-'}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Dönüş Tarihi</span>
                <span>{endDate ? new Date(endDate).toLocaleDateString('tr-TR') : '-'}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Süre</span>
                <span>{rentalDays > 0 ? `${rentalDays} Gün` : '-'}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Lokasyon</span>
                <span>{pickupLocation || '-'}</span>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Günlük Ücret</span>
                <span>₺{car?.daily_price?.toLocaleString('tr-TR') || 0}</span>
              </div>
              {rentalDays > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>{rentalDays} Gün × ₺{car?.daily_price?.toLocaleString('tr-TR')}</span>
                  <span>₺{subtotal.toLocaleString('tr-TR')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-300">
                <span>Sigorta</span>
                <span className="text-green-400">Dahil</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>KDV (%18)</span>
                <span>₺{tax.toLocaleString('tr-TR')}</span>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="flex justify-between text-white font-bold text-xl">
              <span>Toplam</span>
              <span className="text-orange-500">₺{total.toLocaleString('tr-TR')}</span>
            </div>

            <Button 
              type="submit"
              disabled={!isFormValid || bookingLoading || !user}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? 'İşleniyor...' : 'Rezervasyonu Tamamla'}
            </Button>

            {!user && (
              <div className="text-center text-sm text-yellow-400">
                Rezervasyon yapmak için giriş yapmalısınız
              </div>
            )}

            <div className="text-center text-sm text-gray-400 space-y-1">
              <p>• Ücretsiz iptal (24 saat öncesine kadar)</p>
              <p>• Anında onay</p>
              <p>• 7/24 müşteri desteği</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
