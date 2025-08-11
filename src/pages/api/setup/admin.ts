import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Admin tablosunu oluştur
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    

    // Admin kullanıcısını kontrol et
    const adminCheck = await db.query(
      'SELECT id FROM admins WHERE email = $1',
      ['admin@drive.com']
    )

    if (adminCheck.rows.length === 0) {
      // Admin kullanıcısı yok, oluştur
      const hashedPassword = await hashPassword('admin123')
      
      await db.query(
        'INSERT INTO admins (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@drive.com', hashedPassword, 'admin']
      )

      return res.status(200).json({
        success: true,
        message: 'Admin kullanıcısı oluşturuldu',
        credentials: {
          email: 'admin@drive.com',
          password: 'admin123'
        }
      })
    } else {
      return res.status(200).json({
        success: true,
        message: 'Admin kullanıcısı zaten mevcut',
        credentials: {
          email: 'admin@drive.com',
          password: 'admin123'
        }
      })
    }
  } catch (error) {
    console.error('Setup error:', error)
    return res.status(500).json({ error: 'Kurulum hatası' })
  }
}
