import { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = getUserFromRequest(req)
    if (!requireAuth(user)) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
    const { userId, role } = req.body
    if (!userId || !role) {
      return res.status(400).json({ success: false, error: 'Kullanıcı ve rol zorunlu' })
    }
    // Sadece adminler rol değiştirebilir
    const adminCheck = await db.query('SELECT id, role FROM admins WHERE id = $1', [user.id])
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Yetkiniz yok' })
    }
    // Kullanıcıyı güncelle
    await db.query('UPDATE admins SET role = $1 WHERE id = $2', [role, userId])
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Admin role change error:', error)
    return res.status(500).json({ success: false, error: 'Sunucu hatası' })
  }
}
