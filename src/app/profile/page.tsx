'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User, Calendar, Car, Phone, Mail, Edit, Save, X, MessageSquare, Star, Bell, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { ReviewForm } from '@/components/review-form'

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  license_number: string
  license_issue_date: string
  address: string
  city: string
  country: string
  created_at: string
}

interface UserReservation {
  id: number
  car_id: number
  car_name: string
  car_images: string[]
  start_date: string
  end_date: string
  total_days: number
  daily_rate: number
  total_amount: number
  deposit_amount: number
  status: string
  created_at: string
  brand: string
  model: string
  year: number
  daily_price: number
}

interface Review {
  id: number
  reservation_id: number
  rating: number
  comment: string
  created_at: string
}

interface Notification {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  related_id: number
  related_type: string
  created_at: string
}

const statusMap = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'İptal', color: 'bg-red-100 text-red-800' },
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reservations, setReservations] = useState<UserReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null)
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [editData, setEditData] = useState<UserProfile>({
    id: 0,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    license_number: '',
    license_issue_date: '',
    address: '',
    city: '',
    country: '',
    created_at: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchUserReviews()
      fetchNotifications()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (data.success) {
        setProfile(data.data.profile)
        setReservations(data.data.reservations)
        setEditData({
          id: data.data.profile.id,
          first_name: data.data.profile.first_name,
          last_name: data.data.profile.last_name,
          email: data.data.profile.email,
          phone: data.data.profile.phone || '',
          date_of_birth: data.data.profile.date_of_birth || '',
          license_number: data.data.profile.license_number || '',
          license_issue_date: data.data.profile.license_issue_date || '',
          address: data.data.profile.address || '',
          city: data.data.profile.city || '',
          country: data.data.profile.country || '',
          created_at: data.data.profile.created_at
        })
      } else {
        toast.error('Profil bilgileri yüklenemedi')
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      toast.error('Profil bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReviews = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/reviews/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserReviews(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          markAsRead: true
        })
      })
      
      if (response.ok) {
        fetchNotifications() // Refresh notifications
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAsRead: 'all'
        })
      })
      
      if (response.ok) {
        fetchNotifications() // Refresh notifications
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleReviewSubmit = async (reservationId: number, rating: number, comment: string) => {
    try {
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          rating,
          comment
        })
      })

      if (response.ok) {
        // Refresh reservations and reviews
        fetchProfile()
        fetchUserReviews()
        setShowReviewForm(null) // Close review form
        toast.success('Değerlendirmeniz başarıyla gönderildi!')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Değerlendirme gönderilirken hata oluştu')
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setEditing(false)
        toast.success('Profil bilgileri güncellendi')
        
        // Update auth context
        if (user) {
          updateUser({
            ...user,
            first_name: data.data.first_name,
            last_name: data.data.last_name
          })
        }
      } else {
        toast.error('Profil güncellenemedi: ' + data.error)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Profil güncellenirken hata oluştu')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy')
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold">Giriş yapmanız gerekiyor</h1>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Profil bulunamadı</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 text-white bg-gradient-to-b from-blue-950 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profilim</h1>
          <p className="text-gray-300 mt-2">Hesap bilgilerinizi ve rezervasyonlarınızı yönetin</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border border-gray-700">
            <TabsTrigger value="profile" className="flex items-center space-x-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <User className="h-4 w-4" />
              <span>Profil Bilgileri</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center space-x-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <Car className="h-4 w-4" />
              <span>Rezervasyonlarım</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              <Bell className="h-4 w-4" />
              <span>Bildirimler</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs px-1 py-0 min-w-[20px] h-5 rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Kişisel Bilgiler</h3>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Kişisel bilgilerinizi görüntüleyin ve düzenleyin
              </p>
            </div>
            <div className="p-6 space-y-6">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-gray-300">Ad *</Label>
                    <Input
                      id="first_name"
                      value={editData.first_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Adınız"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-gray-300">Soyad *</Label>
                    <Input
                      id="last_name"
                      value={editData.last_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Soyadınız"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">E-posta *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="E-posta adresiniz"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Telefon</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Telefon numaranız"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-gray-300">Doğum Tarihi</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={editData.date_of_birth}
                      onChange={(e) => setEditData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      className="bg-gray-900 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_number" className="text-gray-300">Ehliyet Numarası</Label>
                    <Input
                      id="license_number"
                      value={editData.license_number}
                      onChange={(e) => setEditData(prev => ({ ...prev, license_number: e.target.value }))}
                      placeholder="Ehliyet numaranız"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_issue_date" className="text-gray-300">Ehliyet Veriliş Tarihi</Label>
                    <Input
                      id="license_issue_date"
                      type="date"
                      value={editData.license_issue_date}
                      onChange={(e) => setEditData(prev => ({ ...prev, license_issue_date: e.target.value }))}
                      className="bg-gray-900 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-300">Şehir</Label>
                    <Input
                      id="city"
                      value={editData.city}
                      onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Şehir"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-300">Ülke</Label>
                    <Input
                      id="country"
                      value={editData.country}
                      onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Ülke"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-gray-300">Adres</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Adresiniz"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Ad</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{profile.first_name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Soyad</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{profile.last_name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">E-posta</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{profile.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Telefon</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{profile.phone || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Doğum Tarihi</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{profile.date_of_birth ? formatDate(profile.date_of_birth) : 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Ehliyet Numarası</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded">
                      <span className="text-white">{profile.license_number || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Ehliyet Veriliş Tarihi</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{profile.license_issue_date ? formatDate(profile.license_issue_date) : 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Şehir</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded">
                      <span className="text-white">{profile.city || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Ülke</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded">
                      <span className="text-white">{profile.country || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-gray-300">Adres</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded">
                      <span className="text-white">{profile.address || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Üyelik Tarihi</Label>
                    <div className="p-2 bg-gray-900 border border-gray-600 rounded flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {editing ? (
                  <>
                    <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Kaydet
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <X className="mr-2 h-4 w-4" />
                      İptal
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <Edit className="mr-2 h-4 w-4" />
                    Düzenle
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Rezervasyonlarım</h3>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Geçmiş ve aktif rezervasyonlarınızı görüntüleyin
              </p>
            </div>
            <div className="p-6">
              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Car className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Henüz rezervasyon yok</h3>
                  <p className="text-gray-400 mb-6">İlk rezervasyonunuzu yapmak için araç kataloğumuza göz atın.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Araçları İncele
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => {
                    const existingReview = userReviews.find(r => r.reservation_id === reservation.id)
                    const canReview = reservation.status === 'completed' && !existingReview
                    const isReviewFormOpen = showReviewForm === reservation.id
                    
                    return (
                      <div key={reservation.id} className="bg-gray-900 border border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-0">
                          <div className="flex flex-col lg:flex-row">
                            {/* Araç Görsel ve Bilgileri */}
                            <div className="lg:w-1/3 p-6 bg-gradient-to-r from-gray-800 to-gray-700">
                              <div className="flex items-center space-x-4">
                                {reservation.car_images.length > 0 && (
                                  <div className="relative">
                                    <Image
                                      src={reservation.car_images[0]}
                                      alt={reservation.car_name}
                                      width={80}
                                      height={60}
                                      className="rounded-lg object-cover shadow-sm"
                                    />
                                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                      #{reservation.id}
                                    </div>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-white">{reservation.car_name}</h3>
                                  <p className="text-sm text-gray-300">{formatPrice(reservation.daily_rate)}/gün</p>
                                  <div className="mt-2">
                                    {getStatusBadge(reservation.status)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Rezervasyon Detayları */}
                            <div className="lg:w-2/3 p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Tarihler */}
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-medium text-gray-300">Kiralama Tarihleri</span>
                                  </div>
                                  <div className="text-sm">
                                    <div className="font-medium text-white">{formatDate(reservation.start_date)}</div>
                                    <div className="text-gray-400 flex items-center">
                                      <span className="mr-1">→</span>
                                      <span>{formatDate(reservation.end_date)}</span>
                                    </div>
                                    <div className="text-xs text-blue-400 mt-1">{reservation.total_days} gün</div>
                                  </div>
                                </div>

                                {/* Ödeme Bilgileri */}
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-green-900 rounded-full flex items-center justify-center">
                                      <span className="text-xs text-green-400">₺</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300">Ödeme Bilgileri</span>
                                  </div>
                                  <div className="text-sm">
                                    <div className="font-bold text-lg text-green-400">{formatPrice(reservation.total_amount)}</div>
                                    {reservation.deposit_amount > 0 && (
                                      <div className="text-xs text-gray-400">
                                        Kapora: {formatPrice(reservation.deposit_amount)}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-1">
                                      Rezervasyon: {formatDate(reservation.created_at)}
                                    </div>
                                  </div>
                                </div>

                                {/* Değerlendirme */}
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-medium text-gray-300">Değerlendirme</span>
                                  </div>
                                  {existingReview ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                              i < existingReview.rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-600'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <div className="text-xs text-green-400 font-medium">✓ Değerlendirildi</div>
                                    </div>
                                  ) : canReview ? (
                                    <Button
                                      size="sm"
                                      variant={isReviewFormOpen ? "secondary" : "outline"}
                                      onClick={() => {
                                        setShowReviewForm(isReviewFormOpen ? null : reservation.id)
                                      }}
                                      className={`w-full ${isReviewFormOpen 
                                        ? 'bg-gray-700 text-white' 
                                        : 'border-gray-400 text-gray-700 hover:bg-gray-700'
                                      }`}
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      {isReviewFormOpen ? 'Formu Kapat' : 'Değerlendir'}
                                    </Button>
                                  ) : (
                                    <div className="text-xs text-gray-400 p-2 bg-gray-800 border border-gray-600 rounded text-center">
                                      {reservation.status === 'completed' ? 'Değerlendirme yapılabilir' : 'Henüz değerlendirilemez'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Inline Review Form */}
                          {isReviewFormOpen && (
                            <div className="border-t border-gray-600 bg-gradient-to-r from-gray-800 to-gray-900 p-6">
                              <div className="flex items-center justify-between mb-6">
                                <div>
                                  <h3 className="text-xl font-semibold text-white">
                                    {reservation.car_name} için Değerlendirmeniz
                                  </h3>
                                  <p className="text-sm text-gray-400">Deneyiminizi diğer müşterilerle paylaşın</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowReviewForm(null)}
                                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                                >
                                  <X className="w-5 h-5" />
                                </Button>
                              </div>
                              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-600 p-4">
                                <ReviewForm
                                  reservation={{
                                    id: reservation.id,
                                    car_id: reservation.car_id,
                                    car_name: reservation.car_name,
                                    start_date: reservation.start_date,
                                    end_date: reservation.end_date,
                                    status: reservation.status
                                  }}
                                  onReviewSubmitted={() => {
                                    fetchProfile()
                                    fetchUserReviews()
                                    setShowReviewForm(null)
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Bildirimler</h3>
                    {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white">
                        {unreadCount} okunmamış
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Size gönderilen bildirimler ve mesaj yanıtları
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllNotificationsAsRead}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Tümünü Okundu İşaretle</span>
                  </Button>
                )}
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Henüz bildirim yok</h3>
                  <p className="text-gray-400">Size gönderilen bildirimler burada görünecek</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        notification.is_read
                          ? 'bg-gray-900 border-gray-600'
                          : 'bg-blue-900/30 border-blue-600 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className={`font-medium ${
                              notification.is_read ? 'text-white' : 'text-blue-300'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <Badge className="bg-blue-500 text-white text-xs">Yeni</Badge>
                            )}
                            {notification.type === 'contact_response' && (
                              <Badge className="bg-green-600 text-white text-xs">
                                Mesaj Yanıtı
                              </Badge>
                            )}
                          </div>
                          <p className={`mb-3 ${
                            notification.is_read ? 'text-gray-300' : 'text-blue-200'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              {format(new Date(notification.created_at), 'dd.MM.yyyy HH:mm')}
                            </span>
                            {!notification.is_read && (
                              <Button
                                onClick={() => markNotificationAsRead(notification.id)}
                                variant="outline"
                                size="sm"
                                className="text-blue-400 border-blue-600 hover:bg-blue-900/20"
                              >
                                Okundu İşaretle
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
