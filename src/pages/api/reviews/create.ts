import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Kullanıcı authentication kontrolü
  try {
    const user = getUserFromRequest(req)
    if (!requireAuth(user)) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
  } catch (authError) {
    console.log("Auth error:", authError)
    return res.status(401).json({ success: false, error: 'Authentication failed' })
  }

  if (req.method === 'POST') {
    try {
      const { reservation_id, car_id, rating, comment } = req.body
      const user = getUserFromRequest(req)

      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' })
      }

      // Validation
      if (!reservation_id || !car_id || !rating || !comment) {
        return res.status(400).json({ 
          success: false, 
          error: 'Rezervasyon ID, araç ID, rating ve yorum gereklidir' 
        })
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          error: 'Rating 1-5 arasında olmalıdır' 
        })
      }

      // Rezervasyonun bu kullanıcıya ait olduğunu ve tamamlandığını kontrol et
      const reservationCheck = await db.query(
        `SELECT id, status, customer_id, car_id, end_date 
         FROM reservations 
         WHERE id = $1 AND customer_id = $2`,
        [reservation_id, user.id]
      )

      if (reservationCheck.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Rezervasyon bulunamadı veya size ait değil' 
        })
      }

      const reservation = reservationCheck.rows[0]

      // Rezervasyon tamamlanmış mı kontrol et
      if (reservation.status !== 'completed') {
        return res.status(400).json({ 
          success: false, 
          error: 'Sadece tamamlanmış rezervasyonlar için yorum yapabilirsiniz' 
        })
      }

      // Daha önce yorum yapılmış mı kontrol et
      const existingReview = await db.query(
        'SELECT id FROM reviews WHERE reservation_id = $1 AND customer_id = $2',
        [reservation_id, user.id]
      )

      if (existingReview.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Bu rezervasyon için zaten yorum yapmışsınız' 
        })
      }

      // Yorumu veritabanına kaydet
      const result = await db.query(
        `INSERT INTO reviews (car_id, customer_id, reservation_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [car_id, user.id, reservation_id, rating, comment]
      )

      const newReview = result.rows[0]

      return res.status(201).json({
        success: true,
        data: newReview,
        message: 'Yorumunuz başarıyla kaydedildi'
      })

    } catch (error) {
      console.error('Review creation error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // GET: Kullanıcının yorumlarını getir
  if (req.method === 'GET') {
    try {
      const user = getUserFromRequest(req)

      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' })
      }

      const result = await db.query(
        `SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          car.brand,
          car.model,
          car.year,
          res.start_date,
          res.end_date,
          res.status as reservation_status
        FROM reviews r
        LEFT JOIN cars car ON r.car_id = car.id
        LEFT JOIN reservations res ON r.reservation_id = res.id
        WHERE r.customer_id = $1
        ORDER BY r.created_at DESC`,
        [user.id]
      )

      const reviews = result.rows.map((review: any) => ({
        ...review,
        car_name: `${review.brand} ${review.model} ${review.year}`,
        rental_period: `${new Date(review.start_date).toLocaleDateString('tr-TR')} - ${new Date(review.end_date).toLocaleDateString('tr-TR')}`
      }))

      return res.status(200).json({
        success: true,
        data: reviews
      })

    } catch (error) {
      console.error('User reviews fetch error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
