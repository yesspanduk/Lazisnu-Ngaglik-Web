import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, doc, setDoc, getDoc, limit, deleteDoc } from 'firebase/firestore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Donation, DistributionReport, UserProfile, DonationType, AmbulanceReport, Activity } from './types';
import { cn, formatCurrency, getDirectImageUrl, getEmbedUrl } from './lib/utils';
import { Heart, HandHelping, BarChart3, Bell, LogIn, LogOut, CheckCircle2, Loader2, Menu, X, ChevronRight, Wallet, MapPin, Plus, QrCode, Truck, Navigation, Phone, Calendar, Coins, Calculator, Clock, Leaf, Trash2, Video, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants ---
const ADMIN_EMAILS = ['sepandukg@gmail.com', 'upzisnungaglik@gmail.com'];

// --- Components ---

interface WebsiteSettings {
  logoUrl: string;
  koinNuImageUrl: string;
  qrisZakatUrl: string;
  qrisInfaqUrl: string;
  waAdmin1: string;
  waAdmin2: string;
}

const DEFAULT_SETTINGS: WebsiteSettings = {
  logoUrl: 'https://picsum.photos/seed/lazisnu-logo/400/200',
  koinNuImageUrl: 'https://picsum.photos/seed/charity-box/1200/1200',
  qrisZakatUrl: 'https://picsum.photos/seed/qris-zakat/600/800',
  qrisInfaqUrl: 'https://picsum.photos/seed/qris-infaq/600/800',
  waAdmin1: '62895401228646',
  waAdmin2: '6283867497584'
};

const Navbar = ({ user, onLogin, onLogout, settings }: { user: User | null, onLogin: () => void, onLogout: () => void, settings: WebsiteSettings }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [settings.logoUrl]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 flex items-center">
              {imgError ? (
                <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Leaf size={24} />
                </div>
              ) : (
                <img 
                  src={getDirectImageUrl(settings.logoUrl)} 
                  alt="Logo LAZISNU" 
                  className="h-full w-auto object-contain"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-emerald-950 leading-none">LAZISNU</span>
              <span className="text-emerald-600 font-bold text-lg leading-tight">Ngaglik</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-6 flex-nowrap">
            <PrayerTimes compact />
            <a href="#home" className="text-emerald-800 hover:text-emerald-600 font-medium transition-colors text-sm lg:text-base">Beranda</a>
            <a href="#kegiatan" className="text-emerald-800 hover:text-emerald-600 font-medium transition-colors text-sm lg:text-base">Kegiatan</a>
            <a href="#donasi" className="text-emerald-800 hover:text-emerald-600 font-medium transition-colors text-sm lg:text-base">Donasi</a>
            <a href="#laporan" className="text-emerald-800 hover:text-emerald-600 font-medium transition-colors text-sm lg:text-base">Laporan</a>
            <a href="#ambulan" className="text-emerald-800 hover:text-emerald-600 font-medium transition-colors text-sm lg:text-base">Ambulan</a>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-emerald-200" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Heart size={14} />
                    </div>
                  )}
                  {ADMIN_EMAILS.includes(user.email || '') && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Admin</span>
                  )}
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 text-emerald-800 hover:text-red-600 font-medium transition-colors">
                  <LogOut size={18} /> Keluar
                </button>
              </div>
            ) : (
              <button onClick={onLogin} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-full font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 shrink-0 whitespace-nowrap">
                <LogIn size={18} /> Masuk
              </button>
            )}
          </div>

          <button className="md:hidden text-emerald-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-emerald-100 p-4 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="block text-emerald-800 font-medium">Beranda</a>
            <a href="#kegiatan" onClick={() => setIsMenuOpen(false)} className="block text-emerald-800 font-medium">Kegiatan</a>
            <a href="#donasi" onClick={() => setIsMenuOpen(false)} className="block text-emerald-800 font-medium">Donasi</a>
            <a href="#laporan" onClick={() => setIsMenuOpen(false)} className="block text-emerald-800 font-medium">Laporan</a>
            <a href="#ambulan" onClick={() => setIsMenuOpen(false)} className="block text-emerald-800 font-medium">Ambulan</a>
            
            {user ? (
              <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100">
                <LogOut size={18} /> Keluar
              </button>
            ) : (
              <button onClick={() => { onLogin(); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-100">
                <LogIn size={18} /> Masuk ke Akun
              </button>
            )}

            <div className="pt-4 border-t border-emerald-50">
              <PrayerTimes />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const PrayerTimes = ({ compact = false }: { compact?: boolean }) => {
  const [timings, setTimings] = useState<any>(null);
  const [city, setCity] = useState('Sleman');
  const [loading, setLoading] = useState(true);
  const [isAuto, setIsAuto] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<any>(null);

  const determineNextPrayer = (times: any) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'Subuh', time: times.Fajr },
      { name: 'Dzuhur', time: times.Dhuhr },
      { name: 'Ashar', time: times.Asr },
      { name: 'Maghrib', time: times.Maghrib },
      { name: 'Isya', time: times.Isha }
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (prayerMinutes > currentTime) {
        return prayer;
      }
    }
    return prayers[0]; // Default to next day's Subuh
  };

  const fetchPrayerTimes = async (cityName: string) => {
    setLoading(true);
    try {
      // 1. Try MyQuran API (Indonesian specific, very reliable for local cities)
      const searchRes = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(cityName.toLowerCase())}`);
      const searchData = await searchRes.json();
      
      if (searchData.status && searchData.data && searchData.data.length > 0) {
        const cityId = searchData.data[0].id;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        const scheduleRes = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${month}/${day}`);
        const scheduleData = await scheduleRes.json();
        
        if (scheduleData.status && scheduleData.data && scheduleData.data.jadwal) {
          const s = scheduleData.data.jadwal;
          const mappedTimings = {
            Fajr: s.subuh,
            Dhuhr: s.dzuhur,
            Asr: s.ashar,
            Maghrib: s.maghrib,
            Isha: s.isya
          };
          setTimings(mappedTimings);
          setNextPrayer(determineNextPrayer(mappedTimings));
          setLoading(false);
          return;
        }
      }
      
      // 2. Fallback to Aladhan API if MyQuran fails or city not found
      await fetchAladhanPrayerTimes(cityName);
    } catch (error) {
      console.error('Primary prayer API failed, trying Aladhan...', error);
      await fetchAladhanPrayerTimes(cityName);
    } finally {
      setLoading(false);
    }
  };

  const fetchAladhanPrayerTimes = async (cityName: string) => {
    try {
      const encodedCity = encodeURIComponent(cityName);
      const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodedCity}&country=Indonesia&method=11`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.code === 200) {
        setTimings(data.data.timings);
        setNextPrayer(determineNextPrayer(data.data.timings));
      } else {
        throw new Error(data.data || 'Unknown API error');
      }
    } catch (error) {
      console.error('Aladhan API failed, trying Pray.zone...', error);
      await fetchFallbackPrayerTimes(cityName);
    }
  };

  const fetchFallbackPrayerTimes = async (cityName: string) => {
    try {
      // Simple fallback using a different service
      const response = await fetch(`https://api.pray.zone/v2/times/today.json?city=${encodeURIComponent(cityName.toLowerCase())}`);
      const data = await response.json();
      
      if (data.status === 'OK') {
        const times = data.results.datetime[0].times;
        const mappedTimings = {
          Fajr: times.Fajr,
          Dhuhr: times.Dhuhr,
          Asr: times.Asr,
          Maghrib: times.Maghrib,
          Isha: times.Isha
        };
        setTimings(mappedTimings);
        setNextPrayer(determineNextPrayer(mappedTimings));
      }
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
    }
  };

  const fetchByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=11`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.code === 200) {
        setTimings(data.data.timings);
        setNextPrayer(determineNextPrayer(data.data.timings));
        setCity('Lokasi Anda');
      } else {
        throw new Error(data.data || 'Unknown API error');
      }
    } catch (error) {
      console.error('Failed to fetch prayer times by coords, trying fallback city...', error);
      // If GPS fetch fails, fallback to default city (Sleman)
      await fetchPrayerTimes('Sleman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuto) {
      fetchPrayerTimes(city);
    } else {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          fetchByCoords(position.coords.latitude, position.coords.longitude);
        }, (error) => {
          console.error("Geolocation error:", error);
          setIsAuto(false);
          fetchPrayerTimes('Sleman');
        });
      }
    }
  }, [city, isAuto]);

  const prayerIcons: any = {
    Fajr: '🌅',
    Dhuhr: '☀️',
    Asr: '⛅',
    Maghrib: '🌇',
    Isha: '🌙'
  };

  const prayerNames: any = {
    Fajr: 'Subuh',
    Dhuhr: 'Dzuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya'
  };

  if (compact) {
    if (loading || !nextPrayer) return null;
    return (
      <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
        <Clock size={14} className="text-emerald-600" />
        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Berikutnya:</span>
        <span className="text-xs font-black text-emerald-950">{nextPrayer.name} {nextPrayer.time}</span>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-emerald-600" />
          <h3 className="font-bold text-emerald-950">Waktu Shalat</h3>
        </div>
        <div className="flex gap-1 bg-emerald-50 p-1 rounded-lg">
          <button 
            onClick={() => setIsAuto(false)}
            className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-all", !isAuto ? "bg-emerald-600 text-white" : "text-emerald-600")}
          >
            MANUAL
          </button>
          <button 
            onClick={() => setIsAuto(true)}
            className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-all", isAuto ? "bg-emerald-600 text-white" : "text-emerald-600")}
          >
            OTOMATIS
          </button>
        </div>
      </div>

      {!isAuto && (
        <div className="relative mb-4">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <select 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-900 outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="Sleman">Sleman</option>
            <option value="Yogyakarta">Yogyakarta</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Surabaya">Surabaya</option>
            <option value="Bandung">Bandung</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-emerald-600" size={24} />
        </div>
      ) : timings ? (
        <div className="grid grid-cols-5 gap-2">
          {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
            <div key={p} className="text-center p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-800 mb-1">{prayerNames[p]}</p>
              <p className="text-lg mb-1">{prayerIcons[p]}</p>
              <p className="text-[11px] font-black text-emerald-950">{timings[p]}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-red-500 mb-2">Gagal memuat data waktu shalat</p>
          <button 
            onClick={() => isAuto ? navigator.geolocation.getCurrentPosition((p) => fetchByCoords(p.coords.latitude, p.coords.longitude)) : fetchPrayerTimes(city)}
            className="text-[10px] font-bold text-emerald-600 hover:underline"
          >
            Coba Lagi
          </button>
        </div>
      )}
      <p className="text-[10px] text-center text-emerald-800/40 mt-3 font-medium">
        {isAuto ? 'Berdasarkan GPS' : `Wilayah ${city} & Sekitarnya`}
      </p>
    </div>
  );
};

const Hero = ({ settings }: { settings: WebsiteSettings }) => (
  <section id="home" className="pt-32 pb-20 px-4 bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6">
          LAZISNU MWC NU NGAGLIK
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-emerald-950 leading-tight mb-6">
          Berbagi Kebaikan, <br />
          <span className="text-emerald-600">Menebar Keberkahan.</span>
        </h1>
        <p className="text-lg text-emerald-800/80 mb-8 max-w-lg">
          Salurkan Zakat, Infaq, dan Sedekah Anda melalui lembaga resmi yang amanah dan transparan untuk kemaslahatan umat di wilayah Ngaglik.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="#donasi" className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2">
            Donasi Sekarang <ChevronRight size={20} />
          </a>
          <a 
            href="https://wa.me/6289656004600" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center gap-2"
          >
            <Truck size={20} /> Pesan Ambulan
          </a>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-300 rounded-full blur-3xl opacity-30 animate-pulse delay-700" />
        
        <div className="relative z-10 space-y-6">
          <PrayerTimes />
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 rounded-3xl">
                <Heart className="text-emerald-600 mb-4" size={32} />
                <p className="text-3xl font-extrabold text-emerald-950">100%</p>
                <p className="text-sm text-emerald-800/60 font-medium">Amanah & Transparan</p>
              </div>
              <div className="p-6 bg-emerald-600 rounded-3xl text-white">
                <HandHelping className="mb-4" size={32} />
                <p className="text-3xl font-extrabold">24/7</p>
                <p className="text-sm text-emerald-100/80 font-medium">Layanan Umat</p>
              </div>
              <div className="col-span-2 p-6 bg-emerald-950 rounded-3xl text-white flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Layanan Ambulan</p>
                  <p className="text-xl font-bold">Siap Siaga 24 Jam</p>
                </div>
                <Truck size={40} className="text-emerald-400 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const ZakatCalculator = () => {
  const [calcType, setCalcType] = useState<'maal' | 'profesi'>('profesi');
  const [income, setIncome] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [wealth, setWealth] = useState('');
  const [result, setResult] = useState<number | null>(null);

  // Nisab estimates (can be updated)
  // Gold price approx Rp 1.200.000/gram
  // Nisab Maal (85g gold) = Rp 102.000.000
  // Nisab Profesi (522kg rice approx Rp 15.000/kg) = Rp 7.830.000 / month
  const NISAB_PROFESI = 7830000;
  const NISAB_MAAL = 102000000;

  const calculate = () => {
    if (calcType === 'profesi') {
      const total = Number(income) + Number(otherIncome);
      if (total >= NISAB_PROFESI) {
        setResult(total * 0.025);
      } else {
        setResult(0);
      }
    } else {
      const total = Number(wealth);
      if (total >= NISAB_MAAL) {
        setResult(total * 0.025);
      } else {
        setResult(0);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
          <Calculator size={24} />
        </div>
        <h3 className="text-2xl font-bold text-emerald-950">Kalkulator Zakat</h3>
      </div>

      <div className="flex p-1 bg-emerald-50 rounded-2xl mb-8">
        <button
          onClick={() => { setCalcType('profesi'); setResult(null); }}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold transition-all",
            calcType === 'profesi' ? "bg-emerald-600 text-white shadow-md" : "text-emerald-800 hover:bg-emerald-100"
          )}
        >
          Zakat Profesi
        </button>
        <button
          onClick={() => { setCalcType('maal'); setResult(null); }}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold transition-all",
            calcType === 'maal' ? "bg-emerald-600 text-white shadow-md" : "text-emerald-800 hover:bg-emerald-100"
          )}
        >
          Zakat Maal
        </button>
      </div>

      <div className="space-y-6">
        {calcType === 'profesi' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900">Penghasilan Per Bulan (Rp)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold text-emerald-900"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900">Penghasilan Lainnya (Rp)</label>
              <input
                type="number"
                value={otherIncome}
                onChange={(e) => setOtherIncome(e.target.value)}
                className="w-full px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold text-emerald-900"
                placeholder="0"
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-bold text-emerald-900">Total Harta (Emas/Tabungan/Properti) (Rp)</label>
            <input
              type="number"
              value={wealth}
              onChange={(e) => setWealth(e.target.value)}
              className="w-full px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold text-emerald-900"
              placeholder="0"
            />
          </div>
        )}

        <button
          onClick={calculate}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          Hitung Zakat
        </button>

        {result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-emerald-950 rounded-3xl text-center border-4 border-emerald-500/30"
          >
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Jumlah Zakat Wajib</p>
            <h4 className="text-3xl font-black text-white mb-2">{formatCurrency(result)}</h4>
            {result === 0 ? (
              <p className="text-emerald-200/50 text-xs italic">Belum mencapai Nisab (batas minimum wajib zakat).</p>
            ) : (
              <p className="text-emerald-200/50 text-xs italic">Berdasarkan perhitungan 2.5% dari total harta/penghasilan.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ActivitySection = ({ isAdmin }: { isAdmin: boolean }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, number>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      setActivities(data);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'activities'));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isPaused || !scrollRef.current || activities.length === 0) return;

    let animationFrameId: number;
    const scroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += 0.8; // Slow smooth scroll
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, activities]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (deletingId === id) {
      try {
        await deleteDoc(doc(db, 'activities', id));
        setDeletingId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
      }
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  const handleImageError = (id: string, url: string) => {
    const currentFallback = imageFallbacks[id] || 0;
    if (currentFallback < 1) {
      // Try alternative Google Drive format if the first one fails
      setImageFallbacks(prev => ({ ...prev, [id]: currentFallback + 1 }));
    } else {
      setBrokenImages(prev => ({ ...prev, [id]: true }));
    }
  };

  const getImageUrl = (id: string, url: string) => {
    const original = getDirectImageUrl(url);
    if (imageFallbacks[id] === 1 && original.includes('lh3.googleusercontent.com')) {
      // Fallback to uc?export=view format
      return original.replace('lh3.googleusercontent.com/d/', 'drive.google.com/uc?export=view&id=');
    }
    return original;
  };

  if (loading) return null;
  
  return (
    <section id="kegiatan" className="py-12 bg-white overflow-hidden border-y border-emerald-50">
      <div className="max-w-7xl mx-auto px-4 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-950">Laporan Kegiatan</h2>
          <p className="text-sm text-emerald-800/60">Dokumentasi aksi nyata LAZISNU Ngaglik.</p>
          {isAdmin && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">
              {activities.length} Foto Terdeteksi
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-75" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-bounce delay-150" />
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-emerald-50/50 rounded-3xl border border-dashed border-emerald-200 py-16 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <Leaf size={40} />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-2">Belum Ada Kegiatan</h3>
            <p className="text-emerald-800/50 italic mb-8 max-w-md mx-auto">Dokumentasi foto kegiatan LAZISNU Ngaglik akan muncul di sini setelah diunggah melalui Panel Admin.</p>
            {isAdmin && (
              <a href="#admin-panel" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                <Plus size={18} /> Tambah Foto Kegiatan Sekarang
              </a>
            )}
          </div>
        </div>
      ) : (
        <div 
          className="relative w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Scrollable Container with Auto-Scroll */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
            style={{ scrollBehavior: 'auto' }}
          >
            <div className="flex gap-6 px-4 py-4">
              {/* Multiply items for seamless loop */}
              {[...activities, ...activities].map((activity, idx) => (
                <div 
                  key={`${activity.id}-${idx}`}
                  className="relative flex-shrink-0 h-80 md:h-[500px] rounded-2xl overflow-hidden shadow-md border border-emerald-100 group bg-emerald-900/5"
                >
                  {brokenImages[activity.id!] ? (
                    <div className="w-64 h-full flex flex-col items-center justify-center p-6 text-center bg-emerald-50">
                      <Leaf size={40} className="text-emerald-200 mb-2" />
                      <p className="text-[10px] font-bold text-emerald-800/40 uppercase tracking-widest">Media Tidak Terload</p>
                    </div>
                  ) : activity.mediaType === 'video' ? (
                    <div className="h-full w-80 md:w-[600px] bg-black flex items-center justify-center relative">
                      <iframe 
                        src={getEmbedUrl(activity.imageUrl) || ''} 
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        title={activity.title}
                      />
                      {/* Overlay to prevent interaction while sliding, unless paused */}
                      {!isPaused && <div className="absolute inset-0 z-10" />}
                    </div>
                  ) : (
                    <img 
                      src={getImageUrl(activity.id!, activity.imageUrl)} 
                      alt={activity.title}
                      className="h-full w-auto min-w-[150px] object-contain transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                      onError={() => handleImageError(activity.id!, activity.imageUrl)}
                    />
                  )}
                  
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDelete(activity.id!, e)}
                      className={cn(
                        "absolute top-6 right-6 z-20 px-3 py-2 rounded-full transition-all shadow-lg backdrop-blur-sm flex items-center gap-2 text-xs font-bold",
                        deletingId === activity.id 
                          ? "bg-red-500 text-white scale-110" 
                          : "bg-red-600/90 text-white opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Trash2 size={16} />
                      {deletingId === activity.id && <span>Hapus?</span>}
                    </button>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
                    <p className="text-white font-bold text-xs md:text-sm line-clamp-2 mb-1">{activity.title}</p>
                    <p className="text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                      <Calendar size={10} /> {activity.timestamp.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  
                  {/* Film Perforations Style */}
                  <div className="absolute top-0 left-0 right-0 h-4 flex justify-around items-center px-2 bg-black/20 backdrop-blur-[1px] pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-white/40 rounded-sm" />
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-around items-center px-2 bg-black/20 backdrop-blur-[1px] pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-white/40 rounded-sm" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const DonationSection = ({ user, settings }: { user: User | null, settings: WebsiteSettings }) => {
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<DonationType>('Sedekah');
  const [donorName, setDonorName] = useState(user?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean, msg: string } | null>(null);

  useEffect(() => {
    if (user) {
      setDonorName(user.displayName || '');
    }
  }, [user]);

  // Real-time listener for user's successful donations
  useEffect(() => {
    // We listen for donations that were pending and now are success
    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'success'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // 'added' happens when a doc matches the query for the first time
        // 'modified' happens if a doc already in the result set changes (but here it would stay success)
        // Actually, when status changes from pending to success, it 'enters' this success query result set as 'added'
        if (change.type === 'added') {
          const data = change.doc.data() as Donation;
          
          // Check if this donation belongs to the current user (by UID or transactionId in localStorage)
          const savedTxId = localStorage.getItem('last_tx_id');
          const isMyDonation = (user && data.uid === user.uid) || (data.transactionId === savedTxId);

          if (isMyDonation) {
            // Only notify if it's very recent (within last 2 minutes) to avoid old notifications on load
            const now = Timestamp.now().toMillis();
            if (now - data.timestamp.toMillis() < 120000) {
              setNotification({
                show: true,
                msg: `Alhamdulillah! Donasi ${data.type} sebesar ${formatCurrency(data.amount)} telah diverifikasi & diterima. Terima kasih, ${data.donorName}!`
              });
              // Clear the saved tx id once notified
              if (data.transactionId === savedTxId) localStorage.removeItem('last_tx_id');
              setTimeout(() => setNotification(null), 10000);
            }
          }
        }
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'donations'));

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    setIsSubmitting(true);
    try {
      const baseAmount = Number(amount);
      // Generate a small unique code (100-999) to help admin verify
      const uniqueCode = Math.floor(Math.random() * 900) + 100;
      const finalAmount = baseAmount + uniqueCode;
      
      const txId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const donationData: any = {
        amount: finalAmount,
        donorName: donorName || 'Hamba Allah',
        type,
        status: 'pending', // Initial status is pending
        timestamp: Timestamp.now(),
        transactionId: txId,
      };

      if (user?.email) donationData.donorEmail = user.email;
      if (user?.uid) donationData.uid = user.uid;

      await addDoc(collection(db, 'donations'), donationData);
      
      // Store txId for non-logged in users to track notification
      localStorage.setItem('last_tx_id', txId);
      
      setAmount('');
      setNotification({ 
        show: true, 
        msg: `Donasi terkirim! Silakan transfer Rp ${finalAmount.toLocaleString('id-ID')} (termasuk kode unik ${uniqueCode}) ke rekening di atas. Notifikasi akan muncul setelah diverifikasi Admin.` 
      });
      setTimeout(() => setNotification(null), 12000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'donations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="donasi" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-emerald-950 mb-4">Donasi & Zakat Online</h2>
          <p className="text-emerald-800/70 max-w-2xl mx-auto">Tunaikan kewajiban Zakat dan salurkan Infaq/Sedekah Anda dengan mudah dan amanah.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <ZakatCalculator />
          </div>

          <div className="lg:col-span-3 bg-emerald-50 rounded-[3rem] p-8 md:p-12 shadow-inner border border-emerald-100">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Wallet size={20} />
                  </div>
                  <h3 className="font-bold text-emerald-900">Rekening Zakat</h3>
                </div>
                <p className="text-2xl font-mono font-bold text-emerald-600 mb-1">7263075905</p>
                <p className="text-sm text-emerald-800/60 font-medium">Bank BSI a.n LAZISNU MWC NGAGLIK</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Heart size={20} />
                  </div>
                  <h3 className="font-bold text-emerald-900">Rekening Infaq/Sedekah</h3>
                </div>
                <p className="text-2xl font-mono font-bold text-emerald-600 mb-1">7263076097</p>
                <p className="text-sm text-emerald-800/60 font-medium">Bank BSI a.n LAZISNU MWC NGAGLIK</p>
              </div>
            </div>

            <div className="mb-10">
              <a 
                href={`https://wa.me/${settings.waAdmin1}?text=Assalamu'alaikum%20Admin,%20saya%20ingin%20meminta%20kode%20QRIS%20untuk%20pembayaran%20donasi/zakat.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-white border-2 border-emerald-200 rounded-2xl text-emerald-700 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
              >
                <QrCode size={20} />
                Minta QRIS via WhatsApp (Admin 1)
              </a>
              <p className="text-center text-xs text-emerald-800/50 mt-3 italic">
                *Klik tombol di atas untuk meminta QRIS pembayaran langsung ke Admin kami.
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {(['Zakat', 'Infaq', 'Sedekah'] as DonationType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "py-4 rounded-2xl font-bold transition-all border-2",
                    type === t
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                      : "bg-white text-emerald-800 border-white hover:border-emerald-200"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Nominal Donasi (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xl">Rp</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-14 pr-4 py-4 bg-white rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none text-2xl font-bold text-emerald-950 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Nama Donatur</label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Hamba Allah"
                className="w-full px-4 py-4 bg-white rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none text-lg text-emerald-950 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Wallet />}
              Kirim Donasi Sekarang
            </button>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href={`https://wa.me/${settings.waAdmin1}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-white text-emerald-700 border-2 border-emerald-200 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-5 h-5" />
                Konfirmasi WA (Admin 1)
              </a>
              <a
                href={`https://wa.me/${settings.waAdmin2}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-white text-emerald-700 border-2 border-emerald-200 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-5 h-5" />
                Konfirmasi WA (Admin 2)
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>

      {/* Real-time Notification Toast */}
      <AnimatePresence>
        {notification?.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100] bg-emerald-900 text-white p-6 rounded-2xl shadow-2xl border border-emerald-700 flex gap-4 items-start"
          >
            <div className="bg-emerald-500 p-2 rounded-full text-white shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Notifikasi Transaksi</h4>
              <p className="text-emerald-50/90 leading-relaxed">{notification.msg}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const KoinNUSection = ({ settings }: { settings: WebsiteSettings }) => (
  <section className="py-20 px-4 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="bg-emerald-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 p-12 lg:p-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 text-emerald-400 rounded-full text-sm font-bold mb-8">
            <Coins size={18} /> PROGRAM UNGGULAN
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Gerakan <span className="text-emerald-400">Koin NU</span> Ngaglik
          </h2>
          <p className="text-emerald-100/70 text-lg mb-10 leading-relaxed">
            Sedekah receh jadi berkah. Melalui kaleng Koin NU, Anda bisa menabung pahala setiap hari dari rumah. Dana yang terkumpul akan digunakan untuk kemaslahatan umat dan program sosial di wilayah Ngaglik.
          </p>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-800 rounded-2xl text-emerald-400">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-white font-bold">Hubungi Admin</p>
                <p className="text-emerald-100/60 text-sm">Minta kaleng Koin NU melalui WhatsApp Admin.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-800 rounded-2xl text-emerald-400">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-white font-bold">Datang ke Kantor</p>
                <p className="text-emerald-100/60 text-sm">Ambil kaleng langsung di kantor MWC NU Ngaglik.</p>
              </div>
            </div>
          </div>

          <a 
            href={`https://wa.me/${settings.waAdmin1}?text=Assalamu'alaikum,%20saya%20ingin%20meminta%20kaleng%20Koin%20NU`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-950/20"
          >
            Minta Kaleng Sekarang <ChevronRight size={20} />
          </a>
        </div>
        <div className="lg:w-1/2 h-[400px] lg:h-[700px] w-full relative bg-emerald-800/20">
          <img 
            src={getDirectImageUrl(settings.koinNuImageUrl)} 
            alt="Kaleng Koin NU" 
            className="w-full h-full object-contain p-8 lg:p-12"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 lg:bg-gradient-to-l lg:from-emerald-900/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  </section>
);

const ReportSection = () => {
  const [reports, setReports] = useState<DistributionReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'distributions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DistributionReport));
      setReports(data);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'distributions'));

    return () => unsubscribe();
  }, []);

  return (
    <section id="laporan" className="py-24 px-4 bg-emerald-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-emerald-950 mb-4">Laporan Penyaluran</h2>
          <p className="text-emerald-800/60 max-w-2xl mx-auto">Transparansi adalah kunci amanah. Berikut adalah rekapitulasi dana yang telah disalurkan kepada yang berhak setiap bulannya.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-emerald-200">
            <p className="text-emerald-800/50 italic">Belum ada laporan bulanan penyaluran saat ini.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Calendar size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-950">Laporan {report.month}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-emerald-950 text-white rounded-xl">
                      <span className="text-sm font-medium opacity-80">Total Penyaluran</span>
                      <span className="font-bold">{formatCurrency(report.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-emerald-800">Pendidikan</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(report.educationAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-emerald-800">Kesehatan</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(report.healthAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-emerald-800">Sosial</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(report.socialAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-emerald-800">Ekonomi</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(report.economicAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white border border-emerald-100 rounded-xl mt-4">
                      <span className="text-sm font-medium text-emerald-800">Penerima Manfaat</span>
                      <span className="font-bold text-emerald-600">{report.recipientsCount} Orang</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const AdminPanel = ({ user, settings }: { user: User | null, settings: WebsiteSettings }) => {
  const [pendingDonations, setPendingDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAmounts, setEditAmounts] = useState<Record<string, string>>({});
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [isAddingAmbulance, setIsAddingAmbulance] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [reportForm, setReportForm] = useState({
    month: '',
    totalAmount: '',
    educationAmount: '',
    healthAmount: '',
    socialAmount: '',
    economicAmount: '',
    recipientsCount: ''
  });
  const [ambulanceForm, setAmbulanceForm] = useState({
    month: '',
    totalTrips: '',
    patientTrips: '',
    funeralTrips: '',
    socialTrips: ''
  });
  const [activityForm, setActivityForm] = useState({
    title: '',
    imageUrl: '',
    mediaType: 'image' as 'image' | 'video'
  });
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>(settings);
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, number>>({});
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  const handleImageError = (id: string, url: string) => {
    const currentFallback = imageFallbacks[id] || 0;
    if (currentFallback < 1) {
      setImageFallbacks(prev => ({ ...prev, [id]: currentFallback + 1 }));
    } else {
      setBrokenImages(prev => ({ ...prev, [id]: true }));
    }
  };

  const getImageUrl = (id: string, url: string) => {
    const original = getDirectImageUrl(url);
    if (imageFallbacks[id] === 1 && original.includes('lh3.googleusercontent.com')) {
      return original.replace('lh3.googleusercontent.com/d/', 'drive.google.com/uc?export=view&id=');
    }
    return original;
  };

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
      setPendingDonations(data);
      
      // Initialize edit amounts
      const initialAmounts: Record<string, string> = {};
      data.forEach(d => {
        initialAmounts[d.id!] = d.amount.toString();
      });
      setEditAmounts(initialAmounts);
      
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'donations'));

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      setActivities(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'activities'));
    return () => unsubscribe();
  }, [isAdmin]);

  const handleVerify = async (id: string) => {
    try {
      const finalAmount = Number(editAmounts[id]);
      if (isNaN(finalAmount)) return;

      const docRef = doc(db, 'donations', id);
      await setDoc(docRef, { 
        status: 'success',
        amount: finalAmount // Update with the verified amount from bank
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `donations/${id}`);
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'distributions'), {
        month: reportForm.month,
        totalAmount: Number(reportForm.totalAmount),
        educationAmount: Number(reportForm.educationAmount),
        healthAmount: Number(reportForm.healthAmount),
        socialAmount: Number(reportForm.socialAmount),
        economicAmount: Number(reportForm.economicAmount),
        recipientsCount: Number(reportForm.recipientsCount),
        timestamp: Timestamp.now()
      });
      setIsAddingReport(false);
      setReportForm({
        month: '',
        totalAmount: '',
        educationAmount: '',
        healthAmount: '',
        socialAmount: '',
        economicAmount: '',
        recipientsCount: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'distributions');
    }
  };

  const handleAddAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'ambulance_reports'), {
        month: ambulanceForm.month,
        totalTrips: Number(ambulanceForm.totalTrips),
        patientTrips: Number(ambulanceForm.patientTrips),
        funeralTrips: Number(ambulanceForm.funeralTrips),
        socialTrips: Number(ambulanceForm.socialTrips),
        timestamp: Timestamp.now()
      });
      setIsAddingAmbulance(false);
      setAmbulanceForm({
        month: '',
        totalTrips: '',
        patientTrips: '',
        funeralTrips: '',
        socialTrips: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ambulance_reports');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'activities'), {
        title: activityForm.title,
        imageUrl: activityForm.imageUrl,
        mediaType: activityForm.mediaType,
        timestamp: Timestamp.now()
      });
      setIsAddingActivity(false);
      setActivityForm({ title: '', imageUrl: '', mediaType: 'image' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'activities');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (deletingActivityId === id) {
      try {
        await deleteDoc(doc(db, 'activities', id));
        setDeletingActivityId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
      }
    } else {
      setDeletingActivityId(id);
      setTimeout(() => setDeletingActivityId(null), 3000);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'main'), settingsForm);
      setIsEditingSettings(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/main');
    }
  };

  const handleResetSettings = () => {
    if (confirm('Kembalikan semua pengaturan (Logo, WA, dll) ke bawaan awal?')) {
      setSettingsForm(DEFAULT_SETTINGS);
    }
  };

  if (!isAdmin) return null;

  return (
    <section id="admin-panel" className="py-20 px-4 bg-emerald-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-700 rounded-2xl">
              <Bell className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Panel Admin</h2>
              <p className="text-emerald-400">Kelola donasi, laporan, dan pengaturan website.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              {isEditingSettings ? 'Batal' : 'Pengaturan Website'}
            </button>
            <button 
              onClick={() => setIsAddingReport(!isAddingReport)}
              className="px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              {isAddingReport ? <X size={20} /> : <Plus size={20} />}
              {isAddingReport ? 'Batal' : 'Tambah Laporan Penyaluran'}
            </button>
            <button 
              onClick={() => setIsAddingAmbulance(!isAddingAmbulance)}
              className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              {isAddingAmbulance ? <X size={20} /> : <Truck size={20} />}
              {isAddingAmbulance ? 'Batal' : 'Input Laporan Ambulan'}
            </button>
            <button 
              onClick={() => setIsAddingActivity(!isAddingActivity)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center gap-2"
            >
              {isAddingActivity ? <X size={20} /> : <Plus size={20} />}
              {isAddingActivity ? 'Batal' : 'Tambah Foto Kegiatan'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isEditingSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <form onSubmit={handleUpdateSettings} className="bg-emerald-800 p-8 rounded-3xl border border-emerald-700 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="text-emerald-400" /> Pengaturan Website (Logo & WA)
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 col-span-full">
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        required
                        value={settingsForm.logoUrl}
                        onChange={e => setSettingsForm({...settingsForm, logoUrl: e.target.value})}
                        className="flex-1 bg-emerald-900 border border-emerald-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                        placeholder="https://example.com/logo.png"
                      />
                      <a 
                        href={getDirectImageUrl(settingsForm.logoUrl)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center"
                      >
                        Cek Link
                      </a>
                    </div>
                    {settingsForm.logoUrl && (
                      <div className="p-4 bg-white rounded-2xl border border-emerald-700 w-fit">
                        <p className="text-[10px] font-bold text-emerald-900 mb-2 uppercase">Preview Logo:</p>
                        <img src={getDirectImageUrl(settingsForm.logoUrl)} alt="Preview Logo" className="h-12 w-auto object-contain" />
                      </div>
                    )}
                    {settingsForm.logoUrl === settingsForm.koinNuImageUrl && settingsForm.logoUrl !== '' && (
                      <p className="text-xs text-amber-400 font-bold bg-amber-950/50 p-3 rounded-xl border border-amber-900/50">
                        ⚠️ Peringatan: Link Logo dan Link Koin NU sama. Pastikan Anda memasukkan link yang berbeda untuk masing-masing bagian.
                      </p>
                    )}
                  </div>
                  <div className="space-y-4 col-span-full">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-emerald-300">URL Gambar Koin NU</label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          required
                          value={settingsForm.koinNuImageUrl}
                          onChange={e => setSettingsForm({...settingsForm, koinNuImageUrl: e.target.value})}
                          className="flex-1 bg-emerald-900 border border-emerald-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                          placeholder="https://example.com/koin-nu.jpg"
                        />
                        <a 
                          href={getDirectImageUrl(settingsForm.koinNuImageUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-3 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center"
                        >
                          Cek Link
                        </a>
                      </div>
                    </div>
                    {settingsForm.koinNuImageUrl && (
                      <div className="p-4 bg-white rounded-2xl border border-emerald-700 w-fit">
                        <p className="text-[10px] font-bold text-emerald-900 mb-2 uppercase">Preview Koin NU:</p>
                        <img src={getDirectImageUrl(settingsForm.koinNuImageUrl)} alt="Preview Koin NU" className="h-24 w-auto object-contain rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-300">WA Admin 1 (Tanpa +)</label>
                    <input 
                      type="text" 
                      required
                      value={settingsForm.waAdmin1}
                      onChange={e => setSettingsForm({...settingsForm, waAdmin1: e.target.value})}
                      className="w-full bg-emerald-900 border border-emerald-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                      placeholder="628123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-300">WA Admin 2 (Tanpa +)</label>
                    <input 
                      type="text" 
                      required
                      value={settingsForm.waAdmin2}
                      onChange={e => setSettingsForm({...settingsForm, waAdmin2: e.target.value})}
                      className="w-full bg-emerald-900 border border-emerald-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <button 
                    type="button"
                    onClick={handleResetSettings}
                    className="text-emerald-400 hover:text-white text-sm font-medium underline"
                  >
                    Reset ke Pengaturan Awal
                  </button>
                  <button type="submit" className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-950/20">
                    Simpan Perubahan
                  </button>
                </div>
                <p className="mt-4 text-xs text-emerald-400 italic">
                  *PENTING: Link harus berupa link langsung ke file gambar (berakhiran .jpg, .png, atau .webp). Jika Anda menggunakan Google Drive, pastikan link tersebut adalah link "Direct Download".
                </p>
                <div className="mt-4 p-4 bg-emerald-900/50 rounded-xl border border-emerald-700">
                  <p className="text-xs text-emerald-300 font-bold mb-2 uppercase">Cara mendapatkan link gambar langsung:</p>
                  <ol className="text-[10px] text-emerald-400 space-y-1 list-decimal ml-4">
                    <li>Upload gambar ke situs seperti <strong>postimages.org</strong> atau <strong>imgur.com</strong></li>
                    <li>Setelah upload, pilih menu <strong>"Direct Link"</strong> (Link Langsung)</li>
                    <li>Copy link tersebut dan tempelkan di kolom di atas</li>
                  </ol>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {isAddingActivity && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-emerald-800/50 p-8 rounded-3xl border border-emerald-700 shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-emerald-400" /> Form Tambah Kegiatan (Foto/Video)
            </h3>
            <form onSubmit={handleAddActivity} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Judul Kegiatan</label>
                <input 
                  type="text" 
                  required
                  value={activityForm.title}
                  onChange={e => setActivityForm({...activityForm, title: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Contoh: Penyaluran Sembako di Desa X"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Jenis Media</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActivityForm({...activityForm, mediaType: 'image'})}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                      activityForm.mediaType === 'image' ? "bg-emerald-500 text-white" : "bg-emerald-900/50 text-emerald-400 border border-emerald-700"
                    )}
                  >
                    <ImageIcon size={18} /> Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityForm({...activityForm, mediaType: 'video'})}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                      activityForm.mediaType === 'video' ? "bg-emerald-500 text-white" : "bg-emerald-900/50 text-emerald-400 border border-emerald-700"
                    )}
                  >
                    <Video size={18} /> Video
                  </button>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">URL {activityForm.mediaType === 'image' ? 'Gambar' : 'Video (YouTube/Drive)'}</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    required
                    value={activityForm.imageUrl}
                    onChange={e => setActivityForm({...activityForm, imageUrl: e.target.value})}
                    className="flex-1 bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                    placeholder={activityForm.mediaType === 'image' ? "https://example.com/foto.jpg" : "https://youtube.com/watch?v=... atau link Drive"}
                  />
                  <a 
                    href={activityForm.mediaType === 'image' ? getDirectImageUrl(activityForm.imageUrl) : (getEmbedUrl(activityForm.imageUrl) || activityForm.imageUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center"
                  >
                    Cek
                  </a>
                </div>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2">
                  <Plus size={20} /> Simpan Foto Kegiatan
                </button>
              </div>
            </form>

            <div className="mt-8">
              <h4 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-widest">Daftar Foto Kegiatan</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {activities.map(activity => (
                  <div key={activity.id} className="relative group aspect-square rounded-xl overflow-hidden border border-emerald-700 bg-emerald-950">
                    {brokenImages[activity.id!] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <X size={20} className="text-red-500 mb-1" />
                        <p className="text-[8px] text-red-400 font-bold uppercase">Broken</p>
                      </div>
                    ) : activity.mediaType === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-emerald-400">
                        <Video size={24} />
                        <p className="text-[8px] font-bold mt-1 uppercase">Video</p>
                      </div>
                    ) : (
                    <img 
                      src={getImageUrl(activity.id!, activity.imageUrl)} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={() => handleImageError(activity.id!, activity.imageUrl)}
                    />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button 
                        onClick={() => handleDeleteActivity(activity.id!)}
                        className={cn(
                          "w-full py-2 rounded-lg transition-all font-bold text-[10px] flex items-center justify-center gap-1",
                          deletingActivityId === activity.id 
                            ? "bg-red-500 text-white" 
                            : "bg-red-600 text-white hover:bg-red-500"
                        )}
                      >
                        {deletingActivityId === activity.id ? (
                          <><span>Yakin?</span></>
                        ) : (
                          <><X size={14} /> <span>Hapus</span></>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {isAddingAmbulance && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-emerald-800/50 p-8 rounded-3xl border border-emerald-700 shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Truck className="text-emerald-400" /> Form Laporan Bulanan Ambulan
            </h3>
            <form onSubmit={handleAddAmbulance} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Bulan & Tahun</label>
                <input 
                  type="text" 
                  required
                  value={ambulanceForm.month}
                  onChange={e => setAmbulanceForm({...ambulanceForm, month: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Contoh: Januari 2024"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Trip</label>
                <input 
                  type="number" 
                  required
                  value={ambulanceForm.totalTrips}
                  onChange={e => setAmbulanceForm({...ambulanceForm, totalTrips: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Jumlah Pasien</label>
                <input 
                  type="number" 
                  required
                  value={ambulanceForm.patientTrips}
                  onChange={e => setAmbulanceForm({...ambulanceForm, patientTrips: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Jumlah Jenazah</label>
                <input 
                  type="number" 
                  required
                  value={ambulanceForm.funeralTrips}
                  onChange={e => setAmbulanceForm({...ambulanceForm, funeralTrips: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Jumlah Sosial</label>
                <input 
                  type="number" 
                  required
                  value={ambulanceForm.socialTrips}
                  onChange={e => setAmbulanceForm({...ambulanceForm, socialTrips: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2">
                  <Navigation size={20} /> Simpan Laporan Bulanan
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {isAddingReport && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-emerald-800/50 p-8 rounded-3xl border border-emerald-700 shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="text-emerald-400" /> Form Laporan Bulanan Penyaluran
            </h3>
            <form onSubmit={handleAddReport} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Bulan & Tahun</label>
                <input 
                  type="text" 
                  required
                  value={reportForm.month}
                  onChange={e => setReportForm({...reportForm, month: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Contoh: Januari 2024"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Penyaluran (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={reportForm.totalAmount}
                  onChange={e => setReportForm({...reportForm, totalAmount: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Bidang Pendidikan (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={reportForm.educationAmount}
                  onChange={e => setReportForm({...reportForm, educationAmount: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Bidang Kesehatan (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={reportForm.healthAmount}
                  onChange={e => setReportForm({...reportForm, healthAmount: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Bidang Sosial (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={reportForm.socialAmount}
                  onChange={e => setReportForm({...reportForm, socialAmount: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Bidang Ekonomi (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={reportForm.economicAmount}
                  onChange={e => setReportForm({...reportForm, economicAmount: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Jumlah Penerima Manfaat</label>
                <input 
                  type="number" 
                  required
                  value={reportForm.recipientsCount}
                  onChange={e => setReportForm({...reportForm, recipientsCount: e.target.value})}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full py-4 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} /> Simpan Laporan Penyaluran
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bell size={20} className="text-emerald-400" />
          Donasi Menunggu Verifikasi
        </h3>

        {loading ? (
          <Loader2 className="animate-spin" />
        ) : pendingDonations.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-emerald-700 rounded-3xl text-center text-emerald-500">
            Tidak ada donasi tertunda.
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingDonations.map((d) => (
              <div key={d.id} className="bg-emerald-800/50 p-6 rounded-3xl border border-emerald-700 flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">{d.type}</span>
                    <span className="text-emerald-400 font-mono text-sm">{d.transactionId}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{d.donorName}</h3>
                  <p className="text-xs text-emerald-500">
                    Input Donatur: {formatCurrency(d.amount)} • {d.timestamp.toDate().toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                  <div className="relative w-full sm:w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={editAmounts[d.id!] || ''}
                      onChange={(e) => setEditAmounts({ ...editAmounts, [d.id!]: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 bg-emerald-950 border border-emerald-700 rounded-xl text-white font-bold outline-none focus:border-emerald-400 transition-all"
                      placeholder="Nominal Bank"
                    />
                  </div>
                  <button
                    onClick={() => handleVerify(d.id!)}
                    className="w-full sm:w-auto px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    <CheckCircle2 size={18} /> Verifikasi & Terima
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const AmbulanceSection = () => {
  const [reports, setReports] = useState<AmbulanceReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'ambulance_reports'), orderBy('timestamp', 'desc'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AmbulanceReport));
      setReports(data);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'ambulance_reports'));

    return () => unsubscribe();
  }, []);

  return (
    <section id="ambulan" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-4">Laporan Ambulan</h2>
            <p className="text-emerald-800/70 max-w-xl">Layanan ambulan gratis untuk masyarakat Ngaglik. Berikut adalah rekapitulasi penggunaan layanan ambulan setiap bulannya.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-emerald-50/50 rounded-3xl border border-dashed border-emerald-200">
            <p className="text-emerald-800/50 italic">Belum ada laporan bulanan ambulan saat ini.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950">Laporan {report.month}</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                    <span className="text-sm font-medium text-emerald-800">1. Jumlah Trip</span>
                    <span className="font-bold text-emerald-600">{report.totalTrips}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white border border-emerald-50 rounded-xl">
                    <span className="text-sm font-medium text-emerald-800">2. Pasien</span>
                    <span className="font-bold text-emerald-600">{report.patientTrips}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white border border-emerald-50 rounded-xl">
                    <span className="text-sm font-medium text-emerald-800">3. Jenazah</span>
                    <span className="font-bold text-emerald-600">{report.funeralTrips}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white border border-emerald-50 rounded-xl">
                    <span className="text-sm font-medium text-emerald-800">4. Sosial</span>
                    <span className="font-bold text-emerald-600">{report.socialTrips}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
const Footer = ({ settings }: { settings: WebsiteSettings }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [settings.logoUrl]);

  return (
    <footer className="bg-emerald-950 text-emerald-50 py-16 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 flex items-center bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
              {imgError ? (
                <div className="h-14 w-14 bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Leaf size={28} />
                </div>
              ) : (
                <img 
                  src={getDirectImageUrl(settings.logoUrl)} 
                  alt="Logo LAZISNU" 
                  className="h-full w-auto object-contain"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight">LAZISNU</span>
            <span className="text-emerald-500 font-bold text-xl">Ngaglik</span>
          </div>
        </div>
        <p className="text-emerald-200/70 max-w-md leading-relaxed">
          Lembaga Amil Zakat Infaq Sedekah Nahdlatul Ulama (LAZISNU) Kecamatan Ngaglik, Sleman. Berkhidmat untuk umat dengan transparansi dan akuntabilitas.
        </p>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-6 text-white">Tautan Cepat</h4>
        <ul className="space-y-4 text-emerald-200/70">
          <li><a href="#home" className="hover:text-emerald-400 transition-colors">Beranda</a></li>
          <li><a href="#donasi" className="hover:text-emerald-400 transition-colors">Donasi Online</a></li>
          <li><a href="#laporan" className="hover:text-emerald-400 transition-colors">Laporan Penyaluran</a></li>
          <li><a href="#ambulan" className="hover:text-emerald-400 transition-colors">Laporan Ambulan</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-6 text-white">Kontak</h4>
        <ul className="space-y-4 text-emerald-200/70 text-sm">
          <li>Gandok-Tambakan Sinduharjo Ngaglik Sleman Yogyakarta</li>
          <li>Email: upzisnungaglik@gmail.com</li>
          <li>
            <a href={`https://wa.me/${settings.waAdmin1}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
              WA 1: +{settings.waAdmin1}
            </a>
          </li>
          <li>
            <a href={`https://wa.me/${settings.waAdmin2}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
              WA 2: +{settings.waAdmin2}
            </a>
          </li>
          <li>
            <a href="https://wa.me/6289656004600" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
              WA Ambulan: +62 896-5600-4600
            </a>
          </li>
        </ul>
      </div>
      <div className="col-span-full lg:col-span-1">
        <h4 className="font-bold text-lg mb-6 text-white">Lokasi Kami</h4>
        <div className="w-full h-48 rounded-2xl overflow-hidden border border-emerald-900 mb-4">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.568436573789!2d110.3917823!3d-7.7293521!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a590059f6350d%3A0x6734139266150f8!2sUPZIS%20LAZISNU%20MWC%20NGAGLIK!5e0!3m2!1sen!2sid!4v1712534400000!5m2!1sen!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <a 
          href="https://maps.app.goo.gl/Mn39GRfSiHGeqnG7A" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <MapPin size={16} /> Buka di Google Maps
        </a>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-emerald-900 text-center text-emerald-200/40 text-sm">
      &copy; {new Date().getFullYear()} LAZISNU Ngaglik. Hak Cipta Dilindungi.
    </div>
  </footer>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);

      // Sync user profile to Firestore
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        getDoc(userRef).then((docSnap) => {
          if (!docSnap.exists()) {
            setDoc(userRef, {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || '',
              role: 'donor'
            }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${u.uid}`));
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as WebsiteSettings);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError('Popup diblokir oleh browser. Silakan izinkan popup atau buka aplikasi di tab baru.');
      } else {
        setLoginError('Gagal masuk. Silakan coba lagi.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} settings={settings} />
        
        {loginError && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center gap-3 min-w-[300px]">
            <div className="flex items-center gap-3">
              <Bell size={20} />
              <p className="text-sm font-medium">{loginError}</p>
              <button onClick={() => setLoginError(null)} className="hover:text-red-900">
                <X size={18} />
              </button>
            </div>
            <a 
              href={window.location.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-all"
            >
              Buka di Tab Baru
            </a>
          </div>
        )}

        {user && !ADMIN_EMAILS.includes(user.email || '') && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center text-amber-800 text-xs font-medium">
            Anda masuk sebagai <span className="font-bold">{user.email}</span>. Panel Admin hanya tersedia untuk akun utama.
          </div>
        )}

        <main>
          <Hero settings={settings} />
          <DonationSection user={user} settings={settings} />
          <ActivitySection isAdmin={user?.email ? ADMIN_EMAILS.includes(user.email) : false} />
          <KoinNUSection settings={settings} />
          <ReportSection />
          <AmbulanceSection />
          <AdminPanel user={user} settings={settings} />
        </main>
        <Footer settings={settings} />
        
        {/* Floating General WA Button */}
        <motion.a
          href={`https://wa.me/${settings.waAdmin1}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          className="fixed bottom-24 right-6 z-[90] bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 group overflow-hidden"
        >
          <MessageCircle size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">
            Tanya Admin
          </span>
        </motion.a>
      </div>
    </ErrorBoundary>
  );
}
