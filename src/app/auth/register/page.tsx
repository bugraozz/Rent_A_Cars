import { ModernHeader } from "@/components/modern-header"
import { ModernFooter } from "@/components/modern-footer"
import { RegisterForm } from "@/components/register-form"
import { AuthHero } from "@/components/auth-hero"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <ModernHeader />
      <AuthHero title="KAYIT OL" subtitle="Premium araç kiralama dünyasına katılın" badge="Yeni Üyelik" />
      <div className="container mx-auto px-6 py-16">
        <RegisterForm />
      </div>
      <ModernFooter />
    </div>
  )
}
