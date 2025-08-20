import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = getUserFromRequest(req)
    if (!requireAuth(user)) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
  } catch (authError) {
    console.log("Auth error:", authError)
    return res.status(401).json({ success: false, error: 'Authentication failed' })
  }

  if (req.method === 'GET') {
    try {
      const user = getUserFromRequest(req)
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not authenticated' })
      }
      
      // Get user profile data
      const userQuery = `
        SELECT id, first_name, last_name, email, phone, date_of_birth, 
               license_number, license_issue_date, address, city, country, created_at
        FROM customers 
        WHERE id = $1
      `
      
      const userResult = await db.query(userQuery, [user.id])
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }

      // Get user reservations
      const reservationsQuery = `
        SELECT 
          r.*,
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
        LEFT JOIN cars c ON r.car_id = c.id
        LEFT JOIN car_images ci ON c.id = ci.car_id
        WHERE r.customer_id = $1
        GROUP BY r.id, c.brand, c.model, c.year, c.daily_price
        ORDER BY r.created_at DESC
      `
      
      const reservationsResult = await db.query(reservationsQuery, [user.id])
      
      // Format reservations
      interface DbReservation {
        brand: string;
        model: string;
        year: number;
        car_images: string[];
        [key: string]: unknown;
      }
      
      const reservations = reservationsResult.rows.map((reservation: DbReservation) => ({
        ...reservation,
        car_name: `${reservation.brand} ${reservation.model} ${reservation.year}`,
        car_images: reservation.car_images || []
      }))

      return res.status(200).json({
        success: true,
        data: {
          profile: userResult.rows[0],
          reservations: reservations
        }
      })

    } catch (error) {
      console.error('Get profile error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } 
  
  else if (req.method === 'PUT') {
    try {
      const user = getUserFromRequest(req)
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not authenticated' })
      }
      
      const { first_name, last_name, phone, date_of_birth, license_number, license_issue_date, address, city, country } = req.body

      // Update user profile
      const updateQuery = `
        UPDATE customers 
        SET first_name = $1, last_name = $2, phone = $3, date_of_birth = $4, 
            license_number = $5, license_issue_date = $6, address = $7, city = $8, country = $9
        WHERE id = $10
        RETURNING id, first_name, last_name, email, phone, date_of_birth, 
                  license_number, license_issue_date, address, city, country, created_at
      `
      
      const result = await db.query(updateQuery, [
        first_name, last_name, phone, date_of_birth, 
        license_number, license_issue_date, address, city, country, user.id
      ])

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Profile updated successfully'
      })

    } catch (error) {
      console.error('Update profile error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } 
  
  else {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
