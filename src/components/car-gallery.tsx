"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize } from "lucide-react"

interface CarGalleryProps {
  images: string[]
}

export function CarGallery({ images = [] }: CarGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)

  // Fallback to default image if no images provided
  const galleryImages = images.length > 0 ? images : ["/car-animated.gif"]

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <section className="relative bg-gray-900">
      <div className="relative h-[70vh] overflow-hidden">
        <Image src={galleryImages[currentImage] || "/car-animated.gif"} alt="Car gallery" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Navigation buttons - only show if more than 1 image */}
        {galleryImages.length > 1 && (
          <>
            <Button
              onClick={prevImage}
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              onClick={nextImage}
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
        >
          <Maximize className="h-5 w-5" />
        </Button>

        {/* Dots indicator - only show if more than 1 image */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImage ? "bg-orange-500" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail grid - only show if more than 1 image */}
      {galleryImages.length > 1 && (
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-5 gap-4">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`relative h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentImage ? "border-orange-500" : "border-gray-700"
                }`}
              >
                <Image src={image || "/car-animated.gif"} alt={`Gallery ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
