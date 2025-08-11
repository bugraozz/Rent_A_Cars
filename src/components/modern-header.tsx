"use client"

import { Car, Menu, X, User, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

export function ModernHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  // Hizmetler linkinin URL'sini belirle
  const getServicesLink = () => {
    // Eğer localStorage'da pending booking varsa booking sayfasına git
    if (typeof window !== 'undefined') {
      const pendingBooking = localStorage.getItem('pendingBooking')
      if (pendingBooking) {
        return '/booking'
      }
    }
    // Yoksa cars sayfasına git
    return '/cars'
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              DRIVE
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-orange-500 transition-colors font-medium">
              Ana Sayfa
            </Link>
            <Link href="/cars" className="text-white hover:text-orange-500 transition-colors font-medium">
              Filo
            </Link>
            <Link href={getServicesLink()} className="text-white hover:text-orange-500 transition-colors font-medium">
              Hizmetler
            </Link>
            <Link href="/contact" className="text-white hover:text-orange-500 transition-colors font-medium">
              İletişim
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-orange-500 hover:text-orange-400 transition-colors font-medium">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role !== 'admin' && (
                  <Link href="/profile" className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors">
                    <User className="h-4 w-4" />
                    <span>
                      {`${user.first_name} ${user.last_name}`}
                    </span>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <div className="flex items-center space-x-2 text-white">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </div>
                )}
                <Button 
                  onClick={logout}
                  variant="ghost" 
                  className="text-white hover:text-orange-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" className="text-white hover:text-orange-500">
                  <Link href="/auth/login" className="text-orange-500 hover:text-orange-600">
                    Giriş Yap
                  </Link>
                </Button>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                  <Link href="/auth/register">
                    Kayıt Ol
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Button variant="ghost" size="sm" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/" className="text-white hover:text-orange-500 transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/cars" className="text-white hover:text-orange-500 transition-colors">
                Filo
              </Link>
              <Link href={getServicesLink()} className="text-white hover:text-orange-500 transition-colors">
                Hizmetler
              </Link>
              <Link href="/contact" className="text-white hover:text-orange-500 transition-colors">
                İletişim
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-orange-500 hover:text-orange-400 transition-colors">
                  Admin Panel
                </Link>
              )}
              {user && user.role !== 'admin' && (
                <Link href="/profile" className="text-white hover:text-orange-500 transition-colors">
                  Profilim
                </Link>
              )}
              {user ? (
                <Button 
                  onClick={logout}
                  variant="ghost" 
                  className="text-white hover:text-orange-500 justify-start px-0"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/auth/login" className="text-orange-500 hover:text-orange-600">
                    Giriş Yap
                  </Link>
                  <Link href="/auth/register" className="text-white hover:text-orange-500">
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
