
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = `
      SELECT 
        category,
        COUNT(*) as count
      FROM cars 
      WHERE status = 'available'
      GROUP BY category
      ORDER BY count DESC, category ASC
    `

    const result = await db.query(query)

    const categories = result.rows.map((row: any) => ({
      name: row.category,
      count: Number.parseInt(row.count),
    }))

    return res.status(200).json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Categories GET error:", error)
    return res.status(500).json({ success: false, error: "Kategoriler getirilemedi" })
  }
}
