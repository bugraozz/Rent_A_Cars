import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/lib/db'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Kullanıcı kimlik doğrulaması
  const user = getUserFromRequest(req)
  if (!requireAuth(user)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access'
    })
  }

  if (req.method === 'GET') {
    try {
      const { limit = 10, unreadOnly = 'false' } = req.query

      let query = `
        SELECT * FROM notifications 
        WHERE user_id = $1
      `
      let queryParams = [user.id]

      if (unreadOnly === 'true') {
        query += ' AND is_read = FALSE'
      }

      query += ' ORDER BY created_at DESC'
      
      if (limit !== 'all') {
        query += ` LIMIT $${queryParams.length + 1}`
        queryParams.push(Number(limit))
      }

      const result = await pool.query(query, queryParams)

      // Okunmamış bildirim sayısını da al
      const unreadCount = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
        [user.id]
      )

      return res.status(200).json({
        success: true,
        notifications: result.rows,
        unreadCount: parseInt(unreadCount.rows[0].count)
      })

    } catch (error) {
      console.error('Get notifications error:', error)
      return res.status(500).json({
        success: false,
        error: 'Bildirimler alınırken hata oluştu'
      })
    }
  }
  else if (req.method === 'PUT') {
    try {
      const { notificationId, markAsRead } = req.body

      if (markAsRead && notificationId) {
        // Tek bildirimi okundu olarak işaretle
        await pool.query(
          'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
          [notificationId, user.id]
        )
      } else if (markAsRead === 'all') {
        // Tüm bildirimleri okundu olarak işaretle
        await pool.query(
          'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
          [user.id]
        )
      }

      return res.status(200).json({
        success: true,
        message: 'Bildirimler güncellendi'
      })

    } catch (error) {
      console.error('Update notifications error:', error)
      return res.status(500).json({
        success: false,
        error: 'Bildirimler güncellenirken hata oluştu'
      })
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }
}
