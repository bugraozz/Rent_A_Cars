"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react"

interface CarGalleryProps {
  images: string[]
}

export function CarGallery({ images = [] }: CarGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const normalizeImage = (src: string) => {
    if (!src || typeof src !== "string") return "/car-animated.gif"
    const cleaned = src.replace(/\\/g, "/").trim()
    if (cleaned.startsWith("uploads/")) return `/${cleaned}`
    return cleaned
  }

  // Fallback to default image if no images provided
  const galleryImages = useMemo(
    () =>
      (images.length > 0 ? images : ["/car-animated.gif"])
        .map(normalizeImage)
        .filter((src) => typeof src === "string" && src.length > 0),
    [images]
  )

  useEffect(() => {
    if (currentImage >= galleryImages.length) {
      setCurrentImage(0)
    }
  }, [currentImage, galleryImages.length])

  useEffect(() => {
    if (!isLightboxOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isLightboxOpen])

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(85%_120%_at_15%_0%,rgba(249,115,22,0.20),transparent_60%),radial-gradient(70%_95%_at_100%_10%,rgba(59,130,246,0.16),transparent_60%),#020617] px-4 pb-12 pt-6 md:px-6 md:pb-16 md:pt-8">
      <div className="mx-auto grid w-full max-w-[1380px] grid-cols-1 gap-5 lg:grid-cols-[1fr_230px]">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black shadow-[0_35px_100px_-35px_rgba(0,0,0,0.9)]">
          <div className="relative aspect-[16/10] max-h-[78vh] w-full cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
            <Image
              src={galleryImages[currentImage] || "/car-animated.gif"}
              alt="Car gallery backdrop"
              fill
              className="h-full w-full scale-110 object-cover object-center blur-2xl opacity-35"
              quality={70}
              aria-hidden
              unoptimized
            />
            <div className="absolute inset-0 bg-black/35" />
            <Image
              src={galleryImages[currentImage] || "/car-animated.gif"}
              alt="Car gallery"
              fill
              className="h-full w-full object-contain object-center p-3 transition-transform duration-300 md:p-6"
              quality={95}
              priority
              unoptimized
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">
            {currentImage + 1} / {galleryImages.length}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-4 right-4 rounded-full border border-white/25 bg-black/50 p-2 text-white hover:bg-black/70"
            onClick={() => setIsLightboxOpen(true)}
          >
            <Expand className="h-4 w-4" />
          </Button>

          {galleryImages.length > 1 && (
            <>
              <Button
                onClick={prevImage}
                variant="ghost"
                size="sm"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 p-3 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={nextImage}
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 p-3 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 lg:max-h-[min(78vh,700px)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:rounded-2xl lg:border lg:border-white/15 lg:bg-black/25 lg:p-2 lg:pb-2">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`group relative h-24 min-w-36 overflow-hidden rounded-xl border bg-black transition-all duration-200 md:h-28 md:min-w-44 lg:h-32 lg:min-w-0 ${
                  index === currentImage
                    ? "scale-[1.02] border-orange-400 shadow-[0_0_0_1px_rgba(251,146,60,0.40)]"
                    : "border-white/20 opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={image || "/car-animated.gif"}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="h-full w-full object-contain object-center p-1 transition-transform duration-300 group-hover:scale-105"
                  quality={85}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              </button>
            ))}
          </div>
        )}
      </div>

      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <button
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/50 p-2 text-white hover:bg-black/70"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[85vh] w-full max-w-7xl overflow-hidden rounded-2xl border border-white/20 bg-black">
            <Image
              src={galleryImages[currentImage] || "/car-animated.gif"}
              alt="Car full preview"
              fill
              className="object-contain object-center p-3"
              quality={100}
              unoptimized
            />
            {galleryImages.length > 1 && (
              <>
                <Button
                  onClick={prevImage}
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 p-3 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  onClick={nextImage}
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 p-3 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
