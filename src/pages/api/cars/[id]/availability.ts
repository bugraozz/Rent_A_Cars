import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { carId, startDate, endDate } = req.query

    if (!carId) {
      return res.status(400).json({ error: 'Car ID gerekli' })
    }

    // Eğer tarih aralığı verilmişse, o tarihlerde müsaitlik kontrolü yap
    if (startDate && endDate) {
      const conflictQuery = `
        SELECT COUNT(*) as conflict_count 
        FROM reservations 
        WHERE car_id = $1 
        AND status IN ('pending', 'confirmed', 'active')
        AND (
          (start_date <= $2 AND end_date >= $2) OR
          (start_date <= $3 AND end_date >= $3) OR
          (start_date >= $2 AND end_date <= $3)
        )
      `
      
      const conflictResult = await db.query(conflictQuery, [carId, startDate, endDate])
      const isAvailable = parseInt(conflictResult.rows[0].conflict_count) === 0

      return res.status(200).json({
        success: true,
        available: isAvailable,
        carId: parseInt(carId as string),
        startDate,
        endDate
      })
    }

    // Sadece car ID verilmişse, SADECE AKTIF rezervasyonları getir (gelecekteki onaylanmış rezervasyonları dahil etme)
    const reservationsQuery = `
      SELECT start_date, end_date, status 
      FROM reservations 
      WHERE car_id = $1 
      AND status = 'active'
      AND start_date <= CURRENT_DATE
      AND end_date >= CURRENT_DATE
      ORDER BY start_date ASC
    `
    
    const reservations = await db.query(reservationsQuery, [carId])

    // Araç bilgisini de getir
    const carQuery = `
      SELECT id, name, daily_price, available_from, status
      FROM cars 
      WHERE id = $1
    `
    
    const carResult = await db.query(carQuery, [carId])
    
    if (carResult.rows.length === 0) {
      return res.status(404).json({ error: 'Araç bulunamadı' })
    }

    const car = carResult.rows[0]
    
    return res.status(200).json({
      success: true,
      car: {
        id: car.id,
        name: car.name,
        daily_price: car.daily_price,
        available_from: car.available_from,
        status: car.status
      },
      reservations: reservations.rows,
      unavailableDates: reservations.rows.map(r => ({
        start: r.start_date,
        end: r.end_date,
        status: r.status
      }))
    })
  } catch (error) {
    console.error('Car availability error:', error)
    return res.status(500).json({ error: 'Sunucu hatası' })
  }
}
