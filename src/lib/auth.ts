import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'
import type { NextApiResponse } from 'next'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production'
const COOKIE_NAME = 'auth-token'

export interface UserPayload {
  id: number
  email: string
  role: 'admin' | 'user'
  first_name: string
  last_name: string
}

export interface AdminPayload {
  id: number
  email: string
  role: 'admin'
  username: string
}

// JWT token oluştur
export function createToken(payload: UserPayload | AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 7 gün
  })
}

// JWT token doğrula
export function verifyToken(token: string): UserPayload | AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload | AdminPayload
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Token verification failed:', error.message)
    }
    return null
  }
}

// Şifre hash'le
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Şifre doğrula
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// HttpOnly cookie ayarla
export function setAuthCookie(res: NextApiResponse, token: string) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
    path: '/',
  })
  
  res.setHeader('Set-Cookie', cookie)
}

// Cookie'yi temizle (logout)
export function clearAuthCookie(res: NextApiResponse) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  
  res.setHeader('Set-Cookie', cookie)
}

// Request'ten token al
interface RequestWithCookies {
  headers: {
    cookie?: string;
  };
}

export function getTokenFromRequest(req: RequestWithCookies): string | null {
  const cookies = req.headers.cookie
  if (!cookies) return null
  
  const tokenCookie = cookies
    .split(';')
    .find((c) => (c as string).trim().startsWith(`${COOKIE_NAME}=`))
  
  if (!tokenCookie) return null
  
  return tokenCookie.split('=')[1]
}

// Request'ten kullanıcı bilgisi al
export function getUserFromRequest(req: RequestWithCookies): UserPayload | AdminPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  
  return verifyToken(token)
}

// Admin yetkisi kontrolü
export function requireAdmin(user: UserPayload | AdminPayload | null): user is AdminPayload {
  return user !== null && user.role === 'admin'
}

// Kullanıcı yetkisi kontrolü
export function requireAuth(user: UserPayload | AdminPayload | null): user is UserPayload | AdminPayload {
  return user !== null
}
