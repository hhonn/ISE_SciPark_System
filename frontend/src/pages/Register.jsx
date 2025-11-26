import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, Mail, User, Lock, Eye, EyeOff, Phone } from 'lucide-react'
import { authAPI } from '../utils/apiService'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
    }
    
    if (!formData.email) {
      newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }
    
    if (!formData.username) {
      newErrors.username = 'กรุณากรอก username'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username ต้องมีอย่างน้อย 3 ตัวอักษร'
    }
    
    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน'
    } else if (formData.password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      toast.error('กรุณาตรวจสอบข้อมูลให้ถูกต้อง')
      return
    }

    setLoading(true)
    
    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone
      })
      
      toast.success('ลงทะเบียนสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...')
      
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      
    } catch (error) {
      console.error('Register error:', error)
      toast.error(error.response?.data?.message || error.response?.data?.error || 'ลงทะเบียนไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Car className="w-10 h-10 text-secondary-600" />
            </motion.div>
            <span className="text-5xl font-bold text-white">SciPark</span>
          </Link>
          <p className="text-secondary-200 text-lg">Smart Parking System</p>
        </div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center mb-2">สร้างบัญชีใหม่</h2>
          <p className="text-gray-600 text-center mb-8">เริ่มต้นใช้งาน SciPark ฟรี!</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="ชื่อ-นามสกุล"
              type="text"
              icon={User}
              placeholder="กรอกชื่อ-นามสกุลของคุณ"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              error={errors.name}
              required
            />
            
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="your-email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              error={errors.email}
              required
            />
            
            <Input
              label="Username"
              type="text"
              icon={User}
              placeholder="เลือก username ของคุณ"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              error={errors.username}
              required
            />
            
            <Input
              label="เบอร์โทรศัพท์ (ไม่บังคับ)"
              type="tel"
              icon={Phone}
              placeholder="08X-XXX-XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="สร้างรหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                error={errors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                error={errors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input type="checkbox" required className="mt-1 rounded border-gray-300" />
              <label className="text-gray-600">
                ฉันยอมรับ{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">
                  เงื่อนไขการใช้งาน
                </Link>{' '}
                และ{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              ลงทะเบียน
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register
