import { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth, hashPassword, verifyPassword } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = getUserFromRequest(req)
    if (!requireAuth(user)) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Tüm alanlar zorunlu' })
    }
    // Kullanıcıyı bul
    const result = await db.query('SELECT id, password FROM admins WHERE id = $1', [user.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' })
    }
    const admin = result.rows[0]
    // Mevcut şifreyi doğrula
    const valid = await verifyPassword(currentPassword, admin.password)
    if (!valid) {
      return res.status(400).json({ success: false, error: 'Mevcut şifre yanlış' })
    }
    // Yeni şifreyi hashle ve güncelle
    const hashed = await hashPassword(newPassword)
    await db.query('UPDATE admins SET password = $1 WHERE id = $2', [hashed, user.id])
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Admin password change error:', error)
    return res.status(500).json({ success: false, error: 'Sunucu hatası' })
  }
}
