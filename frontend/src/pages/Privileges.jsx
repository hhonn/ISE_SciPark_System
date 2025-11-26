import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Star, Zap, Shield, Gift, Check, Sparkles } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { privilegesAPI } from '../utils/apiService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

const Privileges = () => {
  const { user, updateUser } = useAuthStore()
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [redeemCode, setRedeemCode] = useState('')
  const [loading, setLoading] = useState(false)

  const tiers = [
    {
      id: 'iron',
      name: 'Iron',
      icon: Shield,
      color: 'gray',
      gradient: 'from-gray-400 to-gray-600',
      price: 0,
      priceText: 'ฟรี',
      discount: 0,
      features: [
        'จองได้ทุกโซน',
        'ประวัติการจอง 7 วัน',
        'แจ้งเตือนพื้นฐาน',
        'รองรับ 1 ยานพาหนะ',
      ],
      current: user?.rank === 'Iron'
    },
    {
      id: 'diamond',
      name: 'Diamond',
      icon: Star,
      color: 'blue',
      gradient: 'from-blue-400 to-blue-600',
      price: 199,
      priceText: '199 ฿/เดือน',
      discount: 10,
      features: [
        'ส่วนลด 10% ทุกการจอด',
        'จองล่วงหน้า 7 วัน',
        'ประวัติการจอดไม่จำกัด',
        'แจ้งเตือนแบบ Real-time',
        'รองรับ 3 ยานพาหนะ',
        'จองช่องพิเศษ',
      ],
      current: user?.rank === 'Diamond',
      popular: true
    },
    {
      id: 'predator',
      name: 'Predator',
      icon: Crown,
      color: 'purple',
      gradient: 'from-purple-400 via-pink-500 to-orange-500',
      price: 399,
      priceText: '399 ฿/เดือน',
      discount: 15,
      features: [
        'ส่วนลด 15% ทุกการจอด',
        'จองล่วงหน้า 30 วัน',
        'ประวัติการจอดไม่จำกัด',
        'แจ้งเตือนแบบ Real-time',
        'รองรับยานพาหนะไม่จำกัด',
        'จองช่องพิเศษ & VIP',
        'ที่จอดแบบจองตลอด',
        'บริการช่วยเหลือ 24/7',
        'โอนสิทธิ์การจองได้',
      ],
      current: user?.rank === 'Predator'
    }
  ]

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan)
    setShowUpgradeModal(true)
  }

  const confirmUpgrade = async () => {
    setLoading(true)
    
    try {
      const response = await privilegesAPI.subscribe(selectedPlan.id, 'credit')
      
      // Update user rank from response or use selected plan
      if (response.data?.user) {
        updateUser(response.data.user)
      } else {
        updateUser({ 
          rank: selectedPlan.name,
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        })
      }
      
      toast.success(`🎉 ยินดีด้วย! คุณได้รับสิทธิ์ ${selectedPlan.name} แล้ว`)
      setShowUpgradeModal(false)
      setSelectedPlan(null)
      
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      toast.error('กรุณากรอกโค้ด')
      return
    }

    setLoading(true)
    
    try {
      const response = await privilegesAPI.redeemCode(redeemCode.trim())
      
      // Update user from response
      if (response.data?.user) {
        updateUser(response.data.user)
      }
      
      toast.success(response.data?.message || '🎉 แลกโค้ดสำเร็จ!')
      setShowRedeemModal(false)
      setRedeemCode('')
      
    } catch (error) {
      console.error('Redeem error:', error)
      toast.error(error.response?.data?.message || 'โค้ดไม่ถูกต้องหรือหมดอายุแล้ว')
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (rankName) => {
    if (rankName === 'Iron') return 'gray'
    if (rankName === 'Diamond') return 'blue'
    if (rankName === 'Predator') return 'purple'
    return 'gray'
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-yellow-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Membership Tiers
            </h1>
            <Sparkles className="w-10 h-10 text-yellow-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            เลือกแผนที่เหมาะกับคุณ เพื่อรับสิทธิพิเศษและส่วนลดมากมาย
          </p>

          {/* Current Tier Display */}
          <div className="mt-8 inline-block">
            <div className="bg-white border-4 border-primary-200 rounded-3xl px-8 py-4 shadow-lg">
              <p className="text-sm text-gray-600 mb-2">สมาชิกปัจจุบันของคุณ</p>
              <div className="flex items-center gap-3">
                <Badge variant={getRankColor(user?.rank || 'Iron')} size="lg">
                  {user?.rank || 'Iron'}
                </Badge>
                <span className="text-2xl font-bold text-gray-800">
                  {user?.points || 0} แต้ม
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {tiers.map((tier, index) => {
            const Icon = tier.icon
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  hover={!tier.current}
                  className={`relative overflow-hidden ${tier.current ? 'ring-4 ring-primary-500 shadow-2xl' : ''} ${tier.popular ? 'shadow-2xl' : ''}`}
                >
                  <div className="p-6 lg:p-8">
                    {/* Badges at Top */}
                    <div className="flex items-center justify-between gap-2 mb-4 min-h-[32px]">
                      {/* Popular Badge */}
                      {tier.popular && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-lg">
                          🔥 แนะนำ
                        </div>
                      )}

                      {/* Current Badge */}
                      {tier.current && (
                        <div className="ml-auto bg-green-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5">
                          <Check className="w-3 h-3" />
                          กำลังใช้งาน
                        </div>
                      )}
                    </div>
                    {/* Icon & Name */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: "spring",
                          delay: index * 0.1 + 0.2,
                          stiffness: 200 
                        }}
                        className={`inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${tier.gradient} rounded-3xl mb-4 shadow-xl ring-4 ring-white`}
                      >
                        <Icon className="w-10 h-10 lg:w-12 lg:h-12 text-white drop-shadow-lg" />
                      </motion.div>
                      
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                        {tier.name}
                      </h3>
                      
                      <div className="mb-2">
                        {tier.id === 'iron' ? (
                          <span className="text-4xl lg:text-5xl font-bold text-gray-600">
                            ฟรี
                          </span>
                        ) : (
                          <div className="flex items-baseline justify-center gap-1">
                            <span className={`text-5xl lg:text-6xl font-bold bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                              {tier.price}
                            </span>
                            <span className="text-2xl font-semibold text-gray-500">฿</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm lg:text-base text-gray-500 font-medium">
                        {tier.priceText}
                      </p>
                    </div>

                    {/* Discount Badge */}
                    {tier.discount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                        className={`text-center mb-6 bg-gradient-to-r ${tier.gradient} text-white py-4 px-4 rounded-2xl font-bold text-base lg:text-lg shadow-lg`}
                      >
                        ส่วนลด {tier.discount}% ทุกการจอด!
                      </motion.div>
                    )}

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {tier.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.5 + i * 0.05 }}
                          className="flex items-start gap-3 group"
                        >
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            tier.current 
                              ? 'bg-green-100' 
                              : 'bg-gray-100'
                          }`}>
                            <Check className={`w-4 h-4 ${
                              tier.current 
                                ? 'text-green-600' 
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <span className="text-sm lg:text-base text-gray-700 leading-relaxed">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    {tier.current ? (
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full font-bold"
                        disabled
                      >
                        กำลังใช้งาน
                      </Button>
                    ) : tier.id === 'iron' ? (
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full font-bold"
                        disabled
                      >
                        แผนพื้นฐาน
                      </Button>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="primary"
                          size="lg"
                          className={`w-full bg-gradient-to-r ${tier.gradient} hover:shadow-xl transition-all duration-300 font-bold text-base lg:text-lg py-4`}
                          onClick={() => handleUpgrade(tier)}
                        >
                          อัพเกรดเลย
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Enhanced Redeem Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-2 border-yellow-300 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-yellow-200/[0.2] bg-[size:20px_20px]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full blur-3xl opacity-30" />

            <div className="relative p-6 sm:p-8 lg:p-12 text-center">
              {/* Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  delay: 0.5
                }}
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl shadow-xl mb-6 ring-4 ring-orange-200"
              >
                <Gift className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white drop-shadow-lg" />
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 px-4">
                มีโค้ดพิเศษ?
              </h3>

              {/* Description */}
              <p className="text-base lg:text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                แลกโค้ดเพื่อรับสิทธิพิเศษ หรือส่วนลดฟรี!
              </p>

              {/* CTA Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowRedeemModal(true)}
                  className="bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 hover:from-yellow-600 hover:via-orange-600 hover:to-orange-700 text-white font-bold text-base lg:text-lg px-8 lg:px-10 py-4 lg:py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center gap-3 w-auto max-w-md"
                >
                  <Gift className="w-5 h-5" />
                  <span>แลกโค้ดตอนนี้</span>
                </motion.button>
              </div>

              {/* Example Code */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 inline-block bg-white/60 backdrop-blur-sm border-2 border-yellow-300 rounded-xl px-4 sm:px-6 py-3 max-w-full mx-4"
              >
                <p className="text-xs sm:text-sm text-gray-600 mb-2">ตัวอย่างโค้ด:</p>
                <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
                  <code className="text-base sm:text-lg font-bold text-orange-600 tracking-wider break-all">
                    SCIPARK2024
                  </code>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                    Diamond 1 เดือน
                  </span>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Benefits Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8">เปรียบเทียบสิทธิพิเศษ</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">คุณสมบัติ</th>
                    <th className="px-6 py-4 text-center font-bold">Iron</th>
                    <th className="px-6 py-4 text-center font-bold">Diamond</th>
                    <th className="px-6 py-4 text-center font-bold">Predator</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4">ส่วนลดค่าจอด</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">10%</td>
                    <td className="px-6 py-4 text-center font-bold text-purple-600">15%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">จองล่วงหน้า</td>
                    <td className="px-6 py-4 text-center">วันเดียว</td>
                    <td className="px-6 py-4 text-center">7 วัน</td>
                    <td className="px-6 py-4 text-center">30 วัน</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">จำนวนยานพาหนะ</td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-center">3</td>
                    <td className="px-6 py-4 text-center">ไม่จำกัด</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">ประวัติการจอด</td>
                    <td className="px-6 py-4 text-center">7 วัน</td>
                    <td className="px-6 py-4 text-center">ไม่จำกัด</td>
                    <td className="px-6 py-4 text-center">ไม่จำกัด</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">ที่จองตลอด</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center">-</td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">บริการช่วยเหลือ</td>
                    <td className="px-6 py-4 text-center">อีเมล</td>
                    <td className="px-6 py-4 text-center">อีเมล + แชท</td>
                    <td className="px-6 py-4 text-center">24/7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Redeem Code Modal */}
      <Modal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        title="แลกโค้ดพิเศษ"
      >
        <div className="space-y-6">
          <div className="text-center">
            <Gift className="w-20 h-20 text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">กรอกโค้ดของคุณเพื่อรับสิทธิพิเศษ</p>
          </div>

          <Input
            type="text"
            placeholder="ใส่โค้ดที่นี่ (เช่น SCIPARK2024)"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
            className="text-center text-lg font-mono"
          />

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>เคล็ดลับ:</strong> โค้ดสามารถหาได้จาก
              กิจกรรมพิเศษ, โปรโมชั่น หรือของรางวัล
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => setShowRedeemModal(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleRedeemCode}
              loading={loading}
            >
              แลกโค้ด
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upgrade Confirmation Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="ยืนยันการอัพเกรด"
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className={`text-center bg-gradient-to-r ${selectedPlan.gradient} text-white p-6 rounded-3xl`}>
              {selectedPlan.icon && <selectedPlan.icon className="w-16 h-16 mx-auto mb-3" />}
              <h3 className="text-3xl font-bold mb-2">{selectedPlan.name} Tier</h3>
              <p className="text-4xl font-bold">{selectedPlan.price} ฿/เดือน</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-lg">คุณจะได้รับ:</h4>
              {selectedPlan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <p className="text-green-800 text-center font-semibold">
                🎉 ทดลองใช้ 7 วันแรกฟรี!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => setShowUpgradeModal(false)}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                size="lg"
                className={`flex-1 bg-gradient-to-r ${selectedPlan.gradient}`}
                onClick={confirmUpgrade}
                loading={loading}
              >
                ยืนยันอัพเกรด
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Privileges
