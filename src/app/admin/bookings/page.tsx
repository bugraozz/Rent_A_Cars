'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Eye,  Download, Filter, Calendar, Car, User, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { AdminGuard } from '@/components/AdminGuard'
import { useAuth } from '@/context/AuthContext'

interface Reservation {
  id: number
  car_id: number
  customer_id: number
  start_date: string
  end_date: string
  pickup_location: string
  return_location: string
  daily_rate: number
  total_days: number
  total_amount: number
  deposit_amount: number
  notes: string
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  customer_name: string
  car_name: string
  email: string
  phone: string
  brand: string
  model: string
  year: number
  daily_price: number
  car_images: string[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const statusMap = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'İptal', color: 'bg-red-100 text-red-800' },
}

export default function AdminBookingsPage() {
  const { logout } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/reservations?${params}`)
      const data = await response.json()

      if (data.success) {
        setReservations(data.data)
        setPagination(data.pagination)
      } else {
        toast.error('Rezervasyonlar yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Rezervasyonlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter])

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchReservations()
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusUpdate = async (reservationId: number, newStatus: string, notes: string = '') => {
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, notes }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Rezervasyon durumu "${statusMap[newStatus as keyof typeof statusMap].label}" olarak güncellendi`)
        // Refresh reservations list
        fetchReservations()
      } else {
        toast.error('Durum güncellenemedi: ' + data.error)
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Durum güncellenirken hata oluştu')
    }
  }

  const formatPrice = (price: number) => {
    const numericPrice = Number(price) || 0
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(numericPrice)
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

  const getStats = () => {
    const totalRevenue = reservations.reduce((sum, res) => {
      const amount = Number(res.total_amount) || 0
      return sum + amount
    }, 0)
    const activeBookings = reservations.filter(res => res.status === 'active').length
    const pendingBookings = reservations.filter(res => res.status === 'pending').length

    return { totalRevenue, activeBookings, pendingBookings }
  }

  const stats = getStats()

  return (
    <AdminGuard>
      <div className="min-h-screen px-4 py-8 text-white bg-gradient-to-b from-blue-950 to-black">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Rezervasyon Yönetimi</h1>
              <p className="text-gray-300 mt-2">
                Tüm rezervasyonları görüntüleyin ve yönetin
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={logout}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Çıkış
              </Button>
              <Button className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                <Download className="mr-2 h-4 w-4" />
                Rapor İndir
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-gray-300">Toplam Rezervasyon</h3>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{pagination.total}</div>
              <p className="text-xs text-gray-400">
                +{Math.round((pagination.total * 0.12))} bu aydan
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-gray-300">Aktif Kiralama</h3>
                <Car className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.activeBookings}</div>
              <p className="text-xs text-gray-400">
                Şu anda devam eden
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-gray-300">Bekleyen Onay</h3>
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.pendingBookings}</div>
              <p className="text-xs text-gray-400">
                Onay bekliyor
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-gray-300">Toplam Gelir</h3>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-gray-400">
                Bu sayfadaki toplam
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Filtreler</h3>
              <p className="text-sm text-gray-400">Rezervasyonları filtreleyin ve arayın</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Müşteri adı, email, araç markası..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-gray-900 border-gray-600 text-white">
                  <SelectValue placeholder="Durum filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="confirmed">Onaylandı</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtrele
              </Button>
            </div>
          </div>

      {/* Reservations Table */}
          {/* Reservations Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Rezervasyonlar</h3>
              <p className="text-sm text-gray-400">
                Sayfa {pagination.page} / {pagination.totalPages} ({pagination.total} toplam)
              </p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Rezervasyon</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Müşteri</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Araç</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Tarihler</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Toplam</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Durum</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-300">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation) => (
                        <tr key={reservation.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-white">#{reservation.id}</div>
                            <div className="text-sm text-gray-400">
                              {formatDate(reservation.created_at)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-white">{reservation.customer_name}</div>
                            <div className="text-sm text-gray-400">
                              {reservation.email}
                            </div>
                            {reservation.phone && (
                              <div className="text-sm text-gray-400">
                                {reservation.phone}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              {reservation.car_images.length > 0 && (
                                <Image
                                  src={reservation.car_images[0]}
                                  alt={reservation.car_name}
                                  width={40}
                                  height={30}
                                  className="rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium text-white">{reservation.car_name}</div>
                                <div className="text-sm text-gray-400">
                                  {formatPrice(reservation.daily_rate)}/gün
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-white">
                              <div>{formatDate(reservation.start_date)}</div>
                              <div className="text-gray-400">↓</div>
                              <div>{formatDate(reservation.end_date)}</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {reservation.total_days} gün
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-white">{formatPrice(reservation.total_amount)}</div>
                            {reservation.deposit_amount > 0 && (
                              <div className="text-sm text-gray-400">
                                Kapora: {formatPrice(reservation.deposit_amount)}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(reservation.status)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {reservation.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                    onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                                  >
                                    ✓ Onayla
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                                  >
                                    ✕ İptal
                                  </Button>
                                </>
                              )}
                              {reservation.status === 'confirmed' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                  onClick={() => handleStatusUpdate(reservation.id, 'active')}
                                >
                                  🚗 Aktif Et
                                </Button>
                              )}
                              {reservation.status === 'active' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                                  onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                                >
                                  ✅ Tamamla
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} rezervasyon
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-gray-600 hover:bg-gray-700"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Önceki
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, pagination.page - 2) + i
                        if (pageNum > pagination.totalPages) return null
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            className={pageNum === pagination.page 
                              ? "bg-blue-600 hover:bg-blue-700 text-white" 
                              : "text-white border-gray-600 hover:bg-gray-700"
                            }
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-gray-600 hover:bg-gray-700"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Sonraki
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
