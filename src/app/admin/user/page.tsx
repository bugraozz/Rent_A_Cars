



"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: number
  first_name: string
  last_name: string
  phone: string
  date_of_birth: string
  city: string
  email: string
  license_number: string
  license_issue_date: string
  address: string
  country: string
}

interface ColumnVisibility {
  phone: boolean
  date_of_birth: boolean
  city: boolean
  email: boolean
  license_number: boolean
  license_issue_date: boolean
  address: boolean
  country: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    phone: true,
    date_of_birth: true,
    city: true,
    email: true,
    license_number: false,
    license_issue_date: false,
    address: false,
    country: false,
  })

  // Tarih formatlama yardımcı fonksiyonu
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    } catch (error) {
      console.error("Tarih formatlama hatası:", error)
      return "Geçersiz Tarih"
    }
  }

  // Kullanıcıları veritabanından çekme
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) throw new Error("Kullanıcılar yüklenirken bir hata oluştu.")
      const json = await response.json()
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data)
      } else {
        setUsers([])
      }
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const deleteUser = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/users`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "API hatası")
      }
      const deletedUser = await response.json()
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deletedUser.user.id))
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id))
    } catch (error) {
      console.error("Hata:", error instanceof Error ? error.message : error)
    }
  }


  useEffect(() => {
    fetchUsers()
  }, [])

  // Sadece müşteri (customer) alanları tam olanları göster
  const validUsers = users.filter(
    (user) =>
      user.first_name &&
      user.last_name &&
      user.email &&
      user.phone !== undefined &&
      user.date_of_birth !== undefined &&
      user.city !== undefined &&
      user.license_number !== undefined &&
      user.license_issue_date !== undefined &&
      user.address !== undefined &&
      user.country !== undefined
  )

  const filteredUsers = validUsers.filter((user) => {
    const matchesSearch =
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const getColumnLabel = (column: keyof ColumnVisibility): string => {
    const labels = {
      phone: "Telefon",
      date_of_birth: "Doğum Tarihi",
      city: "Şehir",
      email: "Email",
      license_number: "Ehliyet No",
      license_issue_date: "Ehliyet Veriliş Tarihi",
      address: "Adres",
      country: "Ülke",
    }
    return labels[column]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={64} className="animate-spin text-blue-400" />
          <div className="text-white text-lg">Kullanıcılar yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    < div className = " min-h-screen px-4 py-8 text-white  bg-gradient-to-b from-blue-950 to-black"  >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 w-80"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 w-48">
                {Object.entries(columnVisibility).map(([column, isVisible]) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    className="text-white hover:bg-orange-700"
                    checked={isVisible}
                    onCheckedChange={() => toggleColumnVisibility(column as keyof ColumnVisibility)}
                  >
                    {getColumnLabel(column as keyof ColumnVisibility)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
           
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400">Total {filteredUsers.length} users</p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Rows per page:</span>
            <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
              <SelectTrigger className="w-16 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-orange-800/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-gray-300 font-medium">AD SOYAD</TableHead>
                {columnVisibility.phone && <TableHead className="text-gray-300 font-medium">TELEFON</TableHead>}
                {columnVisibility.date_of_birth && (
                  <TableHead className="text-gray-300 font-medium">DOĞUM TARİHİ</TableHead>
                )}
                {columnVisibility.city && <TableHead className="text-gray-300 font-medium">ŞEHİR</TableHead>}
                {columnVisibility.email && <TableHead className="text-gray-300 font-medium">EMAIL</TableHead>}
                {columnVisibility.license_number && <TableHead className="text-gray-300 font-medium">EHLİYET NO</TableHead>}
                {columnVisibility.license_issue_date && (
                  <TableHead className="text-gray-300 font-medium">EHLİYET TARİHİ</TableHead>
                )}
                {columnVisibility.address && <TableHead className="text-gray-300 font-medium">ADRES</TableHead>}
                {columnVisibility.country && <TableHead className="text-gray-300 font-medium">ÜLKE</TableHead>}
                <TableHead className="text-gray-300 font-medium">İŞLEMLER</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-800 hover:bg-orange-700">
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-700 text-white text-sm">
                          {user.first_name[0]}
                          {user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">
                          {user.first_name} {user.last_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {columnVisibility.phone && (
                    <TableCell className="text-gray-300">{user.phone}</TableCell>
                  )}
                  {columnVisibility.date_of_birth && (
                    <TableCell className="text-gray-300">{formatDate(user.date_of_birth)}</TableCell>
                  )}
                  {columnVisibility.city && <TableCell className="text-gray-300">{user.city}</TableCell>}
                  {columnVisibility.email && <TableCell className="text-gray-300">{user.email}</TableCell>}
                  {columnVisibility.license_number && (
                    <TableCell className="text-gray-300">{user.license_number}</TableCell>
                  )}
                  {columnVisibility.license_issue_date && (
                    <TableCell className="text-gray-300">{formatDate(user.license_issue_date)}</TableCell>
                  )}
                  {columnVisibility.address && (
                    <TableCell className="text-gray-300" title={user.address}>
                      {user.address.length > 30 ? `${user.address.substring(0, 30)}...` : user.address}
                    </TableCell>
                  )}
                  {columnVisibility.country && <TableCell className="text-gray-300">{user.country}</TableCell>}



                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-black">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-gray-700">
                        <DropdownMenuItem className="text-white hover:bg-gray-700">Düzenle</DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-gray-700">
                          Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-800 hover:bg-gray-700"
                          onClick={() => deleteUser(user.id)}
                        >
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            {selectedUsers.length} of {paginatedUsers.length} selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                }
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
