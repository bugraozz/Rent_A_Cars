import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { firstName, lastName, email, phone, subject, message } = req.body

      // Validation
      if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          error: 'Lütfen tüm zorunlu alanları doldurun'
        })
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Geçerli bir email adresi girin'
        })
      }

      // Insert message into database
      const result = await pool.query(
        `INSERT INTO contact_messages 
         (first_name, last_name, email, phone, subject, message, status, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
         RETURNING id`,
        [firstName, lastName, email, phone || null, subject, message, 'unread']
      )

      return res.status(200).json({
        success: true,
        message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
        messageId: result.rows[0].id
      })

    } catch (error) {
      console.error('Contact message error:', error)
      return res.status(500).json({
        success: false,
        error: 'Mesaj gönderilirken bir hata oluştu'
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }
}
