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
    console.log('Featured cars API called')
    
    // En çok kiralanan araçları getir (rezervasyon sayısına göre sıralanmış)
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
        COUNT(r.id) as reservation_count,
        -- Ortalama rating hesapla (şimdilik sabit değer)
        4.5 + (RANDOM() * 0.5) as rating
      FROM cars c
      LEFT JOIN car_images ci ON c.id = ci.car_id
      LEFT JOIN reservations r ON c.id = r.car_id 
        AND r.status IN ('completed', 'active', 'confirmed')
      WHERE c.status = 'available' 
        OR c.status = 'reserved'
      GROUP BY c.id
      ORDER BY 
        COUNT(r.id) DESC,  -- En çok kiralanan
        c.daily_price DESC, -- Sonra fiyata göre
        c.created_at DESC
      LIMIT 3`
    )
    
    console.log('🔥 Featured cars query result:', result.rows.length)

    // Veriyi frontend'in beklediği formatta düzenle
    const featuredCars = result.rows.map((car: any) => {
      return {
        ...car,
        name: `${car.brand} ${car.model} ${car.year}`,
        features: car.features ? (typeof car.features === 'string' ? JSON.parse(car.features) : car.features) : [],
        images: car.images || [],
        reservation_count: parseInt(car.reservation_count) || 0,
        rating: parseFloat(car.rating) || 4.5,
        // Araç specs'ini oluştur
        engine_power: car.engine_power || Math.floor(Math.random() * 300) + 300, // 300-600 HP
        max_speed: car.max_speed || Math.floor(Math.random() * 100) + 250, // 250-350 km/h  
        seating_capacity: car.seating_capacity || (car.category === 'supercar' ? 2 : 4)
      }
    })

    console.log('🔥 Featured cars processed:', featuredCars.length)
    console.log('🔥 Featured cars data:', featuredCars.map(car => ({ 
      id: car.id, 
      name: car.name, 
      reservation_count: car.reservation_count 
    })))

    res.status(200).json({
      success: true,
      data: featuredCars
    })
  } catch (error) {
    console.error('Featured cars error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
