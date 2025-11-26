import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { authAPI } from '../utils/apiService'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    setLoading(true)
    
    try {
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password
      })
      
      const { user, token } = response.data
      
      // Save user and token to store (token is also in cookie)
      login(user, token)
      
      toast.success('เข้าสู่ระบบสำเร็จ! 🎉')
      
      navigate('/app')
      
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || error.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    toast.error('Google Login ยังไม่เปิดใช้งาน')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-6">
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
              <Car className="w-10 h-10 text-primary-600" />
            </motion.div>
            <span className="text-5xl font-bold text-white">SciPark</span>
          </Link>
          <p className="text-primary-200 text-lg">Smart Parking System</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center mb-2">ยินดีต้อนรับกลับ</h2>
          <p className="text-gray-600 text-center mb-8">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username หรือ Email"
              type="text"
              icon={Mail}
              placeholder="กรอก username หรือ email"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="กรอกรหัสผ่าน"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-600">จดจำฉัน</span>
              </label>
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              เข้าสู่ระบบ
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">หรือ</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <div className="w-5 h-5 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"></div>
            <span>เข้าสู่ระบบด้วย Google</span>
          </Button>

          <p className="text-center mt-6 text-gray-600">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              ลงทะเบียนเลย
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            <Link to="/terms" className="hover:text-primary-600 hover:underline transition-colors">
              เงื่อนไขการใช้งาน
            </Link>
            {' • '}
            <Link to="/privacy" className="hover:text-primary-600 hover:underline transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
