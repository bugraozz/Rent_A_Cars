"use client"

// ...existing code...
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ModernHeader } from "@/components/modern-header"
import { ModernFooter } from "@/components/modern-footer"
import { CarDetail } from "@/components/car-detail"
import { CarGallery } from "@/components/car-gallery"
import { CarSpecs } from "@/components/car-specs"
import { CarBooking } from "@/components/car-booking"
import { RelatedCars } from "@/components/related-cars"
import { toast } from "sonner"
import { CarDateSelector } from "@/components/car-date-selector"
import type { Car } from "@/types/car"

// Component for car booking card
function CarBookingCard({ car }: { car: Car }) {
  return (
    <div className="space-y-8">
      <CarDateSelector car={car} />
    </div>
  )
}

export default function CarDetailPage() {
  const params = useParams()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCarDetail = React.useCallback(async () => {
    try {
      setLoading(true)
      
      if (!params?.id) {
        throw new Error("Araç ID bulunamadı")
      }
      
      // Önce araçları al
      const response = await fetch("/api/cars", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Araç verisi alınamadı")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // ID'ye göre aracı bul
        const carId = parseInt(params.id as string)
        const foundCar = result.data.find((c: Car) => c.id === carId)
        
        if (foundCar) {
          // Add available_from if missing and ensure required fields
          const completeCar: Car = {
            ...foundCar,
            available_from: foundCar.available_from || new Date().toISOString(),
            min_driver_age: foundCar.min_driver_age || 18,
            min_license_years: foundCar.min_license_years || 1,
            requires_credit_card: foundCar.requires_credit_card ?? true,
            requires_deposit: foundCar.requires_deposit ?? true,
            created_at: foundCar.created_at || new Date().toISOString()
          }
          setCar(completeCar)
        } else {
          toast.error("Araç bulunamadı")
        }
      } else {
        throw new Error("Veri formatı hatalı")
      }
    } catch (error) {
      console.error("Araç detay yükleme hatası:", error)
      toast.error("Araç detayları yüklenemedi")
    } finally {
      setLoading(false)
    }
  }, [params?.id])

  useEffect(() => {
    if (params?.id) {
      fetchCarDetail()
    }
  }, [params?.id, fetchCarDetail])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <div className="text-white text-lg">Araç detayları yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ModernHeader />
      <div className="pt-20">
        {/* Dinamik galeri */}
        {car ? (
          <CarGallery images={car.images || []} />
        ) : (
          <CarGallery images={[]} />
        )}
        
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <CarDetail car={car || undefined} />
              <div className="mt-8">
                <CarSpecs car={car || undefined} />
              </div>
            </div>
            <div className="lg:col-span-1">
              {car ? (
                <CarBookingCard car={car} />
              ) : (
                <CarBooking />
              )}
            </div>
          </div>
        </div>
  <RelatedCars currentCarId={car?.id} category={car?.category} />
      </div>
      <ModernFooter />
    </div>
  )
}
