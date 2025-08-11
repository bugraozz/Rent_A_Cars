"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Calendar, MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"

interface ReviewFormProps {
  reservation: {
    id: number
    car_id: number
    car_name: string
    start_date: string
    end_date: string
    status: string
  }
  onReviewSubmitted: () => void
}

export function ReviewForm({ reservation, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Lütfen bir puan verin")
      return
    }

    if (comment.trim().length < 10) {
      toast.error("Yorum en az 10 karakter olmalıdır")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/reviews/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservation_id: reservation.id,
          car_id: reservation.car_id,
          rating,
          comment: comment.trim()
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Değerlendirmeniz başarıyla kaydedildi!")
        setRating(0)
        setComment("")
        onReviewSubmitted()
      } else {
        toast.error(result.error || "Değerlendirme kaydedilemedi")
      }
    } catch (error) {
      console.error("Review submission error:", error)
      toast.error("Bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Sadece tamamlanmış rezervasyonlar için göster
  if (reservation.status !== 'completed') {
    return null
  }

  const ratingTexts = {
    1: "Çok Kötü",
    2: "Kötü", 
    3: "Orta",
    4: "İyi",
    5: "Mükemmel"
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-2">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Deneyiminizi Değerlendirin</h3>
        <p className="text-xs text-gray-600 mt-1">Başkaları için yorum yapın ve puanlayın</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kiralama Bilgisi Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs font-medium text-blue-900">Kiralama Dönemi</p>
              <p className="text-xs text-blue-700">
                {new Date(reservation.start_date).toLocaleDateString('tr-TR')} - {" "}
                {new Date(reservation.end_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="text-center">
          <label className="block text-xs font-medium text-gray-700 mb-3">
            Genel memnuniyetinizi puanlayın
          </label>
          
          <div className="flex justify-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full p-1 transition-all duration-200 hover:scale-105"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 transition-all duration-200 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                />
              </button>
            ))}
          </div>
          
          {rating > 0 && (
            <div className="inline-flex items-center justify-center px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
              <span className="text-xs font-medium text-yellow-800">
                {rating} yıldız - {ratingTexts[rating as keyof typeof ratingTexts]}
              </span>
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Deneyiminizi paylaşın
          </label>
          <div className="relative">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Aracın durumu, servis kalitesi, temizlik gibi konularda deneyimlerinizi paylaşın..."
              className="min-h-[80px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
              maxLength={500}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 py-0.5 rounded">
              {comment.length}/500
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 Detaylı yorumlar diğer müşterilere daha fazla yardımcı olur
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRating(0)
              setComment("")
              onReviewSubmitted()
            }}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-9 text-sm"
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="flex-1  bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed h-9 text-sm"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Gönderiliyor...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Send className="w-3 h-3" />
                <span>Gönder</span>
              </div>
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Değerlendirmeniz onaylandıktan sonra sitede yayınlanacaktır
          </p>
        </div>
      </form>
    </div>
  )
}
