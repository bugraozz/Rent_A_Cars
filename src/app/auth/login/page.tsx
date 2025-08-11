import { ModernHeader } from "@/components/modern-header"
import { ModernFooter } from "@/components/modern-footer"
import { LoginForm } from "@/components/login-form"
import { AuthHero } from "@/components/auth-hero"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <ModernHeader />
      <AuthHero title="GİRİŞ YAP" subtitle="Premium araç kiralama deneyiminize devam edin" badge="Hoş Geldiniz" />
      <div className="container mx-auto px-6 py-16">
        <LoginForm />
      </div>
      <ModernFooter />
    </div>
  )
}
