import { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

// Basit bir bakım modu örneği (veritabanında bir ayar tablosu olmalı)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = getUserFromRequest(req)
    if (!requireAuth(user)) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
    const { enabled } = req.body
    // Varsayalım ki bir settings tablosu var: key/value
    await db.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [
      'maintenance_mode', enabled ? 'true' : 'false'
    ])
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Maintenance mode error:', error)
    return res.status(500).json({ success: false, error: 'Sunucu hatası' })
  }
}
