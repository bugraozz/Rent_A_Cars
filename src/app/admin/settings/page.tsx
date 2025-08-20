"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, ShieldCheck, Wrench } from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  // Şifre değiştirme
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Kullanıcı rolü değiştirme
  type User = { id: string; name?: string; first_name?: string; last_name?: string; email: string; role: string };
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [roleLoading, setRoleLoading] = useState(false)

  // Bakım modu
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceLoading, setMaintenanceLoading] = useState(false)

  // Kullanıcıları yükle
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const json = await res.json()
      if (json.success) setUsers(json.data)
    } catch {}
  }

  // Bakım modunu API'den çek
  const fetchMaintenance = async () => {
    try {
      const res = await fetch("/api/settings/maintenance", { cache: "no-store" })
      const json = await res.json()
      setMaintenanceMode(!!json.enabled)
    } catch {
      setMaintenanceMode(false)
    }
  }

  // İlk açılışta kullanıcıları ve bakım modunu getir
  React.useEffect(() => {
    fetchUsers()
    fetchMaintenance()
  }, [])

  // Şifre değiştirme
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Tüm alanları doldurun")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor")
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Şifre başarıyla değiştirildi")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(json.error || "Şifre değiştirilemedi")
      }
    } catch {
      toast.error("Sunucu hatası")
    } finally {
      setPasswordLoading(false)
    }
  }

  // Rol değiştirme
  const handleChangeRole = async () => {
    if (!selectedUserId) {
      toast.error("Kullanıcı seçin")
      return
    }
    setRoleLoading(true)
    try {
      const res = await fetch("/api/admin/settings/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, role: "admin" })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Kullanıcı admin yapıldı")
        fetchUsers()
      } else {
        toast.error(json.error || "Rol değiştirilemedi")
      }
    } catch {
      toast.error("Sunucu hatası")
    } finally {
      setRoleLoading(false)
    }
  }

  // Bakım modunu güncelle
  const handleToggleMaintenance = async () => {
    setMaintenanceLoading(true)
    try {
      const res = await fetch("/api/admin/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !maintenanceMode })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Bakım modu güncellendi")
        // Güncel durumu tekrar çek
        fetchMaintenance()
      } else {
        toast.error(json.error || "Bakım modu değiştirilemedi")
      }
    } catch {
      toast.error("Sunucu hatası")
    } finally {
      setMaintenanceLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-b from-blue-950 to-black text-white flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {/* Şifre Değiştir */}
        <Card className="bg-gray-800 border border-gray-700 rounded-lg">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2"><Lock className="w-6 h-6 text-orange-500" />Şifre Değiştir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <Label className="text-gray-300 mb-2 block">Mevcut Şifre</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500" />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Yeni Şifre</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500" />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Yeni Şifre (Tekrar)</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500" />
              </div>
              <Button type="submit" disabled={passwordLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold disabled:opacity-50">
                {passwordLoading ? "Kaydediliyor..." : "Şifreyi Değiştir"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Kullanıcıyı Admin Yap */}
        <Card className="bg-gray-800 border border-gray-700 rounded-lg">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-orange-500" />Kullanıcıyı Admin Yap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Kullanıcı Seç</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-orange-500">
                  <SelectValue placeholder="Kullanıcı seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {users.map(user => (
                    <SelectItem key={user.id} value={String(user.id)} disabled={user.role === "admin"}
                      className="text-white text-base px-4 py-2 hover:bg-orange-500/20 rounded-lg transition-all">
                      {(user.first_name || user.last_name)
                        ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
                        : user.name} ({user.email}) {user.role === "admin" ? "- Zaten admin" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleChangeRole} disabled={roleLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 text-lg font-semibold disabled:opacity-50">
              {roleLoading ? "Kaydediliyor..." : "Admin Yap"}
            </Button>
          </CardContent>
        </Card>

        {/* Bakım Modu */}
        <Card className="bg-gray-800 border border-gray-700 rounded-lg">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2"><Wrench className="w-6 h-6 text-orange-500" />Bakım Modu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-300 text-lg">Bakım Modu Aktif mi?</span>
              <Button onClick={handleToggleMaintenance} disabled={maintenanceLoading}
                className={
                  (maintenanceMode
                    ? "bg-gradient-to-r from-red-600 to-orange-500"
                    : "bg-gradient-to-r from-gray-700 to-gray-900") +
                  " h-12 px-8 text-white text-lg font-semibold disabled:opacity-50"
                }>
                {maintenanceLoading ? "Kaydediliyor..." : maintenanceMode ? "Kapat" : "Aktif Et"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
