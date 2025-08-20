import { Car, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ModernFooter() {
  return (
    <footer className="bg-gradient-to-b from-blue-950 to-black">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Car className="h-8 w-8 text-orange-500" />
              <span className="font-bold text-3xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                DRIVE
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Premium araç kiralama deneyimi. Lüks, konfor ve güvenliği bir arada sunan               Türkiye&apos;nin en prestijli araç
              kiralama platformu.
            </p>

            <div className="space-y-4">
              <h4 className="text-white font-semibold">Bülten Aboneliği</h4>
              <div className="flex space-x-2">
                <Input
                  placeholder="E-posta adresiniz"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
                />
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                  Abone Ol
                </Button>
              </div>
            </div>
          </div>

            <div>
            <h3 className="font-bold text-white text-lg mb-6">Hızlı Linkler</h3>
            <ul className="space-y-3">
              <li>
              <Link href="/" className="text-gray-400 hover:text-orange-500 transition-colors">
                Ana Sayfa
              </Link>
              </li>
              <li>
              <Link href="/cars" className="text-gray-400 hover:text-orange-500 transition-colors">
                Araçlar
              </Link>
              </li>
              <li>
              <Link href="/about" className="text-gray-400 hover:text-orange-500 transition-colors">
                Hakkımızda
              </Link>
              </li>
              <li>
              <Link href="/contact" className="text-gray-400 hover:text-orange-500 transition-colors">
                İletişim
              </Link>
              </li>
              <li>
              <Link href="/faq" className="text-gray-400 hover:text-orange-500 transition-colors">
                SSS
              </Link>
              </li>
            </ul>
            </div>

          <div>
            <h3 className="font-bold text-white text-lg mb-6">İletişim</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">+90 850 123 45 67</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">info@drive.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-orange-500" />
                <span className="text-gray-400">İstanbul, Türkiye</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-white font-semibold mb-4">Sosyal Medya</h4>
              <div className="flex space-x-4">
                {[Instagram, Twitter, Facebook].map((Icon, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 transition-all duration-300"
                  >
                    <Icon className="h-5 w-5 text-gray-400 hover:text-white" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 DRIVE. Tüm hakları saklıdır.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
              Kullanım Şartları
            </Link>
            <Link href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
              Çerez Politikası
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
