import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = getUserFromRequest(req)
    if (!requireAuth(user)) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }
  } catch {
    return res.status(401).json({ success: false, error: 'Authentication failed' })
  }

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, error: 'Geçersiz id' })
  }

  if (req.method === 'GET') {
    try {
      const result = await db.query('SELECT * FROM locations WHERE id = $1', [id])
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Location not found' })
      }
      return res.status(200).json({ success: true, data: result.rows[0] })
    } catch (error) {
      console.error('Admin location get error:', error)
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { name, address, city, phone, is_active } = req.body || {}

      // Build dynamic update
  const fields: string[] = []
  const values: (string | boolean)[] = []
      let pc = 1

      if (name !== undefined) { fields.push(`name = $${pc++}`); values.push(name) }
      if (address !== undefined) { fields.push(`address = $${pc++}`); values.push(address) }
      if (city !== undefined) { fields.push(`city = $${pc++}`); values.push(city) }
      if (phone !== undefined) { fields.push(`phone = $${pc++}`); values.push(phone) }
      if (is_active !== undefined) { fields.push(`is_active = $${pc++}`); values.push(!!is_active) }

      if (fields.length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' })
      }

      const query = `UPDATE locations SET ${fields.join(', ')} WHERE id = $${pc} RETURNING *`
      values.push(id)
      const result = await db.query(query, values)

      return res.status(200).json({ success: true, data: result.rows[0] })
    } catch (error) {
      console.error('Admin location update error:', error)
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM locations WHERE id = $1', [id])
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Admin location delete error:', error)
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
