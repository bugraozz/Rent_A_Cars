import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

interface QueryParams extends Array<string | number> {
  [index: number]: string | number;
}

interface ReservationRow {
  id: number;
  customer_id: number;
  car_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  brand: string;
  model: string;
  year: number;
  daily_price: number;
  total_amount: string;
  daily_rate: string;
  deposit_amount: string;
  total_days: string;
  car_images: string[];
  created_at: string;
  status: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Admin authentication check
  try {
    const user = getUserFromRequest(req)
    if (!requireAuth(user)) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }
  } catch (authError) {
    console.log("Auth error:", authError)
    return res.status(401).json({ success: false, error: 'Authentication failed' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { page = '1', limit = '10', status, search } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    let query = `
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        c.brand,
        c.model,
        c.year,
        c.daily_price,
        COALESCE(
          json_agg(
            CASE WHEN ci.image_url IS NOT NULL 
            THEN ci.image_url 
            ELSE NULL END
          ) FILTER (WHERE ci.image_url IS NOT NULL), 
          '[]'::json
        ) as car_images
      FROM reservations r
      LEFT JOIN customers u ON r.customer_id = u.id
      LEFT JOIN cars c ON r.car_id = c.id
      LEFT JOIN car_images ci ON c.id = ci.car_id
      WHERE 1=1
    `

    const params: QueryParams = []
    let paramCount = 0

    if (status && status !== 'all' && typeof status === 'string') {
      paramCount++
      query += ` AND r.status = $${paramCount}`
      params.push(status)
    }

    if (search) {
      paramCount++
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR c.brand ILIKE $${paramCount} OR c.model ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    query += ` GROUP BY r.id, u.first_name, u.last_name, u.email, u.phone, c.brand, c.model, c.year, c.daily_price`
    query += ` ORDER BY r.created_at DESC`

    // Count query for pagination
    let countQuery = `SELECT COUNT(DISTINCT r.id) FROM reservations r LEFT JOIN customers u ON r.customer_id = u.id LEFT JOIN cars c ON r.car_id = c.id WHERE 1=1`
    const countParams: QueryParams = []
    let countParamCount = 0

    if (status && status !== 'all' && typeof status === 'string') {
      countParamCount++
      countQuery += ` AND r.status = $${countParamCount}`
      countParams.push(status)
    }

    if (search) {
      countParamCount++
      countQuery += ` AND (u.first_name ILIKE $${countParamCount} OR u.last_name ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount} OR c.brand ILIKE $${countParamCount} OR c.model ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
    }

    // Execute count query
    const countResult = await db.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)

    // Add pagination to main query
    const offset = (pageNum - 1) * limitNum
    paramCount++
    query += ` LIMIT $${paramCount}`
    params.push(limitNum)

    paramCount++
    query += ` OFFSET $${paramCount}`
    params.push(offset)

    const result = await db.query(query, params)

    // Format the data
    const reservations = result.rows.map((reservation: ReservationRow) => ({
      ...reservation,
      customer_name: `${reservation.first_name} ${reservation.last_name}`,
      car_name: `${reservation.brand} ${reservation.model} ${reservation.year}`,
      car_images: reservation.car_images || [],
      total_amount: parseFloat(reservation.total_amount) || 0,
      daily_rate: parseFloat(reservation.daily_rate) || 0,
      deposit_amount: parseFloat(reservation.deposit_amount) || 0,
      total_days: parseInt(reservation.total_days) || 0
    }))

    return res.status(200).json({
      success: true,
      data: reservations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })

  } catch (error) {
    console.error('Admin reservations error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
