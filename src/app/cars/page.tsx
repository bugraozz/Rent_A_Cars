"use client"

import { ModernHeader } from "@/components/modern-header"
import { ModernFooter } from "@/components/modern-footer"
import { CarFilters } from "@/components/car-filters"
import { CarListing } from "@/components/car-listing"
import { CarHero } from "@/components/car-hero"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function CarsPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    location: "",
  locationIds: [] as number[],
    startDate: "",
    endDate: "",
    category: "",
  })

  useEffect(() => {
    // URL parametrelerini al
    if (searchParams) {
      const newFilters = {
        location: searchParams.get('location') || "",
        locationIds: (searchParams.get('locations') || '')
          .split(',')
          .map((s) => parseInt(s))
          .filter((n) => !isNaN(n)),
        startDate: searchParams.get('startDate') || "",
        endDate: searchParams.get('endDate') || "",
        category: searchParams.get('category') || "",
      }
      setFilters(newFilters)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-950 text-white">
      <ModernHeader />
      <CarHero />
      <div className="container mx-auto px-6 py-16">
        {/* Arama filtreleri görünür olsun */}
        {(filters.location || (filters.locationIds && filters.locationIds.length) || filters.startDate || filters.endDate || filters.category) && (
          <div className="mb-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Arama Filtreleri:</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              {filters.location && (
                <div className="bg-orange-500 text-black px-3 py-1 rounded-full">
                  📍 {filters.location}
                </div>
              )}
              {filters.locationIds && filters.locationIds.length > 0 && (
                <div className="bg-orange-500 text-black px-3 py-1 rounded-full">
                  📍 {filters.locationIds.length} lokasyon
                </div>
              )}
              {filters.startDate && (
                <div className="bg-orange-500 text-black px-3 py-1 rounded-full">
                  📅 {new Date(filters.startDate).toLocaleDateString('tr-TR')}
                </div>
              )}
              {filters.endDate && (
                <div className="bg-orange-500 text-black px-3 py-1 rounded-full">
                  📅 {new Date(filters.endDate).toLocaleDateString('tr-TR')} 
                </div>
              )}
              {filters.category && filters.category !== 'all' && (
                <div className="bg-orange-500 text-black px-3 py-1 rounded-full">
                  🚗 {filters.category}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <CarFilters />
          </div>
          <div className="lg:col-span-3">
            <CarListing filters={filters} />
          </div>
        </div>
      </div>
      <ModernFooter />
    </div>
  )
}
