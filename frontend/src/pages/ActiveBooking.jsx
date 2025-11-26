import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, QrCode, AlertCircle, Car, CheckCircle, LogOut, Timer, Scan, XCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useBookingStore } from '../stores/bookingStore'
import { bookingAPI } from '../utils/apiService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import QRCodeDisplay from '../components/QRCodeDisplay'
import toast from 'react-hot-toast'

const ActiveBooking = () => {
  const navigate = useNavigate()
  const { activeBooking, clearActiveBooking, setActiveBooking } = useBookingStore()
  const [timeElapsed, setTimeElapsed] = useState('00:00:00')
  const [checkInCountdown, setCheckInCountdown] = useState({ minutes: 30, seconds: 0, expired: false })
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [checkOutData, setCheckOutData] = useState(null)
  const [bookingData, setBookingData] = useState(null)

  // Fetch active booking from server
  const fetchActiveBooking = useCallback(async () => {
    try {
      setPageLoading(true)
      const response = await bookingAPI.getActiveBooking()
      if (response.data?.success && response.data?.data) {
        const data = response.data.data
        setBookingData(data)
        // Update store with fresh data
        setActiveBooking({
          id: data.bookingId,
          bookingId: data.bookingId,
          spotName: data.spot?.spotNumber || data.spot?.name,
          floor: data.spot?.floor,
          building: data.spot?.building,
          zone: data.zone?.name,
          startTime: data.startTime,
          actualStartTime: data.actualStartTime,
          checkInDeadline: data.checkInDeadline,
          status: data.status,
          isCheckedIn: data.isCheckedIn,
          pricing: data.pricing,
          qrCode: data.qrCode,
          vehicle: data.vehicle
        })
      } else {
        clearActiveBooking()
      }
    } catch (error) {
      if (error.response?.status === 404) {
        clearActiveBooking()
      }
      console.error('Error fetching active booking:', error)
    } finally {
      setPageLoading(false)
    }
  }, [setActiveBooking, clearActiveBooking])

  useEffect(() => {
    fetchActiveBooking()
  }, [fetchActiveBooking])

  // Timer for check-in countdown (for pending status)
  useEffect(() => {
    if (!activeBooking || activeBooking.status !== 'pending') return
    if (!activeBooking.checkInDeadline) return

    const interval = setInterval(() => {
      const deadline = new Date(activeBooking.checkInDeadline)
      const now = new Date()
      const diff = deadline - now

      if (diff <= 0) {
        setCheckInCountdown({ minutes: 0, seconds: 0, expired: true })
        clearInterval(interval)
        // Refetch to get updated status
        fetchActiveBooking()
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setCheckInCountdown({ minutes, seconds, expired: false })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeBooking, fetchActiveBooking])

  // Timer for elapsed parking time (for confirmed status)
  useEffect(() => {
    if (!activeBooking || activeBooking.status !== 'confirmed') return

    const interval = setInterval(() => {
      const start = new Date(activeBooking.actualStartTime || activeBooking.startTime)
      const now = new Date()
      const diff = now - start

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeElapsed(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [activeBooking])

  // Calculate estimated cost (3 hours free, then 10 THB/hour)
  const calculateEstimatedCost = () => {
    if (!activeBooking || activeBooking.status !== 'confirmed') return { bookingFee: 20, overtime: 0, total: 20 }
    
    const start = new Date(activeBooking.actualStartTime || activeBooking.startTime)
    const now = new Date()
    const hoursElapsed = (now - start) / (1000 * 60 * 60)
    
    const freeHours = activeBooking.pricing?.freeHours || 3
    const overtimeRate = activeBooking.pricing?.overtimeRate || 10
    const bookingFee = activeBooking.pricing?.bookingFee || 20
    
    const chargeableHours = Math.max(0, Math.ceil(hoursElapsed) - freeHours)
    const overtimeCost = chargeableHours * overtimeRate
    
    return {
      bookingFee,
      overtime: overtimeCost,
      total: bookingFee + overtimeCost,
      freeHours,
      hoursElapsed: hoursElapsed.toFixed(2)
    }
  }

  // Handle Check-in (QR scan confirmation)
  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const response = await bookingAPI.checkIn(activeBooking.id || activeBooking.bookingId)
      if (response.data?.success) {
        toast.success('Check-in สำเร็จ! ยินดีต้อนรับ')
        fetchActiveBooking()
        setShowCheckInModal(false)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการ check-in'
      toast.error(msg)
      if (error.response?.data?.message?.includes('หมดเวลา')) {
        clearActiveBooking()
        navigate('/app')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Check-out
  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const response = await bookingAPI.checkOut(activeBooking.id || activeBooking.bookingId)
      if (response.data?.success) {
        setCheckOutData(response.data.data)
        setShowCheckOutModal(true)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการ check-out'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOutComplete = () => {
    toast.success('ขอบคุณที่ใช้บริการ!')
    clearActiveBooking()
    navigate('/app')
  }

  // Handle Cancel Booking
  const handleCancelBooking = async () => {
    setLoading(true)
    
    try {
      const response = await bookingAPI.cancelBooking(activeBooking.id || activeBooking.bookingId)
      clearActiveBooking()
      toast.success(response.data?.message || 'ยกเลิกการจองเรียบร้อย')
      navigate('/app')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาด'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setShowCancelModal(false)
    }
  }

  // No active booking state
  if (pageLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </motion.div>
      </div>
    )
  }

  if (!activeBooking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full mx-auto"
        >
          <Card className="text-center p-6 sm:p-8 lg:p-12 shadow-2xl border-2 border-gray-100">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="inline-flex items-center justify-center w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-red-400 via-red-500 to-pink-500 rounded-3xl mb-8 shadow-xl"
            >
              <Car className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 px-4"
            >
              ไม่มีการจอง
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed px-4"
            >
              คุณไม่มีการจองที่จอดรถในขณะนี้
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Link to="/app" className="block">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full max-w-sm mx-auto block text-base lg:text-lg font-bold py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ไปจองที่จอด
                </motion.button>
              </Link>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    )
  }

  const cost = calculateEstimatedCost()
  const isPending = activeBooking.status === 'pending'
  const isConfirmed = activeBooking.status === 'confirmed'

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            {/* Header Image */}
            <div className="relative h-64 bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center">
              <div className="text-9xl">🏛️</div>
              <div className={`absolute top-4 right-4 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg ${
                isPending 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                {isPending ? 'รอ Check-in' : 'กำลังจอด'}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Spot Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    ที่จอด {activeBooking.spotName || bookingData?.spot?.spotNumber || 'N/A'}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span>{activeBooking.floor || bookingData?.spot?.floor} - {activeBooking.zone || bookingData?.zone?.name}</span>
                  </div>
                </div>
                
                {/* Timer Display */}
                <div className="text-right">
                  {isPending ? (
                    <>
                      <p className="text-sm text-orange-600 mb-1 font-semibold">เวลาที่เหลือ Check-in</p>
                      <div className={`flex items-center gap-2 text-3xl font-bold ${
                        checkInCountdown.expired || checkInCountdown.minutes < 5 
                          ? 'text-red-600' 
                          : 'text-orange-600'
                      }`}>
                        <Timer className="w-8 h-8" />
                        {checkInCountdown.expired 
                          ? 'หมดเวลา!' 
                          : `${String(checkInCountdown.minutes).padStart(2, '0')}:${String(checkInCountdown.seconds).padStart(2, '0')}`
                        }
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-1">เวลาที่จอด</p>
                      <div className="flex items-center gap-2 text-3xl font-bold text-primary-600">
                        <Clock className="w-8 h-8" />
                        {timeElapsed}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pending Status - Check-in Warning */}
              {isPending && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-6 border-2 ${
                    checkInCountdown.expired || checkInCountdown.minutes < 5 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-orange-50 border-orange-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      checkInCountdown.expired ? 'bg-red-200' : 'bg-orange-200'
                    }`}>
                      <AlertCircle className={`w-8 h-8 ${
                        checkInCountdown.expired ? 'text-red-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        checkInCountdown.expired ? 'text-red-800' : 'text-orange-800'
                      }`}>
                        {checkInCountdown.expired 
                          ? '⚠️ หมดเวลา Check-in แล้ว' 
                          : '⏰ กรุณามาถึงที่จอดและ Check-in'
                        }
                      </h3>
                      <p className={`${checkInCountdown.expired ? 'text-red-700' : 'text-orange-700'}`}>
                        {checkInCountdown.expired 
                          ? 'การจองของคุณถูกยกเลิกอัตโนมัติ ค่าจอง 20 บาทไม่สามารถคืนได้' 
                          : `ต้อง Check-in ภายใน 30 นาที ไม่งั้นระบบจะยกเลิกอัตโนมัติ (ค่าจอง 20 บาทไม่คืน)`
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Pricing Info - Only show when confirmed */}
              {isConfirmed && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center border-2 border-blue-200">
                    <p className="text-gray-600 text-sm mb-1">ค่าจอง</p>
                    <p className="text-2xl font-bold text-blue-600">{cost.bookingFee} ฿</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center border-2 border-orange-200">
                    <p className="text-gray-600 text-sm mb-1">ค่าเกิน 3 ชม.</p>
                    <p className="text-2xl font-bold text-orange-600">{cost.overtime} ฿</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center border-2 border-green-200">
                    <p className="text-gray-600 text-sm mb-1">รวม</p>
                    <p className="text-2xl font-bold text-green-600">{cost.total} ฿</p>
                  </div>
                </div>
              )}

              {/* Free Hours Info - when confirmed */}
              {isConfirmed && cost.overtime === 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                  <p className="text-blue-800 text-center font-semibold">
                    🎉 ยังอยู่ในช่วง 3 ชั่วโมงแรกฟรี! คุณจ่ายแค่ค่าจอง 20 บาท
                  </p>
                </div>
              )}

              {/* Booking Fee Info - when pending */}
              {isPending && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-semibold">ค่าธรรมเนียมการจอง</span>
                    <span className="text-2xl font-bold text-blue-600">20 ฿</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    • 3 ชั่วโมงแรกฟรี หลังจากนั้น 10 บาท/ชม.
                  </p>
                </div>
              )}

              {/* QR Code Section - for Check-in (pending) */}
              {isPending && !checkInCountdown.expired && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center">
                  <div className="flex items-start gap-3 text-left mb-4">
                    <Scan className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <p className="text-yellow-800">
                      เมื่อถึงที่จอดแล้ว กรุณากดปุ่มด้านล่างเพื่อยืนยันการเข้าจอด (Check-in)
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowCheckInModal(true)}
                    icon={QrCode}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    disabled={loading}
                  >
                    Check-in ตอนนี้
                  </Button>
                </div>
              )}

              {/* QR Code Display - for confirmed */}
              {isConfirmed && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                  <div className="flex items-start gap-3 text-left mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-green-800">
                      คุณได้ Check-in แล้ว! สามารถแสดง QR Code สำหรับตรวจสอบได้
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowQRModal(true)}
                    icon={QrCode}
                    className="w-full"
                  >
                    แสดง QR Code
                  </Button>
                </div>
              )}

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-lg mb-4">รายละเอียดการจอง</h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">เลขที่การจอง</span>
                  <span className="font-mono font-bold">#{String(activeBooking.bookingId || activeBooking.id).slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สถานะ</span>
                  <span className={`font-bold ${isPending ? 'text-yellow-600' : 'text-green-600'}`}>
                    {isPending ? 'รอ Check-in' : 'กำลังจอด'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เวลาจอง</span>
                  <span className="font-bold">
                    {new Date(activeBooking.startTime).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {activeBooking.actualStartTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">เวลา Check-in</span>
                    <span className="font-bold text-green-600">
                      {new Date(activeBooking.actualStartTime).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">วันที่</span>
                  <span className="font-bold">
                    {new Date(activeBooking.startTime).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {activeBooking.vehicle && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">รถ</span>
                    <span className="font-bold">{activeBooking.vehicle.licensePlate} ({activeBooking.vehicle.brand})</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Check-out button - only when confirmed */}
                {isConfirmed && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Check-out เสร็จสิ้นการจอด
                  </Button>
                )}

                {/* Cancel button */}
                {!checkInCountdown.expired && (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full"
                    disabled={loading}
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    ยกเลิกการจอง
                  </Button>
                )}

                {/* Expired - Go back */}
                {checkInCountdown.expired && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      clearActiveBooking()
                      navigate('/app')
                    }}
                    className="w-full"
                  >
                    กลับหน้าหลัก
                  </Button>
                )}
              </div>

              {/* Help */}
              <div className="text-center">
                <Link to="/app/help" className="text-primary-600 hover:underline text-sm">
                  ต้องการความช่วยเหลือ?
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Check-in Confirmation Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="ยืนยัน Check-in"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
            <Scan className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-green-800 mb-2">
              คุณมาถึงที่จอดแล้วใช่ไหม?
            </h4>
            <p className="text-green-700">
              กดยืนยันเพื่อเริ่มนับเวลาจอดรถ
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 หมายเหตุ:</strong> 3 ชั่วโมงแรกฟรี หลังจากนั้น 10 บาท/ชั่วโมง
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => setShowCheckInModal(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              onClick={handleCheckIn}
              loading={loading}
            >
              ยืนยัน Check-in
            </Button>
          </div>
        </div>
      </Modal>

      {/* Check-out Complete Modal */}
      <Modal
        isOpen={showCheckOutModal}
        onClose={handleCheckOutComplete}
        title="Check-out สำเร็จ!"
      >
        {checkOutData && (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-green-800 mb-2">
                ขอบคุณที่ใช้บริการ!
              </h4>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-lg">สรุปค่าใช้จ่าย</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">เวลาจอด</span>
                <span className="font-bold">
                  {checkOutData.duration?.hours} ชม. {checkOutData.duration?.minutes} นาที
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ค่าจอง</span>
                <span className="font-bold">{checkOutData.pricing?.bookingFee} ฿</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ค่าจอดเกิน 3 ชม.</span>
                <span className="font-bold">{checkOutData.pricing?.overtimeCost || 0} ฿</span>
              </div>
              {checkOutData.pricing?.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>ส่วนลด ({checkOutData.pricing?.membershipDiscount})</span>
                  <span className="font-bold">-{checkOutData.pricing?.discountAmount} ฿</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-xl">
                <span className="font-bold">รวมทั้งหมด</span>
                <span className="font-bold text-green-600">{checkOutData.pricing?.totalCost} ฿</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
              onClick={handleCheckOutComplete}
            >
              กลับหน้าหลัก
            </Button>
          </div>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="QR Code การจอง"
      >
        {activeBooking?.qrCode?.qrCodeURL ? (
          <QRCodeDisplay 
            booking={activeBooking}
            qrCodeURL={activeBooking.qrCode.qrCodeURL}
            onClose={() => setShowQRModal(false)}
          />
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-white p-8 rounded-3xl inline-block border-4 border-primary-500">
              <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="font-mono text-lg font-bold mb-2">
                #{String(activeBooking.bookingId || activeBooking.id).slice(-8)}
              </p>
              <p className="text-sm text-gray-600">QR Code สำหรับตรวจสอบการจอง</p>
            </div>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowQRModal(false)}
              className="w-full"
            >
              ปิด
            </Button>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="ยืนยันการยกเลิก"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-red-800 mb-2">คุณแน่ใจหรือไม่?</h4>
                <p className="text-red-700 mb-2">
                  การยกเลิกจะส่งผลให้คุณสูญเสียที่จอดนี้
                </p>
                <p className="text-red-600 font-semibold">
                  ⚠️ ค่าจอง 20 บาทจะไม่สามารถคืนได้
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => setShowCancelModal(false)}
              disabled={loading}
            >
              เก็บไว้
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="flex-1"
              onClick={handleCancelBooking}
              loading={loading}
            >
              ยืนยันยกเลิก
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ActiveBooking
