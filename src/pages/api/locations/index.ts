import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

// Public endpoint: list active locations for selection in UI (no auth)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { search } = req.query
    const params: any[] = []
    let pc = 0
    let query = `SELECT id, name, city, address, phone, is_active
                 FROM locations
                 WHERE is_active = true`

    if (search && typeof search === 'string') {
      pc++
      params.push(`%${search}%`)
      query += ` AND (name ILIKE $${pc} OR city ILIKE $${pc} OR address ILIKE $${pc})`
    }

    query += ' ORDER BY city ASC, name ASC'
    const result = await db.query(query, params)
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Public locations list error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
