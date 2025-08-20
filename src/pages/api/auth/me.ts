import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest, UserPayload, AdminPayload } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = getUserFromRequest(req)

    if (!user) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' })
    }

    // Kullanıcı bilgilerini döndür (şifre olmadan)
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ...(user.role === 'admin'
          ? { username: (user as AdminPayload).username }
          : {
              first_name: (user as UserPayload).first_name,
              last_name: (user as UserPayload).last_name
            }
        ),
      },
    })
  } catch (error) {
    console.error('Me API error:', error)
    return res.status(500).json({ error: 'Sunucu hatası' })
  }
}
