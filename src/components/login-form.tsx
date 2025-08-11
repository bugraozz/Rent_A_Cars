"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, Lock, Eye, EyeOff, Car, Shield, Clock } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })
  const router = useRouter()
  const { login, user } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error("Email ve şifre alanları zorunludur")
      return
    }

    console.log("Form submit started")
    setLoading(true)

    try {
      console.log("Calling AuthContext login...")
      const success = await login(formData.email, formData.password)
      console.log("Login result:", success)
      
      if (!success) {
        console.log("Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setLoading(false)
      console.log("Form submit completed")
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Login Form */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Car className="h-8 w-8 text-orange-500" />
              <span className="font-bold text-2xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                DRIVE
              </span>
            </div>
            <CardTitle className="text-white text-2xl">Hesabınıza Giriş Yapın</CardTitle>
            <p className="text-gray-400">Premium araç kiralama deneyiminize devam edin</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300 mb-2 block">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Şifrenizi girin"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 pr-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    name="remember"
                    checked={formData.remember}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, remember: !!checked }))}
                    className="border-gray-600 data-[state=checked]:bg-orange-500" 
                  />
                  <Label htmlFor="remember" className="text-gray-300 text-sm cursor-pointer">
                    Beni hatırla
                  </Label>
                </div>
                <Link href="/auth/forgot-password" className="text-orange-500 hover:text-orange-400 text-sm">
                  Şifremi unuttum
                </Link>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            <div className="relative">
              <Separator className="bg-gray-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-gray-900 px-4 text-gray-400 text-sm">veya</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent h-12">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent h-12">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center">
              <p className="text-gray-400">
                Hesabınız yok mu?{" "}
                <Link href="/auth/register" className="text-orange-500 hover:text-orange-400 font-semibold">
                  Kayıt olun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="space-y-8">
          <div>
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2">
              Üyelik Avantajları
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-6">
              Premium <span className="text-orange-500">Deneyim</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              DRIVE üyesi olarak size özel avantajlardan yararlanın ve premium araç kiralama deneyimini yaşayın.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Özel İndirimler</h3>
                <p className="text-gray-400">Üyelere özel %20'ye varan indirimler ve kampanyalar</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Öncelikli Hizmet</h3>
                <p className="text-gray-400">VIP müşteri desteği ve öncelikli rezervasyon hakkı</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Hızlı İşlemler</h3>
                <p className="text-gray-400">Kayıtlı bilgilerle tek tıkla rezervasyon</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
            <h3 className="text-xl font-bold text-white mb-2">İlk Kiralama %25 İndirim!</h3>
            <p className="text-gray-300">Yeni üyelerimize özel ilk kiralama deneyiminde %25 indirim fırsatı.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
