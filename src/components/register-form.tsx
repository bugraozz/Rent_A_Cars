"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Lock, Eye, EyeOff, Phone, Calendar, Car, Gift, Star, Crown } from "lucide-react"
import Link from "next/link"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [first_name, setFirstName] = useState("")
  const [last_name, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [license_number, setLicenseNumber] = useState("")
  const [license_issue_date, setLicenseIssueDate] = useState("")
  const [date_of_birth, setBirthDate] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [confirm_Password, setConfirmPassword] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    
    // Form validasyonu
    if (!first_name || !last_name || !email || !phone || !license_number || !license_issue_date|| !city || !password || !confirm_Password) {
      setErrorMessage("Zorunlu alanları doldurun")
      return
    }

    if (password !== confirm_Password) {
      setErrorMessage("Şifreler uyuşmuyor")
      return
    }

    if (!termsAccepted) {
      setErrorMessage("Kullanım şartlarını kabul etmelisiniz")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          city,
          address,
          country,
          license_number,
          license_issue_date,
          password,
          confirm_password: confirm_Password
        })
      })

      const data = await response.text()
      
      if (!response.ok) {
        setErrorMessage(data || "Kayıt sırasında bir hata oluştu")
        return
      }

      setSuccessMessage("Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.")
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setBirthDate("")
      setCity("")
      setAddress("")
      setCountry("")
      setLicenseNumber("")
      setLicenseIssueDate("")
      setPassword("")
      setConfirmPassword("")
      setTermsAccepted(false)

    } catch (error) {
      console.error("Kayıt sırasında hata:", error)
      setErrorMessage("Sunucu hatası oluştu, lütfen tekrar deneyin")
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Register Form */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Car className="h-8 w-8 text-orange-500" />
              <span className="font-bold text-2xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                DRIVE
              </span>
            </div>
            <CardTitle className="text-white text-2xl">Hesap Oluşturun</CardTitle>
            <p className="text-gray-400">Premium araç kiralama dünyasına katılın</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Hata Mesajı */}
            {errorMessage && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Başarı Mesajı */}
            {successMessage && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Ad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                  <Input
                    placeholder="Adınız"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Soyad</Label>
                <Input
                  placeholder="Soyadınız"
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  type="tel"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Doğum Tarihi</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  type="date"
                  value={date_of_birth}
                  onChange={(e) => setBirthDate(e.target.value)} 
                  className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Adres</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adresinizi girin"
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Ülke</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ülkenizi girin"
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Ehliyet Numarası</Label>
              <Input
                value={license_number}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="Ehliyet numaranızı girin"
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Ehliyet Veriliş Tarihi</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  type="date"
                  value={license_issue_date}
                  onChange={(e) => setLicenseIssueDate(e.target.value)}
                  className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                />
              </div>
            </div>


            <div>
              <Label className="text-gray-300 mb-2 block">Şehir</Label>
              <Select
                value={city}
                onValueChange={(value) => setCity(value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12">
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="istanbul">İstanbul</SelectItem>
                  <SelectItem value="ankara">Ankara</SelectItem>
                  <SelectItem value="izmir">İzmir</SelectItem>
                  <SelectItem value="antalya">Antalya</SelectItem>
                  <SelectItem value="bursa">Bursa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Güçlü bir şifre oluşturun"
                  className="pl-12 pr-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
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

            <div>
              <Label className="text-gray-300 mb-2 block">Şifre Tekrar</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  value={confirm_Password}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Şifrenizi tekrar girin"
                  className="pl-12 pr-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms" 
                  className="border-gray-600 data-[state=checked]:bg-orange-500 mt-1"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-gray-300 text-sm cursor-pointer leading-relaxed">
                  <Link href="/terms" className="text-orange-500 hover:text-orange-400">
                    Kullanım Şartları
                  </Link>{" "}
                  ve{" "}
                  <Link href="/privacy" className="text-orange-500 hover:text-orange-400">
                    Gizlilik Politikası
                  </Link>
                  'nı okudum ve kabul ediyorum.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox id="marketing" className="border-gray-600 data-[state=checked]:bg-orange-500 mt-1" />
                <Label htmlFor="marketing" className="text-gray-300 text-sm cursor-pointer leading-relaxed">
                  Kampanya ve özel tekliflerden haberdar olmak istiyorum.
                </Label>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
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
                Zaten hesabınız var mı?{" "}
                <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-semibold">
                  Giriş yapın
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Package */}
        <div className="space-y-8">
          <div>
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2">
              Hoş Geldin Paketi
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-6">
              Premium <span className="text-orange-500">Üyelik</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              DRIVE ailesine katıldığınız için teşekkürler! Size özel hazırladığımız hoş geldin avantajları.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">%25 Hoş Geldin İndirimi</h3>
                <p className="text-gray-300">İlk kiralama deneyiminizde geçerli özel indirim</p>
                <Badge className="mt-2 bg-green-500 text-white text-xs">Aktif</Badge>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">VIP Müşteri Statüsü</h3>
                <p className="text-gray-400">Öncelikli destek ve özel kampanyalar</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Premium Araç Erişimi</h3>
                <p className="text-gray-400">Tüm lüks araç kategorilerine erişim</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">Üyelik Avantajları</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Ücretsiz araç teslim ve alma hizmeti</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>7/24 premium müşteri desteği</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Esnek iptal ve değişiklik politikası</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Sadakat puanları ve ödüller</span>
              </li>
            </ul>
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl border border-orange-500/10">
            <h4 className="text-white font-semibold mb-2">Güvenli Kayıt</h4>
            <p className="text-gray-400 text-sm">
              Tüm bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. Gizliliğiniz bizim için önemlidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
