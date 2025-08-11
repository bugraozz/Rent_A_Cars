import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    console.log('Reviews API called')
    
    // En yüksek puanlı yorumları getir (testimonials için)
    const result = await db.query(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        c.first_name,
        c.last_name,
        c.email,
        car.brand,
        car.model,
        car.year,
        res.start_date,
        res.end_date
      FROM reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN cars car ON r.car_id = car.id
      LEFT JOIN reservations res ON r.reservation_id = res.id
      WHERE r.rating >= 4 -- Sadece 4-5 yıldızlı yorumlar
        AND r.comment IS NOT NULL 
        AND r.comment != ''
        AND c.first_name IS NOT NULL
      ORDER BY 
        r.rating DESC,
        r.created_at DESC
      LIMIT 6`
    )
    
    console.log('🔥 Reviews query result:', result.rows.length)

    // Veriyi frontend'in beklediği formatta düzenle
    const reviews = result.rows.map((review: any) => {
      // İsmi gizlemek için sadece ilk harfi göster
      const firstName = review.first_name || 'Anonim'
      const lastName = review.last_name || 'K.'
      const maskedName = `${firstName} ${lastName.charAt(0)}.`
      
      // Meslek/rol için rastgele seç (gerçek veri olmadığı için)
      const roles = [
        'İş İnsanı', 'Mimar', 'Doktor', 'Mühendis', 'Avukat', 
        'Öğretmen', 'Pazarlama Uzmanı', 'Girişimci', 'Tasarımcı', 'Consultant'
      ]
      const randomRole = roles[Math.floor(Math.random() * roles.length)]
      
      return {
        id: review.id,
        name: maskedName,
        role: randomRole,
        rating: review.rating,
        comment: review.comment,
        car_name: review.brand && review.model ? `${review.brand} ${review.model}` : null,
        rental_date: review.start_date ? new Date(review.start_date).toLocaleDateString('tr-TR') : null,
        created_at: review.created_at
      }
    })

    console.log('🔥 Processed reviews:', reviews.length)

    res.status(200).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    console.error('Reviews error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
