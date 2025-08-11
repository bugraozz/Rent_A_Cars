import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

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

  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const { status, notes } = req.body

      // Validate status
      const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
        })
      }

      // Update reservation status
      const updateQuery = `
        UPDATE reservations 
        SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `
      
      const result = await db.query(updateQuery, [status, notes || '', id])

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Reservation not found' })
      }

      const updatedReservation = result.rows[0]

      // Araç durumunu güncelle
      if (status === 'active') {
        // Sadece rezervasyon aktif olduğunda araç durumunu "reserved" yap
        // ve available_from'u rezervasyon bitiş tarihine ayarla
        await db.query(
          'UPDATE cars SET status = $1, available_from = $2 WHERE id = $3',
          ['reserved', updatedReservation.end_date, updatedReservation.car_id]
        )
      } else if (status === 'confirmed') {
        // Onaylanmış rezervasyonlar için araç durumunu değiştirme
        // Araç sadece rezervasyon aktif olduğunda "reserved" olsun
        // Bu sayede gelecekteki rezervasyonlar diğer müşterileri engellemez
        console.log('Reservation confirmed but car status not changed - allows other bookings until active')
      } else if (status === 'completed' || status === 'cancelled') {
        // Rezervasyon tamamlandığında veya iptal edildiğinde araç durumunu "available" yap
        // available_from'u bugünün tarihine ayarla (NULL yerine)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugünün tarihi
        await db.query(
          'UPDATE cars SET status = $1, available_from = $2 WHERE id = $3',
          ['available', today, updatedReservation.car_id]
        )
      }

      // Get updated reservation with customer and car details
      const detailQuery = `
        SELECT 
          r.*,
          c.first_name,
          c.last_name,
          c.email,
          c.phone,
          car.brand,
          car.model,
          car.year
        FROM reservations r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN cars car ON r.car_id = car.id
        WHERE r.id = $1
      `
      
      const detailResult = await db.query(detailQuery, [id])
      const reservation = detailResult.rows[0]

      // Format response
      const formattedReservation = {
        ...reservation,
        customer_name: `${reservation.first_name} ${reservation.last_name}`,
        car_name: `${reservation.brand} ${reservation.model} ${reservation.year}`
      }

      return res.status(200).json({
        success: true,
        data: formattedReservation,
        message: `Reservation status updated to ${status}`
      })

    } catch (error) {
      console.error('Update reservation status error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
