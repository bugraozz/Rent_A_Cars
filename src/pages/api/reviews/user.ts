import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authorization header' 
      })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      })
    }

    const userId = decoded.id

    // Get user's reviews
    const result = await db.query(
      `SELECT 
        r.id,
        r.reservation_id,
        r.rating,
        r.comment,
        r.created_at,
        car.brand,
        car.model,
        car.year,
        res.start_date,
        res.end_date
      FROM reviews r
      LEFT JOIN cars car ON r.car_id = car.id
      LEFT JOIN reservations res ON r.reservation_id = res.id
      WHERE r.customer_id = $1
      ORDER BY r.created_at DESC`,
      [userId]
    )

    interface ReviewRow {
      id: number;
      reservation_id: number;
      rating: number;
      comment: string;
      brand: string | null;
      model: string | null;
      year: number | null;
      start_date: string | null;
      end_date: string | null;
      created_at: string;
    }

    const reviews = result.rows.map((review: ReviewRow) => ({
      id: review.id,
      reservation_id: review.reservation_id,
      rating: review.rating,
      comment: review.comment,
      car_name: review.brand && review.model ? `${review.brand} ${review.model}` : null,
      rental_date: review.start_date ? new Date(review.start_date).toLocaleDateString('tr-TR') : null,
      created_at: review.created_at
    }))

    res.status(200).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    console.error('User reviews error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
