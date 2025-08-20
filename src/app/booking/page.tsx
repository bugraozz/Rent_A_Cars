"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ModernHeader } from "@/components/modern-header"
import { ModernFooter } from "@/components/modern-footer"
import { BookingForm } from "@/components/booking-form"
import { toast } from "sonner"
import type { Car } from "@/types/car"


export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [car, setCar] = useState<Car | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'url' | 'localStorage' | null>(null);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        let carId, startDate, endDate, pickupLocation, pickupLocationId, rentalDays, subtotal, tax, total;
        if (searchParams) {
          carId = searchParams.get('carId');
          startDate = searchParams.get('startDate');
          endDate = searchParams.get('endDate');
          pickupLocation = searchParams.get('pickupLocation');
          rentalDays = searchParams.get('rentalDays');
          pickupLocationId = searchParams.get('pickupLocationId');
          subtotal = searchParams.get('subtotal');
          tax = searchParams.get('tax');
          total = searchParams.get('total');
          if (carId && startDate && endDate) {
            setDataSource('url');
            console.log('🔥 Data loaded from URL params');
          }
        }
        if (!carId || !startDate || !endDate) {
          console.log('Query params\'ta veri yok, localStorage\'dan kontrol ediliyor...');
          const savedBookingData = localStorage.getItem('pendingBooking');
          if (savedBookingData) {
            const parsed = JSON.parse(savedBookingData);
            console.log('localStorage\'dan bulunan veri:', parsed);
            carId = parsed.carId?.toString();
            startDate = parsed.startDate;
            endDate = parsed.endDate;
            pickupLocation = parsed.pickupLocation;
            pickupLocationId = parsed.pickupLocationId?.toString();
            rentalDays = parsed.rentalDays?.toString();
            subtotal = parsed.subtotal?.toString();
            tax = parsed.tax?.toString();
            total = parsed.total?.toString();
            setDataSource('localStorage');
            console.log('🔥 Data loaded from localStorage');
            toast.success('Önceki rezervasyon bilgileriniz yüklendi. Kaldığınız yerden devam edebilirsiniz.');
          }
        } else if (carId && startDate && endDate) {
          console.log('🔥 Updating localStorage with fresh URL data');
          const bookingData = {
            carId: parseInt(carId),
            startDate,
            endDate,
            pickupLocation,
            pickupLocationId: pickupLocationId ? parseInt(pickupLocationId) : undefined,
            rentalDays: parseInt(rentalDays || '0'),
            subtotal: parseFloat(subtotal || '0'),
            tax: parseFloat(tax || '0'),
            total: parseFloat(total || '0'),
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        }
        if (!carId || !startDate || !endDate) {
          toast.error('Rezervasyon bilgileri bulunamadı. Lütfen araç seçimi yapın.');
          router.push('/cars');
          setLoading(false);
          return;
        }
        const response = await fetch("/api/cars", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Araç verisi alınamadı");
        }
        const result = await response.json();
        if (result.success && result.data) {
          const foundCar = result.data.find((c: Car) => c.id === parseInt(carId));
          if (foundCar) {
            const completeCar: Car = {
              ...foundCar,
              available_from: foundCar.available_from || new Date().toISOString(),
              min_driver_age: foundCar.min_driver_age || 18,
              min_license_years: foundCar.min_license_years || 1,
              requires_credit_card: foundCar.requires_credit_card ?? true,
              requires_deposit: foundCar.requires_deposit ?? true,
              created_at: foundCar.created_at || new Date().toISOString(),
            };
            setCar(completeCar);
            setBookingData({
              startDate,
              endDate,
              pickupLocation,
              pickupLocationId: pickupLocationId ? parseInt(pickupLocationId) : undefined,
              rentalDays: parseInt(rentalDays || '0'),
              subtotal: parseFloat(subtotal || '0'),
              tax: parseFloat(tax || '0'),
              total: parseFloat(total || '0'),
            });
          } else {
            toast.error("Araç bulunamadı");
            router.push('/cars');
          }
        }
      } catch (error) {
        console.error("Booking data loading error:", error);
        toast.error("Rezervasyon bilgileri yüklenemedi");
        router.push('/cars');
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <div className="text-white text-lg">Rezervasyon bilgileri yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!car || !bookingData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Rezervasyon bilgileri bulunamadı</h2>
          <p className="text-gray-400 mb-8">Lütfen araç sayfasından tekrar deneyin.</p>
          <button
            onClick={() => router.push('/cars')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            Araçlar Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ModernHeader />
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Rezervasyon Tamamla</h1>
            <p className="text-gray-400">
              {car.brand} {car.model} • {new Date(bookingData.startDate).toLocaleDateString('tr-TR')} - {new Date(bookingData.endDate).toLocaleDateString('tr-TR')}
            </p>
            {dataSource === 'localStorage' && (
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  ✨ Daha önce yarıda bıraktığınız rezervasyon bilgileri otomatik olarak yüklendi.
                </p>
              </div>
            )}
          </div>

          {/* Booking Form with Pre-filled Data */}
          <BookingFormWithData car={car} bookingData={bookingData} />
        </div>
      </div>
      <ModernFooter />
    </div>
  );
}



// BookingForm wrapper with pre-filled data

type BookingData = {
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  pickupLocationId?: number;
  rentalDays: number;
  subtotal: number;
  tax: number;
  total: number;
};

function BookingFormWithData({ car, bookingData }: { car: Car; bookingData: BookingData }) {
  return <BookingForm car={car} initialData={bookingData} />;
}
