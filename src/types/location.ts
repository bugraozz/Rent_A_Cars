export interface Location {
  id: number
  name: string
  address: string
  city: string
  phone?: string | null
  is_active: boolean
  created_at: string
}

export type LocationCreate = {
  name: string
  address: string
  city: string
  phone?: string
  is_active?: boolean
}

export type LocationUpdate = Partial<LocationCreate>
