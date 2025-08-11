import { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    console.log('Public cars API called')
    
    // Önce tüm araçları sayalım
    const countResult = await db.query('SELECT COUNT(*) as total, status FROM cars GROUP BY status')
    console.log('🔥 Car counts by status:', countResult.rows)
    
    // Tüm araçları getir ve rezervasyon durumlarını kontrol et
    const result = await db.query(
      `SELECT 
        c.*,
        COALESCE(
          json_agg(
            CASE WHEN ci.image_url IS NOT NULL 
            THEN ci.image_url 
            ELSE NULL END
          ) FILTER (WHERE ci.image_url IS NOT NULL), 
          '[]'::json
        ) as images,
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
      GROUP BY c.id
      ORDER BY 
        CASE 
          WHEN c.status = 'available' THEN 1
          WHEN c.status = 'maintenance' THEN 2
          WHEN c.status = 'busy' THEN 3
          ELSE 4
        END,
        c.created_at DESC`
    )
    
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
    const cars = result.rows.map((car: any) => {
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
        next_available_date: car.next_available_date
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
