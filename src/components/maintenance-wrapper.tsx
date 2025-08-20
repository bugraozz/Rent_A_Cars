"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch("/api/settings/maintenance", { cache: "no-store" })
        const json = await res.json()
        setMaintenance(!!json.enabled)
      } catch {
        setMaintenance(false)
      } finally {
        setLoading(false)
      }
    }
    fetchMaintenance()
  }, [])

  if (loading || authLoading) {
    return null
  }
  // Bakım modunda admin olmayan herkes (her route) bakım ekranı görür
  if (maintenance && user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
        <h1 className="text-4xl font-bold mb-4">Bakım Modu</h1>
        <p className="text-lg">Şu anda sistemde bakım çalışması yapılmaktadır.<br/>Lütfen daha sonra tekrar deneyin.</p>
      </div>
    )
  }
  return <>{children}</>
}
