import { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'



interface CarRow {
  id: number;
  brand: string;
  model: string;
  year: number;
  status: string;
  features?: string | string[];
  images?: string[];
  available_from?: string;
  location_id?: number;
  location_name?: string;
  location_city?: string;
  is_currently_reserved?: boolean;
  next_available_date?: string;
  rating?: number;
  review_count?: number;
  daily_price?: number;
  created_at?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    console.log('Public cars API called')
    const { locations } = req.query
    const whereClauses: string[] = []
  const params: (string | number | boolean | null | undefined)[] = []
    let pc = 0
    // Parse locations param (comma-separated IDs)
    let locationIds: number[] = []
    if (typeof locations === 'string' && locations.trim().length > 0) {
      locationIds = locations.split(',').map((id) => parseInt(id)).filter((n) => !isNaN(n))
      if (locationIds.length > 0) {
        pc++
  params.push(locationIds as unknown as number)
        whereClauses.push(`c.location_id = ANY($${pc}::int[])`)
      }
    }
    
    // Önce tüm araçları sayalım
    const countResult = await db.query('SELECT COUNT(*) as total, status FROM cars GROUP BY status')
    console.log('🔥 Car counts by status:', countResult.rows)
    
    // Tüm araçları getir, rezervasyon ve rating bilgilerini ekle
    const baseQuery = `SELECT 
        c.*,
        COALESCE(
          json_agg(
            CASE WHEN ci.image_url IS NOT NULL 
            THEN ci.image_url 
            ELSE NULL END
          ) FILTER (WHERE ci.image_url IS NOT NULL), 
          '[]'::json
        ) as images,
        l.id as location_id,
        l.name as location_name,
        l.city as location_city,
        -- Ortalama puan ve yorum sayısı
        COALESCE(AVG(rvw.rating), 0) as rating,
        COUNT(rvw.id) as review_count,
        -- En yakın rezervasyon bitiş tarihi
        (SELECT MIN(r.end_date) 
         FROM reservations r 
         WHERE r.car_id = c.id 
         AND r.status IN ('pending', 'confirmed', 'active')
         AND r.end_date >= CURRENT_DATE
        ) as next_available_date,
        -- Aktif rezervasyon var mı kontrolü
        (SELECT COUNT(*) > 0
         FROM reservations r 
         WHERE r.car_id = c.id 
         AND r.status IN ('pending', 'confirmed', 'active')
         AND r.start_date <= CURRENT_DATE
         AND r.end_date >= CURRENT_DATE
        ) as is_currently_reserved
  FROM cars c
  LEFT JOIN car_images ci ON c.id = ci.car_id
  LEFT JOIN locations l ON l.id = c.location_id
  LEFT JOIN reviews rvw ON rvw.car_id = c.id
      ${whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''}
      GROUP BY c.id, l.id, l.name, l.city
      ORDER BY 
        CASE 
          WHEN c.status = 'available' THEN 1
          WHEN c.status = 'maintenance' THEN 2
          WHEN c.status = 'busy' THEN 3
          ELSE 4
        END,
        c.created_at DESC`

    const result = await db.query(baseQuery, params)
    
    console.log('🔥 SQL Query executed for ALL cars (including sold)')
    console.log('🔥 Raw SQL result count:', result.rows.length)

    console.log('🔥 Raw SQL result count:', result.rows.length)
    console.log('🔥 Cars with their statuses:', result.rows.map(car => ({ 
      id: car.id, 
      brand: car.brand, 
      model: car.model, 
      status: car.status,
      available_from: car.available_from 
    })))

    // Veriyi frontend'in beklediği formatta düzenle
  const cars = result.rows.map((car: CarRow) => {
      let effectiveStatus = car.status
      let effectiveAvailableFrom = car.available_from
      
      console.log(`🔥 Processing car ${car.id}: status=${car.status}, is_currently_reserved=${car.is_currently_reserved}, next_available_date=${car.next_available_date}`)
      
      // Akıllı durum hesaplama:
      // 1. Eğer araç "available" ve şu anda rezerve edilmişse → "reserved" göster
      // 2. Eğer araç "reserved" ama şu anda aktif rezervasyon yoksa → "available" göster  
      if (car.status === 'available' && car.is_currently_reserved) {
        effectiveStatus = 'reserved'
        // Rezervasyon bitiş tarihini müsaitlik tarihi olarak ayarla
        if (car.next_available_date) {
          effectiveAvailableFrom = car.next_available_date
        }
        console.log(`🔥 Car ${car.id} changed to reserved - currently reserved`)
      } else if (car.status === 'reserved' && !car.is_currently_reserved) {
        // Araç DB'de reserved ama şu anda aktif rezervasyon yok → available yap
        effectiveStatus = 'available'
        effectiveAvailableFrom = new Date().toISOString() // Bugün müsait
        console.log(`🔥 Car ${car.id} changed to available - no current reservation`)
      }
      
      const processedCar = {
        ...car,
        name: `${car.brand} ${car.model} ${car.year}`,
        features: car.features ? (typeof car.features === 'string' ? JSON.parse(car.features) : car.features) : [],
        status: effectiveStatus, // Hesaplanan durumu kullan
        available_from: effectiveAvailableFrom,
        images: car.images || [],
        is_currently_reserved: car.is_currently_reserved,
        next_available_date: car.next_available_date,
        location_id: car.location_id ?? null,
        location_name: car.location_name ?? null,
        location_city: car.location_city ?? null,
        rating: car.rating ? Number(Number(car.rating).toFixed(2)) : 0,
        review_count: car.review_count ? Number(car.review_count) : 0
      }
      
      console.log(`🔥 Final processed car ${car.id}:`, { 
        id: processedCar.id, 
        status: processedCar.status, 
        is_currently_reserved: processedCar.is_currently_reserved 
      })
      
      return processedCar
    })

    console.log('🔥 Processed cars count:', cars.length)
    console.log('🔥 Final cars data:', cars.map(car => ({ 
      id: car.id, 
      name: car.name, 
      status: car.status 
    })))
    console.log('🔥 Public cars API - returning cars:', cars.length)

    res.status(200).json({
      success: true,
      data: cars
    })
  } catch (error) {
    console.error('Cars listing error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
