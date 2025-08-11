"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Car, CreditCard, Shield, Clock, MapPin, Phone } from "lucide-react"

const faqData = [
  {
    category: "Genel Sorular",
    icon: Car,
    questions: [
      {
        question: "Araç kiralama için minimum yaş sınırı nedir?",
        answer: "Araç kiralama için minimum yaş 21'dir. 21-25 yaş arası sürücüler için genç sürücü ek ücreti uygulanır. 25 yaş üstü sürücüler için herhangi bir ek ücret bulunmamaktadır."
      },
      {
        question: "Hangi belgeler gereklidir?",
        answer: "Geçerli bir ehliyet (minimum 1 yıl), kimlik belgesi ve kredi kartı gerekmektedir. Yurtdışından gelen müşterilerimiz için uluslararası ehliyet ve pasaport da kabul edilmektedir."
      },
      {
        question: "Araçları ne kadar önceden rezerve edebilirim?",
        answer: "Araçlarımızı 12 aya kadar önceden rezerve edebilirsiniz. Erken rezervasyon avantajları ve özel indirimler için web sitemizi takip edebilirsiniz."
      }
    ]
  },
  {
    category: "Ödeme ve Fiyatlandırma",
    icon: CreditCard,
    questions: [
      {
        question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        answer: "Visa, MasterCard, American Express kredi kartları ve banka kartları kabul edilmektedir. Nakit ödeme sadece ofis teslimatlarında geçerlidir."
      },
      {
        question: "Fiyatlara hangi hizmetler dahildir?",
        answer: "Temel sigorta, 24/7 yol yardımı, sınırsız kilometre (belirtilen paketlerde) ve temel temizlik hizmetleri fiyata dahildir. Ek sigorta ve hizmetler isteğe bağlıdır."
      },
      {
        question: "İptal politikanız nedir?",
        answer: "Rezervasyon tarihinden 24 saat öncesine kadar ücretsiz iptal edilebilir. Son 24 saat içindeki iptallerde günlük ücretin %50'si tahsil edilir."
      }
    ]
  },
  {
    category: "Sigorta ve Güvenlik",
    icon: Shield,
    questions: [
      {
        question: "Araçlarınızda hangi sigortalar bulunmaktadır?",
        answer: "Tüm araçlarımızda zorunlu trafik sigortası, kasko sigortası ve 3. şahıs sorumluluk sigortası bulunmaktadır. Ek olarak tam kapsamlı sigorta paketleri de sunulmaktadır."
      },
      {
        question: "Kaza durumunda ne yapmam gerekir?",
        answer: "Öncelikle 112 ve 155'i arayın. Ardından bizim 24/7 destek hattımızı arayarak durumu bildirin. Gerekli belgeler ve işlemler hakkında size rehberlik edeceğiz."
      },
      {
        question: "Araç arızası durumunda ne olur?",
        answer: "24/7 yol yardımı hizmetimiz ile anında yardım alabilirsiniz. Gerektiğinde yedek araç temin edilir ve herhangi bir ek ücret talep edilmez."
      }
    ]
  },
  {
    category: "Teslimat ve İade",
    icon: MapPin,
    questions: [
      {
        question: "Araç teslim noktalarınız nerede?",
        answer: "İstanbul, Ankara, İzmir, Antalya havalimanları ve şehir merkezlerinde teslimat noktalarımız bulunmaktadır. Ayrıca otel ve özel adres teslimatı da yapılmaktadır."
      },
      {
        question: "Farklı lokasyonda araç iade edebilir miyim?",
        answer: "Evet, 'tek yön kiralama' hizmeti ile farklı şehirde araç iade edebilirsiniz. Bu hizmet için ek ücret uygulanır ve mesafeye göre hesaplanır."
      },
      {
        question: "Geç iade durumunda ne olur?",
        answer: "İlk 30 dakika ücretsizdir. Sonrasında saatlik ücret uygulanır. 2 saatten fazla gecikmede günlük ücret tahsil edilir."
      }
    ]
  }
]

export function FaqContent() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (questionId: string) => {
    setOpenItems(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black to-blue-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Sıkça Sorulan Sorular
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Araç kiralama sürecinizde karşılaşabileceğiniz soruların cevaplarını burada bulabilirsiniz.
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-800 rounded-lg flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{category.category}</h3>
              </div>
              
              {category.questions.map((item, questionIndex) => {
                const questionId = `${categoryIndex}-${questionIndex}`
                const isOpen = openItems.includes(questionId)
                
                return (
                  <div 
                    key={questionIndex}
                    className="border border-gray-800 rounded-lg overflow-hidden bg-gradient-to-r from-blue-950/20 to-black/20 backdrop-blur-sm"
                  >
                    <button
                      onClick={() => toggleItem(questionId)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-blue-950/30 transition-colors"
                    >
                      <span className="font-semibold text-white pr-4">{item.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <div className="h-px bg-gradient-to-r from-orange-600 to-transparent mb-4"></div>
                        <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-950/30 to-black/30 rounded-lg p-8 max-w-2xl mx-auto border border-orange-600/50 backdrop-blur-sm">
            <Phone className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Başka Sorularınız Var mı?</h3>
            <p className="text-gray-300 mb-6">
              Yukarıda bulamadığınız sorular için 7/24 müşteri hizmetlerimiz ile iletişime geçebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+908501234567" 
                className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>+90 850 123 45 67</span>
              </a>
              <a 
                href="/contact" 
                className="border border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                İletişim Formu
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
