import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, AlertCircle, Info, ArrowLeft } from 'lucide-react'
import { useBookingStore } from '../stores/bookingStore'
import { useAuthStore } from '../stores/authStore'
import { parkingAPI, bookingAPI } from '../utils/apiService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

const ParkingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { activeBooking, setActiveBooking } = useBookingStore()
  const [parkingSpot, setParkingSpot] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchParkingSpot()
  }, [id])

  const fetchParkingSpot = async () => {
    try {
      // Fetch zone data with spots from API
      const response = await parkingAPI.getZoneById(id)
      
      const zone = response.data.zone
      const spots = response.data.spots || []
      
      if (zone) {
        
        // Group spots by floor
        const floorGroups = {}
        spots.forEach(spot => {
          if (!floorGroups[spot.floor]) {
            floorGroups[spot.floor] = []
          }
          floorGroups[spot.floor].push(spot)
        })
        
        // Create floors array with availability
        const floors = Object.keys(floorGroups).map(floorName => ({
          name: floorName,
          available: floorGroups[floorName].filter(s => s.status === 'available').length
        }))
        
        // Set parking spot data
        const zoneIcons = {
          'CHULA': '🏛️',
          'PRAJOM': '🏢',
          'BEHIND': '🌳',
          'DEAN': '👔',
          'FRONT': '🚪'
        }
        
        setParkingSpot({
          id: zone.id || zone._id,
          name: zone.name,
          zone: zone.zoneName,
          available: zone.availableSpots || 0,
          total: zone.totalSpots || 0,
          pricePerHour: zone.hourlyRate || 10,
          bookingFee: 20, // ค่าจองต่อครั้ง
          image: zoneIcons[zone.zoneName] || '🏢',
          description: zone.description || 'ที่จอดรถสะดวกสบาย',
          building: zone.building,
          floors: floors,
          facilities: ['รปภ. 24 ชม.', 'กล้อง CCTV', 'ไฟส่องสว่าง'],
          rules: [
            'ค่าจอง 20 บาท/ครั้ง (ไม่คืนหากยกเลิก)',
            '3 ชั่วโมงแรกฟรี!',
            'หลัง 3 ชม. คิด ' + (zone.hourlyRate || 10) + ' บาท/ชม.',
            'ต้อง Check-in ภายใน 30 นาที',
            'กรุณาจอดรถในช่องที่กำหนด'
          ]
        })
        
        if (floors.length > 0) {
          setSelectedFloor(floors[0])
        }
      } else {
        // Zone not found, use fallback
        toast.error('ไม่พบข้อมูลโซนจอดรถ')
        navigate('/app')
      }
    } catch (error) {
      console.error('Error fetching parking spot:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    }
  }

  const handleBooking = async () => {
    if (activeBooking) {
      toast.error('คุณมีการจองอยู่แล้ว กรุณายกเลิกก่อนทำรายการใหม่')
      return
    }

    setShowConfirmModal(true)
  }

  const confirmBooking = async () => {
    setLoading(true)
    
    try {
      // Call real API to create booking
      const response = await bookingAPI.createBooking({
        spotId: parkingSpot.id,
        floor: selectedFloor?.name || 'ชั้น 1'
      })
      
      if (response.data.success) {
        const bookingData = response.data.data
        
        // Create booking object for store (ตรงกับ flow ใหม่: pending → confirmed → completed)
        const booking = {
          id: bookingData.bookingId,
          bookingId: bookingData.bookingId,
          spotId: bookingData.spot.id,
          spotName: bookingData.spot.spotNumber || bookingData.spot.name || parkingSpot.name,
          floor: bookingData.spot.floor || selectedFloor?.name || 'N/A',
          startTime: bookingData.startTime,
          checkInDeadline: bookingData.checkInDeadline,
          price: parkingSpot.pricePerHour,
          status: bookingData.status || 'pending', // pending จนกว่าจะ check-in
          zone: bookingData.zone?.name || parkingSpot.zone,
          qrCode: bookingData.qrCode,
          pricing: bookingData.pricing, // { bookingFee: 20, freeHours: 3, overtimeRate: 10 }
          isCheckedIn: false
        }
        
        setActiveBooking(booking)
        toast.success('จองสำเร็จ! 🎉')
        
        setTimeout(() => {
          navigate('/app/booking')
        }, 1000)
      } else {
        throw new Error(response.data.message || 'การจองล้มเหลว')
      }
      
    } catch (error) {
      console.error('Booking error:', error)
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setShowConfirmModal(false)
    }
  }

  if (!parkingSpot) {
    return <div className="p-6">Loading...</div>
  }

  const discount = user?.rank === 'Diamond' ? 10 : user?.rank === 'Predator' ? 15 : 0
  const finalPrice = parkingSpot.pricePerHour - (parkingSpot.pricePerHour * discount / 100)

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link to="/app">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับ</span>
          </motion.button>
        </Link>

        <Card>
          {/* Image Header */}
          <div className="relative h-80 bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
            <div className="text-9xl">{parkingSpot.image}</div>
            <div className="absolute top-4 right-4">
              {parkingSpot.available > 0 ? (
                <Badge variant="success" size="lg">
                  ว่าง {parkingSpot.available} ที่
                </Badge>
              ) : (
                <Badge variant="danger" size="lg">
                  เต็ม
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Title & Description */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{parkingSpot.name}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-5 h-5" />
                <span>โซน {parkingSpot.zone}</span>
              </div>
              <p className="text-gray-600 text-lg">{parkingSpot.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">ที่ว่าง</p>
                <p className="text-3xl font-bold text-green-600">{parkingSpot.available}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">ทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{parkingSpot.total}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">Rank คุณ</p>
                <p className="text-2xl font-bold text-purple-600">{user?.rank || 'Iron'}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">ส่วนลด</p>
                <p className="text-3xl font-bold text-orange-600">{discount}%</p>
              </div>
            </div>

            {/* Floors Selection (แสดงเฉพาะถ้ามีหลายชั้น และไม่ใช่ลานจอด) */}
            {parkingSpot.floors && parkingSpot.floors.length > 1 && 
             !parkingSpot.floors.every(f => f.name === 'ลานจอด') && (
              <div>
                <h3 className="text-xl font-bold mb-4">เลือกชั้นที่ต้องการ</h3>
                <div className="space-y-3">
                  {parkingSpot.floors.map((floor, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedFloor(floor)}
                      className={`
                        w-full p-4 rounded-2xl border-2 text-left transition-all
                        ${selectedFloor?.name === floor.name
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                        }
                        ${floor.available === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={floor.available === 0}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-lg">{floor.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">ว่าง</p>
                          <p className={`text-2xl font-bold ${floor.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {floor.available}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Auto-select Info (สำหรับลานจอด) */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-800 mb-1">ระบบจัดช่องจอดให้อัตโนมัติ</h4>
                  <p className="text-blue-700 text-sm">
                    เมื่อยืนยันการจอง ระบบจะจัดช่องจอดที่ว่างให้คุณโดยอัตโนมัติ 
                    (เช่น A01, B02, C03)
                  </p>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                ค่าใช้จ่าย
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">ค่าจอง (ต่อครั้ง)</span>
                  <span className="text-xl font-bold text-blue-600">
                    20 ฿
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">3 ชม. แรก</span>
                  <span className="text-xl font-bold text-green-600">
                    ฟรี!
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">หลัง 3 ชม.</span>
                  <span className="text-xl font-bold text-gray-900">
                    {parkingSpot.pricePerHour} ฿/ชม.
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">ส่วนลด ({user?.rank})</span>
                    <span className="text-xl font-bold text-green-600">
                      -{discount}% (ค่าจอดเกิน)
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>🎉 3 ชั่วโมงแรกฟรี! หลังจากนั้นคิด {parkingSpot.pricePerHour} บาท/ชม.</span>
                </p>
              </div>
            </div>

            {/* Facilities */}
            {parkingSpot.facilities && (
              <div>
                <h3 className="text-xl font-bold mb-4">สิ่งอำนวยความสะดวก</h3>
                <div className="flex flex-wrap gap-2">
                  {parkingSpot.facilities.map((facility, index) => (
                    <Badge key={index} variant="default" size="md">
                      ✓ {facility}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {parkingSpot.rules && (
              <div>
                <h3 className="text-xl font-bold mb-4">กฎและข้อตกลง</h3>
                <ul className="space-y-2">
                  {parkingSpot.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <span className="text-primary-600 mt-1">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800 mb-1">สำคัญ!</h4>
                  <p className="text-red-700 mb-2">
                    หากไม่ Check-in ภายใน 30 นาที จะยกเลิกการจองโดยอัตโนมัติ
                  </p>
                  <p className="text-red-600 text-sm font-semibold">
                    ⚠️ ค่าจอง 20 บาทไม่สามารถคืนได้หากยกเลิก
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => navigate('/app')}
              >
                ดูที่จอดอื่น
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleBooking}
                disabled={parkingSpot.available === 0 || !!activeBooking}
              >
                {parkingSpot.available === 0 ? 'เต็มแล้ว' : activeBooking ? 'มีการจองอยู่แล้ว' : 'ยืนยันการจอง'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="ยืนยันการจอง"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ที่จอด</span>
              <span className="font-bold">{parkingSpot.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ประเภท</span>
              <span className="font-bold text-green-600">ลานจอดรถ (เลือกช่องอัตโนมัติ)</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <span className="text-gray-600">ค่าจอง</span>
              <span className="font-bold text-blue-600">20 ฿</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">3 ชม. แรก</span>
              <span className="font-bold text-green-600">ฟรี!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">หลัง 3 ชม.</span>
              <span className="font-bold text-orange-600">{parkingSpot.pricePerHour} ฿/ชม.</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">ส่วนลด ({user?.rank})</span>
                <span className="font-bold text-green-600">-{discount}%</span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-sm text-yellow-800">
              ⏱️ กรุณา Check-in ภายใน 30 นาที มิฉะนั้นจะยกเลิกอัตโนมัติ
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ ค่าจอง 20 บาทไม่สามารถคืนได้หากยกเลิก
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={confirmBooking}
              loading={loading}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ParkingDetail
