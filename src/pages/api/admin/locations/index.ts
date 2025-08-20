import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Admin authentication check
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

  if (req.method === 'GET') {
    try {
      const { search, onlyActive } = req.query
      let query = `SELECT * FROM locations WHERE 1=1`
  const params: (string | boolean)[] = []
      let pc = 0

      if (onlyActive === 'true') {
        query += ` AND is_active = true`
      }

      if (search) {
        pc++
        query += ` AND (name ILIKE $${pc} OR city ILIKE $${pc} OR address ILIKE $${pc})`
        params.push(`%${search}%`)
      }

      query += ` ORDER BY created_at DESC`
      const result = await db.query(query, params)
      return res.status(200).json({ success: true, data: result.rows })
    } catch (error) {
      console.error('Admin locations list error:', error)
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, address, city, phone, is_active = true } = req.body || {}
      if (!name || !address || !city) {
        return res.status(400).json({ success: false, error: 'name, address, and city are required' })
      }

      const insert = `
        INSERT INTO locations (name, address, city, phone, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `
      const values = [name, address, city, phone || null, !!is_active]
      const result = await db.query(insert, values)
      return res.status(201).json({ success: true, data: result.rows[0] })
    } catch (error) {
      console.error('Admin location create error:', error)
      return res.status(500).json({ success: false, error: 'Internal server error' })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
