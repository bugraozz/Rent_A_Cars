import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/lib/db'
import { getUserFromRequest, requireAdmin } from '@/lib/auth'

interface ContactMessage {
  id: number;
  email: string;
  subject: string;
  admin_response?: string;
  status: string;
}

// Kullanıcıya bildirim gönderen yardımcı fonksiyon
async function sendNotificationToUser(contactMessage: ContactMessage) {
  try {
    // Kullanıcının sistemde kayıtlı olup olmadığını kontrol et
    const userCheck = await pool.query(
      'SELECT id, first_name, last_name FROM customers WHERE email = $1',
      [contactMessage.email]
    )

    if (userCheck.rows.length > 0) {
      const customer = userCheck.rows[0]
      
      // Kullanıcıya bildirim gönder
      await pool.query(
        `INSERT INTO notifications 
         (user_id, title, message, type, related_id, related_type, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
          customer.id,
          'İletişim Mesajınıza Yanıt Verildi',
          `Merhaba ${customer.first_name}, "${contactMessage.subject}" konulu mesajınıza yanıt verildi. Yanıt: "${contactMessage.admin_response}"`,
          'contact_response',
          contactMessage.id,
          'contact_message'
        ]
      )

      console.log(`Bildirim gönderildi: ${customer.first_name} ${customer.last_name} (${contactMessage.email})`)
    } else {
      console.log(`Kullanıcı sistemde kayıtlı değil: ${contactMessage.email}`)
    }
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error)
    // Bildirim hatası ana işlemi etkilemez
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin authentication
  const user = getUserFromRequest(req)
  if (!requireAdmin(user)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access'
    })
  }

  if (req.method === 'GET') {
    try {
      const { status, page = 1, limit = 10 } = req.query
      const offset = (Number(page) - 1) * Number(limit)

      let query = `
        SELECT 
          cm.*,
          a.username as responded_by_name
        FROM contact_messages cm
        LEFT JOIN admins a ON cm.responded_by = a.id
      `
      const queryParams: (string | number)[] = []
      let paramCount = 0

      if (status && status !== 'all' && typeof status === 'string') {
        paramCount++
        query += ` WHERE cm.status = $${paramCount}`
        queryParams.push(status)
      }

      query += ` ORDER BY cm.created_at DESC`
      
      paramCount++
      query += ` LIMIT $${paramCount}`
      queryParams.push(Number(limit))
      
      paramCount++
      query += ` OFFSET $${paramCount}`
      queryParams.push(offset)

      const result = await pool.query(query, queryParams)

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM contact_messages'
      const countParams: (string | number)[] = []
      
      if (status && status !== 'all' && typeof status === 'string') {
        countQuery += ' WHERE status = $1'
        countParams.push(status)
      }

      const countResult = await pool.query(countQuery, countParams)
      const total = parseInt(countResult.rows[0].count)

      return res.status(200).json({
        success: true,
        messages: result.rows,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      })

    } catch (error) {
      console.error('Get contact messages error:', error)
      return res.status(500).json({
        success: false,
        error: 'Mesajlar alınırken hata oluştu'
      })
    }
  } 
  else if (req.method === 'PUT') {
    try {
      const { messageId, status, adminResponse } = req.body

      if (!messageId) {
        return res.status(400).json({
          success: false,
          error: 'Message ID is required'
        })
      }

      const updateFields: string[] = []
      const updateValues: (string | number)[] = []
      let paramCount = 0

      if (status) {
        paramCount++
        updateFields.push(`status = $${paramCount}`)
        updateValues.push(status)
      }

      if (adminResponse) {
        paramCount++
        updateFields.push(`admin_response = $${paramCount}`)
        updateValues.push(adminResponse)
        
        paramCount++
        updateFields.push(`responded_by = $${paramCount}`)
        updateValues.push(user.id)
        
        updateFields.push(`responded_at = CURRENT_TIMESTAMP`)
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

      paramCount++
      updateValues.push(messageId)

      const updateQuery = `
        UPDATE contact_messages 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `

      const result = await pool.query(updateQuery, updateValues)

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Mesaj bulunamadı'
        })
      }

      // Eğer admin yanıt verdiyse ve kullanıcı sistemde kayıtlıysa bildirim gönder
      if (adminResponse) {
        await sendNotificationToUser(result.rows[0])
      }

      return res.status(200).json({
        success: true,
        message: 'Mesaj güncellendi',
        data: result.rows[0]
      })

    } catch (error) {
      console.error('Update contact message error:', error)
      return res.status(500).json({
        success: false,
        error: 'Mesaj güncellenirken hata oluştu'
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
