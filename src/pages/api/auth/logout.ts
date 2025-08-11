import type { NextApiRequest, NextApiResponse } from 'next'
import { clearAuthCookie } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Auth cookie'sini temizle
    clearAuthCookie(res)

    return res.status(200).json({
      success: true,
      message: 'Başarıyla çıkış yapıldı',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ error: 'Sunucu hatası' })
  }
}
