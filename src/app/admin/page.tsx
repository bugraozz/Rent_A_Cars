"use client"

import React, { useState, useEffect } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeReservations, setActiveReservations] = useState(0);
  const [totalCars, setTotalCars] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Kullanıcı verilerini al
        const userData = await getUserData();
        if (userData && Array.isArray(userData)) {
          setTotalUsers(userData.length);
        }

        // Aktif rezervasyon verilerini al
        const reservationData = await getActiveReservations();
        if (reservationData) {
          setActiveReservations(reservationData);
        }

        // Toplam araç verilerini al
        const carData = await getTotalCars();
        if (carData) {
          setTotalCars(carData);
        }

        // Okunmamış mesaj verilerini al
        const messageData = await getUnreadMessages();
        if (messageData) {
          setUnreadMessages(messageData);
        }
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getUserData = async () => {
    try {
      const response = await axios.get("/api/admin/users");
      console.log("API Response:", response.data); // Debug için
      // Yeni API: { success, data }
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching user data:", error);
      return [];
    }
  }

  const getActiveReservations = async () => {
    try {
      const response = await axios.get("/api/admin/reservations?status=active");
      console.log("Active Reservations Response:", response.data); // Debug için
      if (response.data.success && response.data.data) {
        return response.data.data.length;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching active reservations:", error);
      return 0;
    }
  }

  const getTotalCars = async () => {
    try {
      const response = await axios.get("/api/cars");
      console.log("Cars Response:", response.data); // Debug için
      if (response.data.success && response.data.data) {
        return response.data.data.length;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching cars data:", error);
      return 0;
    }
  }

  const getUnreadMessages = async () => {
    try {
      const response = await axios.get("/api/admin/messages?status=unread");
      console.log("Unread Messages Response:", response.data); // Debug için
      if (response.data.success && response.data.messages) {
        return response.data.messages.length;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      return 0;
    }
  }

  return (
    <AdminGuard>
      <div className="flex h-screen font-sans bg-gradient-to-br from-[#0a0f2c] via-[#101e38] to-black">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-black via-[#0a0f2c] to-[#1c243b] text-white fixed h-full shadow-xl">
          <div className="p-6 text-2xl font-extrabold tracking-wide">Admin Panel</div>
          <nav className="flex flex-col space-y-2 px-4">
            <a href="#" className="hover:bg-orange-500 transition-all duration-200 px-4 py-2 rounded-lg">Dashboard</a>
            <a href="/admin/cars" className="hover:bg-orange-500 transition-all duration-200 px-4 py-2 rounded-lg">Araçlar</a>
            <a href="/admin/user" className="hover:bg-orange-500 transition-all duration-200 px-4 py-2 rounded-lg">Kullanıcılar</a>
            <a href="/admin/bookings" className="hover:bg-orange-500 transition-all duration-200 px-4 py-2 rounded-lg">Rezervasyonlar</a>
            <a href="/admin/locations" className="hover:bg-orange-500 transition-all duration-200 px-4 py-2 rounded-lg">Lokasyonlar</a>
            <a href="/admin/messages" className="hover:bg-orange-500 transition-all duration-200 px-4 py-2 rounded-lg">İletişim Mesajları</a>
            <a href="/admin/settings" className="hover:bg-orange-500 transition-all duration-200 px-4 py-2 rounded-lg">Ayarlar</a>
          </nav>

          <div className="absolute bottom-0 w-64 p-4">
          
          <Button className="w-full mt-4 bg-gray-200 text-gray-800 hover:bg-gray-300">
            <Link href="/">Siteye Dön</Link>
          </Button>
        </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Top Navbar */}
          <header className="h-16 bg-gradient-to-r from-[#0a0f2c] via-[#141d38] to-black text-white flex items-center justify-between px-8 shadow-md">
            <div className="text-xl font-bold">
              Hoş geldin, {user?.username || 'Admin'}
            </div>
            <button 
              onClick={logout}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow"
            >
              Çıkış
            </button>
          </header>

        {/* Dashboard Cards */}
        <main className="p-8">
          <h1 className="text-3xl font-extrabold text-white mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-[#1f2a48] to-[#131a2c] p-6 rounded-2xl shadow-lg text-white">
              <h2 className="text-lg font-semibold">Toplam Araç</h2>
              <p className="text-4xl font-bold text-orange-500 mt-3">
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  totalCars
                )}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#1f2a48] to-[#131a2c] p-6 rounded-2xl shadow-lg text-white">
              <h2 className="text-lg font-semibold">Aktif Rezervasyon</h2>
              <p className="text-4xl font-bold text-orange-500 mt-3">
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  activeReservations
                )}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#1f2a48] to-[#131a2c] p-6 rounded-2xl shadow-lg text-white">
              <h2 className="text-lg font-semibold">Toplam Kullanıcı</h2>
              <p className="text-4xl font-bold text-orange-500 mt-3">
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  totalUsers
                )}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#1f2a48] to-[#131a2c] p-6 rounded-2xl shadow-lg text-white">
              <h2 className="text-lg font-semibold">Okunmamış Mesaj</h2>
              <p className="text-4xl font-bold text-red-500 mt-3">
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  unreadMessages
                )}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
    </AdminGuard>
  );
}
