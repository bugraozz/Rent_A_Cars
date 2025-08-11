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
    const { carId, startDate, endDate } = req.query

    // Convert query parameters to the expected format
    const car_id = carId as string
    const start_date = startDate as string
    const end_date = endDate as string

    if (!car_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'carId, startDate, and endDate are required'
      })
    }

    // Check if the car exists and get its status
    const carQuery = `
      SELECT id, status, available_from 
      FROM cars 
      WHERE id = $1
    `
    const carResult = await db.query(carQuery, [car_id])

    if (carResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Car not found'
      })
    }

    const car = carResult.rows[0]

    console.log('🔥 Car status check:', {
      carId: car_id,
      carStatus: car.status,
      availableFrom: car.available_from,
      requestedDates: { startDate: start_date, endDate: end_date }
    })

    // Check if car is available (not busy or in maintenance)
    if (car.status === 'busy') {
      return res.status(200).json({
        success: true,
        available: false,
        reason: 'Car is currently busy'
      })
    }

    if (car.status === 'maintenance') {
      return res.status(200).json({
        success: true,
        available: false,
        reason: 'Car is under maintenance'
      })
    }

    // Sadece şu anda aktif rezervasyonlar için "reserved" kontrolü yap
    // available_from tarihi kontrolünü tamamen kaldır
    if (car.status === 'reserved') {
      // Araç şu anda rezerve edilmiş, sadece bugünkü aktif rezervasyonu kontrol et
      const today = new Date().toISOString().split('T')[0]
      const requestedStartDate = new Date(start_date).toISOString().split('T')[0]
      
      // Sadece bugün veya daha sonraki tarihler için rezervasyon kabul et
      // available_from kontrolü yapma, çünkü gelecekteki rezervasyonlar engel olmamalı
      console.log('🔥 Car is reserved but checking if dates are still available for new booking')
    }

    // Check for overlapping ACTIVE reservations only (not confirmed future reservations)
    const reservationQuery = `
      SELECT id, start_date, end_date, status
      FROM reservations 
      WHERE car_id = $1 
        AND status = 'active'
        AND (
          (start_date <= $2 AND end_date >= $2) OR
          (start_date <= $3 AND end_date >= $3) OR
          (start_date >= $2 AND end_date <= $3)
        )
    `
    
    console.log('🔥 Checking for overlapping reservations:', {
      carId: car_id,
      startDate: start_date,
      endDate: end_date,
      query: reservationQuery
    })
    
    const reservationResult = await db.query(reservationQuery, [car_id, start_date, end_date])
    
    console.log('🔥 Reservation query result:', reservationResult.rows)

    if (reservationResult.rows.length > 0) {
      const conflictingReservations = reservationResult.rows.map(row => ({
        id: row.id,
        start_date: row.start_date,
        end_date: row.end_date,
        status: row.status
      }))

      return res.status(200).json({
        success: true,
        available: false,
        reason: 'Car is already reserved for these dates',
        conflicting_reservations: conflictingReservations
      })
    }

    // Car is available
    return res.status(200).json({
      success: true,
      available: true,
      reason: 'Car is available for these dates'
    })

  } catch (error) {
    console.error('Car availability check error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
