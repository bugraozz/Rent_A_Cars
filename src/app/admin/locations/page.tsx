"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminGuard } from '@/components/AdminGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import type { Location, LocationCreate } from '@/types/location'

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('')

  // form state
  const [form, setForm] = useState<LocationCreate>({ name: '', address: '', city: '', phone: '', is_active: true })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/locations${qs}`);
      const json = await res.json();
      if (json.success) setLocations(json.data);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        toast.error('Lokasyonlar yüklenemedi: ' + e.message);
      } else {
        toast.error('Lokasyonlar yüklenemedi');
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async () => {
    if (!form.name || !form.address || !form.city) {
      toast.error('Ad, adres ve şehir zorunludur')
      return
    }
    try {
      setSaving(true)
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Lokasyon eklendi')
        setForm({ name: '', address: '', city: '', phone: '', is_active: true })
        load()
      } else {
        toast.error(json.error || 'Kayıt başarısız')
      }
    } catch (e) {
      console.error(e)
      toast.error('Kayıt sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const onToggleActive = async (loc: Location, next: boolean) => {
    try {
      const res = await fetch(`/api/admin/locations/${loc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      })
      const json = await res.json()
      if (json.success) {
        setLocations((prev) => prev.map((l) => (l.id === loc.id ? { ...l, is_active: next } : l)))
      } else {
        toast.error(json.error || 'Güncelleme başarısız')
      }
    } catch (e) {
      console.error(e)
      toast.error('Güncelleme sırasında hata oluştu')
    }
  }

  const onDelete = async (loc: Location) => {
    if (!confirm(`${loc.name} lokasyonunu silmek istediğinize emin misiniz?`)) return
    try {
      const res = await fetch(`/api/admin/locations/${loc.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setLocations((prev) => prev.filter((l) => l.id !== loc.id))
        toast.success('Silindi')
      } else {
        toast.error(json.error || 'Silme başarısız')
      }
    } catch (e) {
      console.error(e)
      toast.error('Silme sırasında hata oluştu')
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) =>
      [l.name, l.city, l.address].some((v) => (v || '').toLowerCase().includes(q))
    )
  }, [locations, search])

  return (
    <AdminGuard>
      <div className="min-h-screen px-4 py-8 text-white bg-gradient-to-b from-blue-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Lokasyon Yönetimi</h1>
              <p className="text-gray-300 mt-2">Bayilerinizi/lokasyonlarınızı ekleyin ve yönetin</p>
            </div>
            <Button onClick={load} className="bg-gray-800 border border-gray-700 text-white hover:bg-gray-700">
              Yenile
            </Button>
          </div>

          {/* Create form */}
          <Card className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Ad</Label>
                  <Input className="bg-gray-900  text-white placeholder-gray-400" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Merkez Şube" />
                </div>
                <div>
                  <Label className="text-white">Şehir</Label>
                  <Input className="bg-gray-900  text-white placeholder-gray-400" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="İstanbul" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-white">Adres</Label>
                  <Input className="bg-gray-900  text-white placeholder-gray-400" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Açık adres" />
                </div>
                <div>
                  <Label className="text-white">Telefon</Label>
                  <Input className="bg-gray-900  text-white placeholder-gray-400" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0(212) 000 00 00" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_active"
                    checked={!!form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                  />
                  <Label htmlFor="is_active" className="text-white">Aktif</Label>
                </div>
              </div>
              <Button onClick={onCreate} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                {saving ? 'Kaydediliyor...' : 'Lokasyon Ekle'}
              </Button>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="mb-4">
            <Input className="bg-gray-900 border-gray-600 text-white placeholder-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ara: ad, şehir, adres" />
          </div>

          {/* Table */}
          <Card className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Ad</TableHead>
                    <TableHead className="text-white">Şehir</TableHead>
                    <TableHead className="text-white">Adres</TableHead>
                    <TableHead className="text-white">Telefon</TableHead>
                    <TableHead className="text-white">Durum</TableHead>
                    <TableHead className="text-white text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-400">Yükleniyor...</TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-400">Kayıt bulunamadı</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell className="font-medium">{loc.name}</TableCell>
                        <TableCell>{loc.city}</TableCell>
                        <TableCell className="max-w-[320px] truncate">{loc.address}</TableCell>
                        <TableCell>{loc.phone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!!loc.is_active}
                              onCheckedChange={(v) => onToggleActive(loc, v)}
                              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            />
                            <span className={loc.is_active ? 'text-green-400' : 'text-red-400'}>
                              {loc.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button className="bg-red-500 hover:bg-red-600" onClick={() => onDelete(loc)}>
                            Sil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}
