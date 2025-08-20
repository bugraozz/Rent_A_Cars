export interface Car {
  id: number
  name: string
  brand: string
  model: string
  year: number
  category: string
  price: number
  daily_price: number
  fuel_type: string
  transmission: string
  color: string
  description: string
  status: "available" | "busy" | "maintenance" | "reserved"
  available_from: string
  min_driver_age: number
  min_license_years: number
  requires_credit_card: boolean
  requires_deposit: boolean
  created_at: string
  images: string[]
  rating?: number
  review_count?: number
  features?: string[]
  // Optional location linkage
  location_id?: number | null
  location_name?: string | null
  location_city?: string | null
}

export interface CarImage {
  id: number
  car_id: number
  image_url: string
  created_at: string
}
