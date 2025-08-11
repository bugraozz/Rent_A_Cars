"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

interface User {
  id: number
  email: string
  role: 'admin' | 'user'
  first_name?: string
  last_name?: string
  phone?: string
  username?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setUser(result.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("AuthContext login called with:", email)
    try {
      // Önce normal kullanıcı girişi dene
      let response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      console.log("User login response status:", response.status)

      if (!response.ok) {
        console.log("User login failed, trying admin login...")
        // Kullanıcı girişi başarısız ise admin girişi dene
        response = await fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        })
        console.log("Admin login response status:", response.status)
      }

      if (response.ok) {
        const result = await response.json()
        console.log("Login successful, user data:", result.user)
        setUser(result.user)
        
        // Giriş başarılı olduğunda toast mesajı göster ve yönlendir
        const userName = result.user.role === 'admin' 
          ? result.user.username 
          : result.user.first_name
        toast.success(`Hoş geldiniz, ${userName}!`)
        
        console.log("User role:", result.user.role)
        
        // Yönlendirme işlemi
        if (result.user.role === 'admin') {
          console.log("Redirecting to admin panel...")
          setTimeout(() => {
            window.location.href = '/admin'
          }, 1500)
        } else {
          console.log("Redirecting to home...")
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        }
        
        return true
      } else {
        const error = await response.json()
        console.log("Login failed with error:", error)
        toast.error(error.error || 'Giriş başarısız')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Giriş sırasında bir hata oluştu')
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      toast.success('Başarıyla çıkış yapıldı')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Çıkış sırasında bir hata oluştu')
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
