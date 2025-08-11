import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm() {
  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-white text-2xl">Şifre Sıfırlama</CardTitle>
          <p className="text-gray-400">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label className="text-gray-300 mb-2 block">E-posta</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                type="email"
                placeholder="ornek@email.com"
                className="pl-12 bg-gray-800 border-gray-700 text-white focus:border-orange-500 h-12"
              />
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold">
            Sıfırlama Bağlantısı Gönder
          </Button>

          <div className="flex items-center justify-center space-x-2 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 text-sm">Güvenli şifre sıfırlama</span>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-orange-500 hover:text-orange-400 font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Giriş sayfasına dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
