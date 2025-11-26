import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Car, MapPin, Trophy, CheckCircle, Star, ArrowRight, Zap, Shield, Clock, X, Smartphone, CreditCard, QrCode, Bell, Search, CarFront } from 'lucide-react'
import Button from '../components/ui/Button'

const Landing = () => {
  const [showHowToUse, setShowHowToUse] = useState(false)
  
  const features = [
    {
      icon: Zap,
      title: 'จองได้ทันที',
      description: 'ระบบจองที่จอดแบบ Real-time ไม่ต้องรอนาน',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'ปลอดภัย',
      description: 'การชำระเงินที่ปลอดภัยและมั่นคง',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'ประหยัดเวลา',
      description: 'ลดเวลาในการหาที่จอดได้ถึง 70%',
      gradient: 'from-blue-400 to-cyan-500'
    },
  ]
  
  const testimonials = [
    {
      name: 'คุณสมชาย',
      role: 'นักศึกษา',
      content: 'ใช้งานง่ายมาก ประหยัดเวลาในการหาที่จอดได้เยอะเลย ไม่ต้องวนหาที่จอดอีกต่อไป',
      rating: 5,
      avatar: '👨‍🎓'
    },
    {
      name: 'คุณสมหญิง',
      role: 'อาจารย์',
      content: 'ระบบดีมาก สะดวก รวดเร็ว แนะนำเลยค่ะ',
      rating: 5,
      avatar: '👩‍🏫'
    },
    {
      name: 'คุณสมศักดิ์',
      role: 'เจ้าหน้าที่',
      content: 'ชอบระบบสิทธิพิเศษมาก คุ้มค่ากับการจ่ายเงินรายเดือน',
      rating: 5,
      avatar: '👨‍💼'
    },
  ]
  
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Car className="w-7 h-7 text-white" />
            </motion.div>
            <span className="text-2xl font-bold gradient-text">SciPark</span>
          </Link>
          
          <Link to="/login">
            <Button variant="primary" size="md">
              เข้าสู่ระบบ
            </Button>
          </Link>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.h1 
                  className="text-6xl lg:text-7xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-red-500">หยุด</span> ค้นหา,<br />
                  <span className="text-blue-600">เริ่ม</span> จอด.<br />
                  <span className="text-orange-500">รับประกัน</span>ที่จอด<br />
                  <span className="gradient-text">ทันทีกับ SciPark</span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-gray-600 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  ระบบจองที่จอดรถอัจฉริยะ ง่าย รวดเร็ว ปลอดภัย<br />
                  <span className="font-semibold text-primary-600">
                    Real-time availability • Instant booking • Secure payment
                  </span>
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/register">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    เริ่มต้นใช้งานฟรี
                  </Button>
                </Link>
                <Button variant="secondary" size="lg" onClick={() => setShowHowToUse(true)}>
                  เรียนรู้เพิ่มเติม
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full opacity-20 blur-3xl"
                />
                <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl p-12 shadow-2xl">
                  <div className="text-9xl text-center mb-8">🏢</div>
                  <div className="flex justify-center gap-8 text-7xl">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      🚗
                    </motion.div>
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                      🚙
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">ทำไมต้อง SciPark?</h2>
            <p className="text-xl text-gray-600">ฟีเจอร์ที่ทำให้การจอดรถง่ายขึ้น</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="card p-8"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">ผู้ใช้งานพูดถึงเรา</h2>
            <p className="text-xl text-gray-600">ความคิดเห็นจากผู้ใช้งานจริง</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="card p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight px-4">
              พร้อมที่จะเริ่มต้น
              <br className="sm:hidden" />
              แล้วหรือยัง?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold px-4">
              เริ่มต้นใช้งานฟรีวันนี้
            </p>
            <div className="flex justify-center px-4">
              <Link to="/register" className="inline-block w-full max-w-xs">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-white text-orange-600 hover:bg-gray-50 font-bold text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl shadow-2xl hover:shadow-orange-900/30 transition-all duration-300"
                >
                  ลงทะเบียนเลย
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Car className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold">SciPark</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <Link to="/terms" className="hover:text-white transition-colors">
                เงื่อนไขการใช้งาน
              </Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-white transition-colors">
                นโยบายความเป็นส่วนตัว
              </Link>
              <span>•</span>
              <a href="mailto:support@scipark.com" className="hover:text-white transition-colors">
                ติดต่อเรา
              </a>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 SciPark. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* How to Use Modal */}
      {showHowToUse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHowToUse(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-3xl font-bold gradient-text">วิธีใช้งาน SciPark</h2>
              <button
                onClick={() => setShowHowToUse(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold">ลงทะเบียน & เข้าสู่ระบบ</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    สมัครสมาชิกด้วย Email หรือ Username ของคุณ เพียงไม่กี่ขั้นตอน 
                    คุณก็พร้อมใช้งานระบบจองที่จอดรถอัจฉริยะของเราได้ทันที
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Search className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-bold">เลือกโซนที่จอดรถ</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    ดูจำนวนที่ว่างแบบ Real-time ในแต่ละโซน เลือกโซนที่ใกล้จุดหมายของคุณมากที่สุด
                    ระบบจะแสดงจำนวนที่ว่างและราคาอย่างชัดเจน
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CarFront className="w-6 h-6 text-orange-500" />
                    <h3 className="text-xl font-bold">ยืนยันการจอง</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    กดจองที่จอด ระบบจะจองที่ให้คุณทันที! คุณมีเวลา 30 นาทีในการเดินทางมาถึงที่จอด
                    ค่าจอง 20 บาท/ครั้ง และ 3 ชั่วโมงแรกฟรี!
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <QrCode className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-bold">Check-in ด้วย QR Code</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    เมื่อถึงที่จอดแล้ว กด Check-in เพื่อยืนยันว่าคุณมาถึง 
                    ระบบจะเริ่มนับเวลาจอดจากตรงนี้ (3 ชม.แรกฟรี!)
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  5
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-6 h-6 text-pink-500" />
                    <h3 className="text-xl font-bold">Check-out & ชำระเงิน</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    เมื่อจอดเสร็จ กด Check-out ระบบจะคำนวณค่าจอดให้อัตโนมัติ
                    3 ชม.แรกฟรี หลังจากนั้น 10 บาท/ชม. สมาชิกระดับสูงได้ส่วนลดเพิ่ม!
                  </p>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-blue-500" />
                  อัตราค่าบริการ
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <p className="text-3xl font-bold text-blue-600">20฿</p>
                    <p className="text-gray-600 text-sm">ค่าจอง/ครั้ง</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <p className="text-3xl font-bold text-green-600">ฟรี!</p>
                    <p className="text-gray-600 text-sm">3 ชม.แรก</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <p className="text-3xl font-bold text-orange-600">10฿</p>
                    <p className="text-gray-600 text-sm">ต่อชม. (หลัง 3 ชม.)</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-4">
                <Link to="/register" onClick={() => setShowHowToUse(false)}>
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    เริ่มต้นใช้งานเลย!
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Landing
