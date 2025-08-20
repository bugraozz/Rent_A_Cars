import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST desteklenir' });
  }

  try {
    const {
      first_name,
      last_name,
      phone,
      date_of_birth,
      license_number,
      license_issue_date,
      address,
      city,
      country,
      email,
      password,
      confirm_password,
    } = req.body;

    // Tüm alanlar zorunlu
    if (
      !first_name || !last_name || !phone || !license_number ||
      !license_issue_date || !address || !country ||
      !date_of_birth || !city || !email || !password || !confirm_password
    ) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Şifreler uyuşmuyor' });
    }

    

    // Email & telefon unique kontrolü
    const check = await db.query(
      'SELECT 1 FROM customers WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (check.rows.length > 0) {
      return res.status(409).json({ message: 'Email veya telefon zaten kayıtlı' });
    }

    // Şifre hashle
    const hashedPassword = await hashPassword(password);

    // Kullanıcıyı ekle
    const result = await db.query(
      `INSERT INTO customers 
        (first_name, last_name, phone, date_of_birth, license_number, license_issue_date, address, city, country, email, password) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, email, created_at`,
      [
        first_name,
        last_name,
        phone,
        date_of_birth,
        license_number,
        license_issue_date,
        address,
        city,
        country,
        email,
        hashedPassword,
      ]
    );

    return res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Kayıt hatası:', error instanceof Error ? error.message : error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
}
