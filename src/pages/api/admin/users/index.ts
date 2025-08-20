import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
      return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error('User listing error:', error instanceof Error ? error.message : error);
      return res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        id,
        first_name,
        last_name,
        phone,
        gender,
        date_of_birth,
        city,
        email
      } = req.body;

      if (!id) return res.status(400).json({ message: 'ID zorunludur' });

      const query = `
        UPDATE customers
        SET
          first_name = $1,
          last_name = $2,
          phone = $3,
          gender = $4,
          date_of_birth = $5,
          city = $6,
          email = $7
        WHERE id = $8
        RETURNING *
      `;

      const result = await db.query(query, [
        first_name,
        last_name,
        phone,
        gender,
        date_of_birth,
        city,
        email,
        id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      return res.status(200).json({ message: 'Güncelleme başarılı', user: result.rows[0] });
    } catch (error) {
      console.error('User update error:', error instanceof Error ? error.message : error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) return res.status(400).json({ message: 'ID zorunludur' });

      const result = await db.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      return res.status(200).json({ message: 'Kullanıcı silindi', user: result.rows[0] });
    } catch (error) {
      console.error('Silme hatası:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
