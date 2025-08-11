import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { verifyPassword, createToken, setAuthCookie, UserPayload } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' })
    }

    // Kullanıcıyı bul
    const result = await db.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' })
    }

    const user = result.rows[0]

    // Şifre kontrolü
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' })
    }

    // JWT token oluştur
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: 'user',
      first_name: user.first_name,
      last_name: user.last_name,
    }

    const token = createToken(payload)
    
    // HttpOnly cookie ayarla
    setAuthCookie(res, token)

    // Başarılı yanıt (şifre olmadan)
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'user',
      },
    })
  } catch (error) {
    console.error('User login error:', error)
    return res.status(500).json({ error: 'Sunucu hatası' })
  }
}
