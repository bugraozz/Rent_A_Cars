import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { verifyPassword, createToken, setAuthCookie, AdminPayload } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log("Admin login API called")

  try {
    const { email, password } = req.body
    console.log("Admin login attempt for:", email)

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' })
    }

    // Admin kullanıcısını bul
    const result = await db.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    )

    console.log("Admin query result:", result.rows.length > 0 ? "Found" : "Not found")

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' })
    }

    const admin = result.rows[0]
    console.log("Admin found:", admin.username)

    // Şifre kontrolü
    const isValidPassword = await verifyPassword(password, admin.password)
    console.log("Password valid:", isValidPassword)
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' })
    }

    // JWT token oluştur
    const payload: AdminPayload = {
      id: admin.id,
      email: admin.email,
      role: 'admin',
      username: admin.username,
    }

    const token = createToken(payload)
    console.log("Token created successfully")
    
    // HttpOnly cookie ayarla
    setAuthCookie(res, token)
    console.log("Cookie set successfully")

    // Başarılı yanıt (şifre olmadan)
    const responseData = {
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    }
    
    console.log("Sending response:", responseData)
    return res.status(200).json(responseData)
  } catch (error) {
    console.error('Admin login error:', error)
    return res.status(500).json({ error: 'Sunucu hatası' })
  }
}
