import { Badge } from "@/components/ui/badge"
import { HelpCircle } from "lucide-react"

export function FaqHero() {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-b from-blue-950 to-black">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-10" />
      <div className="relative container mx-auto px-6 text-center">
        <Badge className="mb-6 bg-gradient-to-r from-orange-600 to-orange-800 text-white border-0 px-4 py-2">
          <HelpCircle className="w-4 h-4 mr-2" />
          Sıkça Sorulan Sorular
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black mb-6">
          <span className="block text-white">MERAK</span>
          <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            ETTİKLERİNİZ
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Araç kiralama süreciniz hakkında en çok merak edilen sorular ve cevapları burada.
        </p>
      </div>
    </section>
  )
}
