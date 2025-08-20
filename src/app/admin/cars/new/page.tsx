"use client"

import { useRouter } from "next/navigation"
import CarForm from "@/components/car-form"
import { toast } from "sonner"
import type { Car } from "@/types/car"

export default function NewCarPage() {
  const router = useRouter()
  // Removed useToast, using toast directly from import

  const handleSave = async (carData: Partial<Car>) => {
    try {
      console.log("Sending car data:", carData);
      
      const response = await fetch("/api/admin/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Add credentials
        body: JSON.stringify(carData),
      })

      const result = await response.json();
      console.log("Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Araç eklenirken bir hata oluştu")
      }

     toast.success("İşlem tamamlandı")

      router.push("/admin/cars")
    } catch (error) {
      console.error("Save error:", error);
     toast.error(error instanceof Error ? error.message : "Hata oluştu")
    }
  }

  const handleCancel = () => {
    router.push("/admin/cars")
  }

  return (
    <div>
      <CarForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  )
}



