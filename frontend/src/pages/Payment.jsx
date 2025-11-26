import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Wallet, QrCode, CheckCircle, ArrowLeft, Clock } from 'lucide-react'
import { useBookingStore } from '../stores/bookingStore'
import { bookingAPI } from '../utils/apiService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import toast from 'react-hot-toast'

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearActiveBooking } = useBookingStore()
  
  const { booking, cost } = location.state || {}
  const [paymentMethod, setPaymentMethod] = useState('credit')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!booking || cost === undefined) {
      navigate('/app')
    }
  }, [booking, cost, navigate])

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Call real API to complete booking
      if (booking?.id) {
        await bookingAPI.completeBooking(booking.id)
      }
      
      setSuccess(true)
      
      // Clear booking after 3 seconds
      setTimeout(() => {
        clearActiveBooking()
        navigate('/app')
        toast.success('ขอบคุณที่ใช้บริการ SciPark! 🎉')
      }, 3000)
      
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error.response?.data?.message || 'การชำระเงินล้มเหลว กรุณาลองใหม่'
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  if (!booking) return null

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="bg-green-100 w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>
          
          <h1 className="text-5xl font-bold mb-4">ชำระเงินสำเร็จ!</h1>
          <p className="text-xl text-gray-600 mb-8">
            ขอบคุณที่ใช้บริการ SciPark
          </p>
          
          <div className="bg-gray-50 rounded-3xl p-6 mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">เลขที่การจอง</span>
              <span className="font-mono font-bold">#{booking.id}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">ที่จอด</span>
              <span className="font-bold">{booking.spotName || 'A-10'}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-green-600">
              <span>ยอดชำระ</span>
              <span>{cost} ฿</span>
            </div>
          </div>

          <p className="text-sm text-gray-500">กำลังกลับไปหน้าหลัก...</p>
        </motion.div>
      </div>
    )
  }

  const start = new Date(booking.actualStartTime || booking.startTime)
  const now = new Date()
  const hoursElapsed = (now - start) / (1000 * 60 * 60)
  const freeHours = 3 // 3 ชม.แรกฟรี
  const chargeableHours = Math.max(0, Math.ceil(hoursElapsed) - freeHours)
  const bookingFee = booking.pricing?.bookingFee || 20 // ค่าจอง 20 บาท

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            กลับ
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-2">ชำระเงิน</h1>
          <p className="text-xl text-gray-600">เลือกวิธีชำระเงินที่คุณต้องการ</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">เลือกวิธีชำระเงิน</h2>
                  
                  <div className="space-y-4">
                    {/* Credit Card */}
                    <div
                      className={`border-3 rounded-2xl p-6 cursor-pointer transition-all ${
                        paymentMethod === 'credit'
                          ? 'border-primary-500 bg-primary-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('credit')}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          paymentMethod === 'credit' ? 'bg-primary-500' : 'bg-gray-100'
                        }`}>
                          <CreditCard className={`w-8 h-8 ${
                            paymentMethod === 'credit' ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">บัตรเครดิต/เดบิต</h3>
                          <p className="text-sm text-gray-600">Visa, Mastercard, JCB</p>
                        </div>
                        {paymentMethod === 'credit' && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Banking */}
                    <div
                      className={`border-3 rounded-2xl p-6 cursor-pointer transition-all ${
                        paymentMethod === 'mobile'
                          ? 'border-primary-500 bg-primary-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('mobile')}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          paymentMethod === 'mobile' ? 'bg-primary-500' : 'bg-gray-100'
                        }`}>
                          <Wallet className={`w-8 h-8 ${
                            paymentMethod === 'mobile' ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">Mobile Banking</h3>
                          <p className="text-sm text-gray-600">ธนาคารทุกธนาคาร</p>
                        </div>
                        {paymentMethod === 'mobile' && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QR Payment */}
                    <div
                      className={`border-3 rounded-2xl p-6 cursor-pointer transition-all ${
                        paymentMethod === 'qr'
                          ? 'border-primary-500 bg-primary-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('qr')}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          paymentMethod === 'qr' ? 'bg-primary-500' : 'bg-gray-100'
                        }`}>
                          <QrCode className={`w-8 h-8 ${
                            paymentMethod === 'qr' ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">QR Payment</h3>
                          <p className="text-sm text-gray-600">Scan จ่ายผ่าน Mobile Banking</p>
                        </div>
                        {paymentMethod === 'qr' && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Form - Only for Credit Card */}
                  {paymentMethod === 'credit' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-semibold mb-2">หมายเลขบัตร</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">วันหมดอายุ</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">ชื่อบนบัตร</label>
                        <input
                          type="text"
                          placeholder="JOHN DOE"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* QR Code Display */}
                  {paymentMethod === 'qr' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t"
                    >
                      <div className="text-center">
                        <div className="bg-white p-6 rounded-3xl inline-block border-4 border-primary-500 mb-4">
                          <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center">
                            {/* Mock QR Code */}
                            <div className="grid grid-cols-6 gap-1">
                              {Array.from({ length: 36 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-lg font-bold mb-2">สแกน QR Code เพื่อชำระเงิน</p>
                        <p className="text-gray-600">ยอดชำระ: {cost} ฿</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">สรุปการจอง</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">เลขที่การจอง</span>
                      <span className="font-mono font-bold text-sm">#{booking.id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">ที่จอด</span>
                      <span className="font-bold">{booking.spotName || 'A-10'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">ชั้น</span>
                      <span className="font-bold">{booking.floor || 'ชั้น 1'}</span>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">ระยะเวลาจอด</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {Math.floor(hoursElapsed)} ชม. {Math.round((hoursElapsed % 1) * 60)} นาที
                      </p>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ค่าจอง</span>
                        <span className="font-bold text-blue-600">{bookingFee} ฿</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">3 ชม.แรก</span>
                        <span className="font-bold text-green-600">ฟรี!</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ค่าจอดเกิน ({chargeableHours} ชม.)</span>
                        <span className="font-bold">{chargeableHours * (booking.pricing?.overtimeRate || 10)} ฿</span>
                      </div>
                      
                      {chargeableHours === 0 && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                          <p className="text-green-800 text-sm font-semibold text-center">
                            🎉 ยังอยู่ใน 3 ชม.แรกฟรี!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-xl font-bold">
                        <span>ยอดชำระทั้งหมด</span>
                        <span className="text-green-600">{bookingFee + (chargeableHours * (booking.pricing?.overtimeRate || 10))} ฿</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Payment Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={handlePayment}
                loading={loading}
                disabled={success}
              >
                {loading ? 'กำลังดำเนินการ...' : `ชำระเงิน ${cost} ฿`}
              </Button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  การชำระเงินมีความปลอดภัย เข้ารหัสด้วย SSL
                </p>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                <h4 className="font-bold text-blue-900 mb-2">💡 ข้อมูลเพิ่มเติม</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• ค่าจอง 20 บาท/ครั้ง</li>
                  <li>• 3 ชม.แรกฟรี!</li>
                  <li>• หลัง 3 ชม. คิด {booking.pricing?.overtimeRate || 10} ฿/ชม.</li>
                  <li>• สมาชิกได้รับส่วนลดเพิ่ม</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
