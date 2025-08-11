"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, MessageCircle, Reply, Clock, User, Phone, Filter, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { AdminGuard } from "@/components/AdminGuard"

interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'responded'
  admin_response?: string
  responded_by_name?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [responding, setResponding] = useState(false)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/messages?status=${statusFilter}&page=${currentPage}&limit=10`)
      const result = await response.json()

      if (result.success) {
        setMessages(result.messages)
        setPagination(result.pagination)
      } else {
        toast.error(result.error || 'Mesajlar yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Fetch messages error:', error)
      toast.error('Mesajlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [statusFilter, currentPage])

  const handleStatusChange = async (messageId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          status: newStatus
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Mesaj durumu güncellendi')
        fetchMessages()
      } else {
        toast.error(result.error || 'Mesaj güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Mesaj güncellenirken hata oluştu')
    }
  }

  const handleResponse = async (messageId: number) => {
    if (!adminResponse.trim()) {
      toast.error('Lütfen yanıt mesajı yazın')
      return
    }

    try {
      setResponding(true)

      const response = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          status: 'responded',
          adminResponse: adminResponse.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Yanıt gönderildi')
        setAdminResponse('')
        setSelectedMessage(null)
        fetchMessages()
      } else {
        toast.error(result.error || 'Yanıt gönderilirken hata oluştu')
      }
    } catch (error) {
      console.error('Send response error:', error)
      toast.error('Yanıt gönderilirken hata oluştu')
    } finally {
      setResponding(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge className="bg-red-500 text-white">Okunmadı</Badge>
      case 'read':
        return <Badge className="bg-yellow-500 text-white">Okundu</Badge>
      case 'responded':
        return <Badge className="bg-green-500 text-white">Yanıtlandı</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>
    }
  }

  const getSubjectText = (subject: string) => {
    switch (subject) {
      case 'reservation':
        return 'Rezervasyon'
      case 'support':
        return 'Müşteri Desteği'
      case 'partnership':
        return 'İş Ortaklığı'
      case 'complaint':
        return 'Şikayet'
      case 'suggestion':
        return 'Öneri'
      case 'other':
        return 'Diğer'
      default:
        return subject
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen px-4 py-8 text-white bg-gradient-to-b from-blue-950 to-black">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">İletişim Mesajları</h1>
              <p className="text-gray-300">Müşteri mesajlarını yönetin ve yanıtlayın</p>
            </div>
            <Button onClick={fetchMessages} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-blue-400" />
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">Durum:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-gray-900 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="unread">Okunmadı</SelectItem>
                    <SelectItem value="read">Okundu</SelectItem>
                    <SelectItem value="responded">Yanıtlandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Henüz mesaj bulunmuyor</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-white">
                            {message.first_name} {message.last_name}
                          </h3>
                          {getStatusBadge(message.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{message.email}</span>
                          </div>
                          {message.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{message.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(message.created_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={message.status}
                          onValueChange={(value) => handleStatusChange(message.id, value)}
                        >
                          <SelectTrigger className="w-32 bg-gray-900 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="unread">Okunmadı</SelectItem>
                            <SelectItem value="read">Okundu</SelectItem>
                            <SelectItem value="responded">Yanıtlandı</SelectItem>
                          </SelectContent>
                        </Select>
                        {message.status !== 'responded' && (
                          <Button
                            onClick={() => setSelectedMessage(message)}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            Yanıtla
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">
                    Konu: {getSubjectText(message.subject)}
                  </p>
                  <p className="text-white bg-gray-800 p-3 rounded-lg">{message.message}</p>
                </div>

                {message.admin_response && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">
                        Admin Yanıtı - {message.responded_by_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.responded_at!).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-white">{message.admin_response}</p>
                  </div>
                )}

                {/* Response Form */}
                {selectedMessage?.id === message.id && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-white">Yanıt Gönder</h4>
                    <Textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Yanıt mesajınızı yazın..."
                      className="bg-gray-900 border-gray-600 text-white min-h-24"
                      maxLength={1000}
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleResponse(message.id)}
                        disabled={responding}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {responding ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Gönderiliyor...</span>
                          </div>
                        ) : (
                          <>
                            <Reply className="w-4 h-4 mr-1" />
                            Yanıtı Gönder
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedMessage(null)
                          setAdminResponse('')
                        }}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        İptal
                      </Button>
                    </div>
                  </div>
                )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                Önceki
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    className={
                      currentPage === page
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "text-white border-gray-600 hover:bg-gray-700"
                    }
                    size="sm"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                variant="outline"
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                Sonraki
          </Button>
        </div>
      )}
        </div>
      </div>
    </AdminGuard>
  )
}
