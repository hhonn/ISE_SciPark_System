import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, MapPin, Trophy, AlertCircle, Clock, Users, ArrowRight, DollarSign, Building2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useBookingStore } from '../stores/bookingStore'
import { parkingAPI, bookingAPI } from '../utils/apiService'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'

const Home = () => {
  const { user } = useAuthStore()
  const { activeBooking, setActiveBooking } = useBookingStore()
  const [parkingSpots, setParkingSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSpots: 0,
    availableSpots: 0,
    occupiedSpots: 0
  })

  useEffect(() => {
    fetchParkingSpots()
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchParkingSpots()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchParkingSpots = async () => {
    try {
      // Fetch real data from API
      const response = await parkingAPI.getZones()
      const zones = response.data.zones || []
      
      // Map emoji icons for each zone
      const zoneIcons = {
        'CHULA': '🏛️',
        'PRAJOM': '🏢',
        'BEHIND': '🌳',
        'DEAN': '👔',
        'FRONT': '🚪'
      }
      
      const formattedSpots = zones.map(zone => ({
        id: zone.id || zone._id,
        name: zone.name,
        zone: zone.zoneName,
        available: zone.availableSpots || 0,
        total: zone.totalSpots || 0,
        pricePerHour: zone.hourlyRate || 20,
        image: zoneIcons[zone.zoneName] || '🅿️',
        building: zone.building,
        description: zone.description
      }))
      
      setParkingSpots(formattedSpots)
      
      // Calculate stats
      const total = formattedSpots.reduce((sum, spot) => sum + spot.total, 0)
      const available = formattedSpots.reduce((sum, spot) => sum + spot.available, 0)
      
      setStats({
        totalSpots: total,
        availableSpots: available,
        occupiedSpots: total - available
      })
      
    } catch (error) {
      console.error('Error fetching parking spots:', error)
      // Fallback to empty array if API fails
      setParkingSpots([])
    } finally {
      setLoading(false)
    }
  }

  const checkActiveBooking = async () => {
    try {
      // Check if user has active booking
      const response = await bookingAPI.getActiveBooking()
      if (response.data.success && response.data.data) {
        setActiveBooking(response.data.data)
      }
    } catch (error) {
      // Silent fail - user might not have active booking
      if (error.response?.status !== 404) {
        console.error('Error checking booking:', error)
      }
    }
  }

  const getAvailabilityColor = (available, total) => {
    const percentage = (available / total) * 100
    if (percentage > 50) return 'text-green-600'
    if (percentage > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAvailabilityBadge = (available) => {
    if (available === 0) return <Badge variant="danger" size="sm">เต็ม</Badge>
    if (available <= 5) return <Badge variant="warning" size="sm">ใกล้เต็ม</Badge>
    return <Badge variant="success" size="sm">ว่าง</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="กำลังโหลดข้อมูล..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Enhanced Hero Section with Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">ระบบออนไลน์</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              สวัสดี, <span className="text-yellow-300">{user?.name || user?.username}!</span> 👋
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl">
              ยินดีต้อนรับสู่ SciPark — ระบบจองที่จอดรถอัจฉริยะ
            </p>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Car className="w-7 h-7 text-white" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    stats.availableSpots > 50 ? 'bg-green-100 text-green-700' :
                    stats.availableSpots > 20 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {stats.availableSpots > 50 ? 'พร้อมใช้งาน' :
                     stats.availableSpots > 20 ? 'ใกล้เต็ม' : 'เหลือน้อย'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">ที่จอดว่าง</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.availableSpots}
                </p>
                <p className="text-xs text-gray-500 mt-2">จากทั้งหมด {stats.totalSpots} ที่</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.rank === 'Predator' ? 'bg-purple-100 text-purple-700' :
                    user?.rank === 'Diamond' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user?.rank === 'Predator' ? '15% OFF' :
                     user?.rank === 'Diamond' ? '10% OFF' : 'Member'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">สมาชิกระดับ</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {user?.rank || 'Iron'}
                </p>
                <p className="text-xs text-gray-500 mt-2">{user?.points || 0} คะแนนสะสม</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative sm:col-span-2 lg:col-span-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    4 โซน
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">ที่จอดทั้งหมด</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.totalSpots}
                </p>
                <p className="text-xs text-gray-500 mt-2">ครอบคลุมทั้งคณะ</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Active Booking Alert - Enhanced */}
        {activeBooking && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/app/booking">
              <div className="relative group overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                <div className="relative p-6 sm:p-8 flex items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
                    <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        มีการจองที่กำลังใช้งาน
                      </h3>
                      <div className="flex-shrink-0 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-xs font-semibold text-white">Active</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-white/90">
                      <p className="text-base sm:text-lg font-medium">
                        📍 ที่จอด: <span className="text-yellow-200">{activeBooking.spotName}</span>
                      </p>
                      <p className="text-base sm:text-lg font-medium">
                        ⏰ เวลาที่เหลือ: <span className="text-yellow-200">{activeBooking.timeLeft}</span>
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-white/75 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">คลิกเพื่อดูรายละเอียดเต็ม</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Enhanced Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              ที่จอดรถทั้งหมด
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              เลือกโซนและที่จอดที่คุณต้องการ
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Live Update</span>
            </div>
          </div>
        </div>

        {/* Enhanced Parking Spots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {parkingSpots.map((spot, index) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.08,
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1]
              }}
            >
              <Link to={`/app/parking/${spot.id}`}>
                <Card hover={true} className="group cursor-pointer h-full relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500/20">
                  {/* Decorative Background Gradient */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  
                  {/* Enhanced Image/Icon Section */}
                  <div className={`
                    relative h-48 flex items-center justify-center text-8xl overflow-hidden
                    ${spot.available === 0 
                      ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500' 
                      : 'bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400'
                    }
                  `}>
                    {/* Overlay Pattern */}
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    
                    {/* Icon with Shadow */}
                    <div className="relative z-10 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      {spot.image}
                    </div>

                    {/* Availability Badge on Image */}
                    <div className="absolute top-4 right-4 z-10">
                      {getAvailabilityBadge(spot.available)}
                    </div>

                    {/* Live Status Indicator */}
                    {spot.available > 0 && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                        <div className="relative">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">Live</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {spot.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-5 h-5 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-indigo-600" />
                          </div>
                          <span className="font-medium">โซน {spot.zone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Availability Display */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <span className="text-sm font-semibold text-gray-700">ที่ว่าง</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-bold ${getAvailabilityColor(spot.available, spot.total)}`}>
                          {spot.available}
                        </span>
                        <span className="text-xl text-gray-400">/</span>
                        <span className="text-xl font-semibold text-gray-600">
                          {spot.total}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">ระดับความว่าง</span>
                        <span className="text-xs font-bold text-gray-900">
                          {Math.round((spot.available / spot.total) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(spot.available / spot.total) * 100}%` }}
                          transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: "easeOut" }}
                          className={`h-full relative ${
                            spot.available === 0 
                              ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600' 
                              : spot.available <= 5 
                                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600' 
                                : 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500'
                          }`}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                      </div>
                      {/* Status Label */}
                      <div className="mt-2 text-center">
                        {spot.available === 0 ? (
                          <span className="text-xs font-semibold text-red-600">🔴 เต็มแล้ว</span>
                        ) : spot.available <= 5 ? (
                          <span className="text-xs font-semibold text-orange-600">🟡 ใกล้เต็ม</span>
                        ) : (
                          <span className="text-xs font-semibold text-green-600">🟢 ว่างมาก</span>
                        )}
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-semibold text-gray-700">ค่าบริการ</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {spot.pricePerHour}
                        </span>
                        <span className="text-base text-gray-600">฿</span>
                        <span className="text-sm text-gray-500">/ชม.</span>
                      </div>
                    </div>

                    {/* Floors Info (if available) */}
                    {spot.floors && (
                      <div className="p-3 bg-white border border-gray-200 rounded-xl">
                        <p className="text-xs font-semibold text-gray-600 mb-2">ชั้นที่มีบริการ:</p>
                        <div className="flex flex-wrap gap-2">
                          {spot.floors.slice(0, 3).map((floor, i) => (
                            <span key={i} className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-medium rounded-lg shadow-sm">
                              {floor}
                            </span>
                          ))}
                          {spot.floors.length > 3 && (
                            <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-bold rounded-lg shadow-sm">
                              +{spot.floors.length - 3} ชั้น
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {spot.available > 0 && !activeBooking ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group/btn"
                      >
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                        
                        <span className="relative text-base">จองที่จอดนี้</span>
                        <ArrowRight className="relative w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </motion.button>
                    ) : spot.available === 0 ? (
                      <button
                        disabled
                        className="w-full py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 font-bold rounded-xl cursor-not-allowed shadow-inner flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span>เต็มแล้ว</span>
                      </button>
                    ) : null}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              บริการเพิ่มเติม
            </h2>
            <p className="text-lg text-gray-600">
              จัดการบัญชีและยกระดับประสบการณ์การใช้งาน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Membership Card */}
            <Link to="/app/privileges">
              <motion.div
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white rounded-2xl lg:rounded-3xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Floating Circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/30">
                    <Trophy className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-300 drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-3 group-hover:text-yellow-300 transition-colors">
                    อัพเกรด Membership
                  </h3>
                  <p className="text-base lg:text-lg opacity-90 leading-relaxed mb-6">
                    รับส่วนลดสูงสุด 15% พร้อมสิทธิพิเศษมากมาย สำหรับสมาชิก Diamond และ Predator
                  </p>
                  <div className="flex items-center gap-2 text-yellow-300 font-semibold group-hover:gap-4 transition-all">
                    <span>ดูแพ็คเกจทั้งหมด</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* Special Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full">
                    HOT 🔥
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Vehicle Management Card */}
            <Link to="/app/profile">
              <motion.div
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white rounded-2xl lg:rounded-3xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Floating Circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/30">
                    <Car className="w-8 h-8 lg:w-10 lg:h-10 text-cyan-200 drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-3 group-hover:text-cyan-200 transition-colors">
                    จัดการยานพาหนะ
                  </h3>
                  <p className="text-base lg:text-lg opacity-90 leading-relaxed mb-6">
                    เพิ่ม ลบ หรือแก้ไขข้อมูลยานพาหนะของคุณ เพื่อการจองที่รวดเร็วยิ่งขึ้น
                  </p>
                  <div className="flex items-center gap-2 text-cyan-200 font-semibold group-hover:gap-4 transition-all">
                    <span>จัดการข้อมูลรถ</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* Special Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-cyan-300 text-blue-900 text-xs font-bold rounded-full">
                    NEW ⭐
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Home
