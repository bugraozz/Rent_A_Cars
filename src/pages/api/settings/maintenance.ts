import { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
  try {
    const result = await db.query("SELECT value FROM settings WHERE key = 'maintenance_mode' LIMIT 1")
    const enabled = result.rows.length > 0 && result.rows[0].value === 'true'
    return res.status(200).json({ success: true, enabled })
  } catch {
    return res.status(500).json({ success: false, error: 'Sunucu hatası' })
  }
}
