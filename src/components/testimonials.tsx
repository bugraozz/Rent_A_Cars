"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, Loader2 } from "lucide-react"
import Image from "next/image"

interface Review {
  id: number
  name: string
  role: string
  rating: number
  comment: string
  car_name?: string
  rental_date?: string
  created_at: string
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      console.log("🔥 Reviews API çağrısı yapılıyor...")
      
      const response = await fetch("/api/reviews", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`)
      }

      const result = await response.json()
      console.log("🔥 Reviews API response:", result)
      
      if (result.success && result.data) {
        // En fazla 3 yorumu göster
        setReviews(result.data.slice(0, 3))
      }
    } catch (error: any) {
      console.error("🔥 Reviews yüklenirken hata:", error)
      // Hata durumunda fallback veriler
      const fallbackReviews: Review[] = [
        {
          id: 1,
          name: "Ahmet Y.",
          role: "İş İnsanı",
          rating: 5,
          comment: "Mükemmel hizmet! Araç temiz ve bakımlıydı. Kesinlikle tekrar tercih edeceğim.",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Elif K.",
          role: "Mimar",
          rating: 5,
          comment: "Profesyonel yaklaşım ve kaliteli araçlar. Çok memnun kaldım.",
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "Mehmet D.",
          role: "Doktor",
          rating: 5,
          comment: "24/7 destek gerçekten çok iyi. Sorunsuz bir deneyim yaşadım.",
          created_at: new Date().toISOString()
        }
      ]
      setReviews(fallbackReviews)
    } finally {
      setLoading(false)
    }
  }

  // Avatar resmini oluştur (isim baş harflerinden)
  const generateAvatar = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=f97316&color=ffffff&size=60`
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-transparent to-blue-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Müşteri <span className="text-orange-500">Deneyimleri</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Binlerce mutlu müşterimizin deneyimlerini keşfedin</p>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-white">Müşteri yorumları yükleniyor...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-blue-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Müşteri <span className="text-orange-500">Deneyimleri</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Gerçek müşterilerimizin deneyimlerini keşfedin</p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white text-xl">Henüz müşteri yorumu bulunmuyor.</p>
            <p className="text-gray-400 mt-2">İlk deneyiminizi paylaşmak ister misiniz?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review: Review) => (
              <Card
                key={review.id}
                className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300"
              >
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-orange-500 mb-4" />

                  <div className="flex mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-orange-500 text-orange-500" />
                    ))}
                  </div>

                  <p className="text-gray-300 mb-4 leading-relaxed">"{review.comment}"</p>

                  {/* Araç bilgisi varsa göster */}
                  {review.car_name && (
                    <p className="text-orange-400 text-sm mb-4">
                      📅 {review.car_name} ile kiralama deneyimi
                      {review.rental_date && ` • ${review.rental_date}`}
                    </p>
                  )}

                  <div className="flex items-center">
                    <Image
                      src={generateAvatar(review.name)}
                      alt={review.name}
                      width={60}
                      height={60}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-white">{review.name}</div>
                      <div className="text-gray-400 text-sm">{review.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
