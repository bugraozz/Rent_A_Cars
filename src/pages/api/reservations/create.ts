import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Kullanıcı girişi kontrol et
    const user = getUserFromRequest(req)
    if (!requireAuth(user)) {
      return res.status(401).json({ error: 'Giriş yapmanız gerekli' })
    }

    const {
      carId,
      startDate,
      endDate,
      pickupLocation,
      returnLocation,
      notes
    } = req.body

    if (!carId || !startDate || !endDate || !pickupLocation) {
      return res.status(400).json({ error: 'Eksik bilgiler' })
    }

    // Tarih kontrolü
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return res.status(400).json({ error: 'Bitiş tarihi başlangıç tarihinden sonra olmalı' })
    }

    if (start < new Date()) {
      return res.status(400).json({ error: 'Başlangıç tarihi bugünden önce olamaz' })
    }

    // Araç bilgisini getir
    const carQuery = 'SELECT * FROM cars WHERE id = $1 AND status = $2'
    const carResult = await db.query(carQuery, [carId, 'available'])
    
    if (carResult.rows.length === 0) {
      return res.status(404).json({ error: 'Araç bulunamadı veya müsait değil' })
    }

    const car = carResult.rows[0]

    // Müsaitlik kontrolü - Sadece aktif rezervasyonlarla çakışma kontrolü
    const conflictQuery = `
      SELECT COUNT(*) as conflict_count 
      FROM reservations 
      WHERE car_id = $1 
      AND status = 'active'
      AND (
        (start_date <= $2 AND end_date >= $2) OR
        (start_date <= $3 AND end_date >= $3) OR
        (start_date >= $2 AND end_date <= $3)
      )
    `
    
    const conflictResult = await db.query(conflictQuery, [carId, startDate, endDate])
    
    if (parseInt(conflictResult.rows[0].conflict_count) > 0) {
      return res.status(400).json({ error: 'Seçilen tarihlerde araç müsait değil' })
    }

    // Gün sayısını hesapla
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    // Fiyat hesaplamaları
    const dailyRate = parseFloat(car.daily_price)
    const totalAmount = dailyRate * totalDays
    const depositAmount = totalAmount * 0.2 // %20 depozito

    // Rezervasyon oluştur
    const insertQuery = `
      INSERT INTO reservations (
        car_id, customer_id, start_date, end_date, 
        pickup_location, return_location, daily_rate, 
        total_days, total_amount, deposit_amount, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `

    const insertResult = await db.query(insertQuery, [
      carId,
      user.id,
      startDate,
      endDate,
      pickupLocation,
      returnLocation || pickupLocation,
      dailyRate,
      totalDays,
      totalAmount,
      depositAmount,
      notes || null
    ])

    return res.status(201).json({
      success: true,
      message: 'Rezervasyon başarıyla oluşturuldu',
      reservation: insertResult.rows[0]
    })

  } catch (error) {
    console.error('Reservation creation error:', error)
    return res.status(500).json({ error: 'Sunucu hatası' })
  }
}
