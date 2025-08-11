"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Phone, MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      toast.error("Lütfen tüm zorunlu alanları doldurun")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/contact/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.")
        // Form'u temizle
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        })
      } else {
        toast.error(result.error || "Mesaj gönderilirken bir hata oluştu")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      toast.error("Mesaj gönderilirken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gradient-to-b from-blue-950/20 to-black/20  border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center">
          <MessageCircle className="mr-3 h-6 w-6 text-orange-500" />
          Mesaj Gönder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Ad *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                  placeholder="Adınız"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Soyad *</Label>
              <Input 
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500" 
                placeholder="Soyadınız" 
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">E-posta *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                placeholder="ornek@email.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Telefon</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                placeholder="+90 5XX XXX XX XX"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Konu *</Label>
            <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-orange-500">
                <SelectValue placeholder="Konu seçin" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="reservation">Rezervasyon</SelectItem>
                <SelectItem value="support">Müşteri Desteği</SelectItem>
                <SelectItem value="partnership">İş Ortaklığı</SelectItem>
                <SelectItem value="complaint">Şikayet</SelectItem>
                <SelectItem value="suggestion">Öneri</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Mesaj *</Label>
            <Textarea
              className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 min-h-32"
              placeholder="Mesajınızı buraya yazın..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              maxLength={1000}
              required
            />
            <p className="text-gray-400 text-sm mt-1">
              {formData.message.length}/1000 karakter
            </p>
          </div>

          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Gönderiliyor...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Mesaj Gönder</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
