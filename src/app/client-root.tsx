"use client"

import { AuthProvider } from "@/context/AuthContext"
import MaintenanceWrapper from "@/components/maintenance-wrapper"
import { Toaster } from "@/components/ui/sonner"

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MaintenanceWrapper>
        {children}
        <Toaster />
      </MaintenanceWrapper>
    </AuthProvider>
  )
}
