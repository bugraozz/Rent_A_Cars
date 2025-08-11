"use client"

import { Button } from "@/components/ui/button"
import { Play, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function ModernHero() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-950 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-red-500 rounded-full animate-ping" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-orange-400 rounded-full animate-bounce" />
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="block text-white">PREMIUM</span>
            <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              ARAÇ KİRALA
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Lüks araçlarla unutulmaz yolculuklar. Hayalinizdeki araçla özgürlüğü yaşayın.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 px-8 py-4 text-lg font-semibold"
          >
            Hemen Başla
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-black bg-transparent px-8 py-4 text-lg font-semibold"
            onClick={() => setIsVideoModalOpen(true)}
          >
            <Play className="mr-2 h-5 w-5" />
            Tanıtım İzle
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
            <div className="text-gray-400 text-sm">Premium Araç</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">50+</div>
            <div className="text-gray-400 text-sm">Şehir</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">24/7</div>
            <div className="text-gray-400 text-sm">Destek</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative bg-black rounded-lg overflow-hidden max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Video Player */}
            <video
              controls
              autoPlay
              className="w-full h-auto"
              src="/uploads/goodrive.mp4"
            >
              Video desteklenmiyor.
            </video>
          </div>
        </div>
      )}
    </section>
  )
}
