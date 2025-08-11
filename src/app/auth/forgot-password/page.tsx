import { ModernHeader } from "@/components/modern-header"
import { ModernFooter } from "@/components/modern-footer"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { AuthHero } from "@/components/auth-hero"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <ModernHeader />
      <AuthHero
        title="ŞİFRE SIFIRLA"
        subtitle="Şifrenizi sıfırlamak için e-posta adresinizi girin"
        badge="Şifre Kurtarma"
      />
      <div className="container mx-auto px-6 py-16">
        <ForgotPasswordForm />
      </div>
      <ModernFooter />
    </div>
  )
}
