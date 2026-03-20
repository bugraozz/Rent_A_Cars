"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Zap, Gauge, Users, Eye, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Car } from "@/types/car"

type Filters = {
  location?: string
  locationIds?: number[]
  startDate?: string
  endDate?: string
  category?: string
}

type StatusInfo = {
  label: string
  available: boolean
  availableDate: Date | null
  showAvailabilityDate: boolean
}

interface ReactBitsCarCardProps {
  car: Car
  mainImage: string
  filters?: Filters
  statusInfo: StatusInfo
  formatPrice: (price: number) => string
  onReserve: () => void
}

export function ReactBitsCarCard({
  car,
  mainImage,
  filters,
  statusInfo,
  formatPrice,
  onReserve,
}: ReactBitsCarCardProps) {
  const rating = (car.rating || 4.5).toFixed(1)

  return (
    <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-0 text-white shadow-[0_20px_70px_-28px_rgba(0,0,0,0.8)] transition-all duration-500 hover:-translate-y-1 hover:border-orange-300/40 hover:shadow-[0_26px_80px_-30px_rgba(249,115,22,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_0%,rgba(249,115,22,0.18),transparent_55%)]" />

      <div className="relative">
        <Image
          src={mainImage}
          alt={car.name}
          width={500}
          height={300}
          className="h-60 w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/car-animated.gif"
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

        {car.status === "available" && car.daily_price > 2000 && (
          <Badge className="absolute left-4 top-4 border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white">
            Premium
          </Badge>
        )}

        {!statusInfo.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-[2px]">
            <div className="text-center">
              <Badge variant="destructive" className="mb-2 px-4 py-2 text-lg">
                {statusInfo.label}
              </Badge>
              {statusInfo.showAvailabilityDate && statusInfo.availableDate && (
                <p className="text-sm text-white">
                  Musait olacagi tarih: {statusInfo.availableDate.toLocaleDateString("tr-TR")}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
            <span className="font-medium text-white">{rating}</span>
            <span className="text-sm text-gray-300">({car.review_count || 0})</span>
          </div>
          <Badge variant="outline" className="border-orange-300/80 bg-black/45 text-orange-200 backdrop-blur-sm">
            {car.category}
          </Badge>
        </div>
      </div>

      <CardHeader className="gap-2 px-6 pt-5">
        <CardTitle className="line-clamp-1 text-xl font-bold tracking-tight text-white">
          {car.name}
        </CardTitle>
        <CardDescription className="line-clamp-1 text-gray-300">
          {car.brand} {car.model} • {car.year}
        </CardDescription>
        <CardAction>
          <Badge variant="outline" className="border-blue-300/60 bg-blue-500/10 text-blue-200">
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            On Planda
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
            <Zap className="mx-auto mb-2 h-5 w-5 text-orange-400" />
            <div className="text-xs uppercase text-gray-400">Model</div>
            <div className="text-sm font-medium text-white">{car.year}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
            <Gauge className="mx-auto mb-2 h-5 w-5 text-orange-400" />
            <div className="text-xs uppercase text-gray-400">Yakit</div>
            <div className="text-sm font-medium text-white">{car.fuel_type}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
            <Users className="mx-auto mb-2 h-5 w-5 text-orange-400" />
            <div className="text-xs uppercase text-gray-400">Vites</div>
            <div className="text-sm font-medium text-white">{car.transmission}</div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">Gunluk kiralama</div>
            <span className="text-3xl font-bold text-orange-300">TL{formatPrice(car.daily_price)}</span>
            <span className="ml-1 text-gray-400">/gun</span>
          </div>
          <div className="text-right">
            {statusInfo.showAvailabilityDate && statusInfo.availableDate ? (
              <>
                <div className="text-xs uppercase tracking-wide text-gray-400">Musaitlik</div>
                <div className="font-medium text-orange-200">
                  {statusInfo.availableDate.toLocaleDateString("tr-TR")}
                </div>
              </>
            ) : (
              <div className="rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                Hemen teslim
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 border-t border-white/10 px-6 pb-6 pt-4">
        <Link
          href={{
            pathname: `/cars/${car.id}`,
            query:
              filters?.locationIds && filters.locationIds.length > 0
                ? { locations: filters.locationIds.join(",") }
                : undefined,
          }}
          className="flex-1"
        >
          <Button variant="outline" className="w-full border-orange-300/80 text-orange-200 hover:bg-orange-500 hover:text-black">
            <Eye className="mr-2 h-4 w-4" />
            Detaylar
          </Button>
        </Link>

        <div className="flex-1">
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!statusInfo.available}
            onClick={onReserve}
          >
            {car.status === "busy"
              ? "Mesgul"
              : car.status === "maintenance"
              ? "Bakimda"
              : car.status === "reserved"
              ? "Su anda rezerve"
              : "Rezerve Et"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
