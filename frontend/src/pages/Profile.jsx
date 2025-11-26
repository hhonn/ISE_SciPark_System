import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { vehicleAPI, bookingAPI, userAPI } from '../utils/apiService'

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const CarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const HistoryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const CrownIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
  </svg>
)

const rankConfig = {
  Iron: { gradient: 'from-gray-400 via-gray-500 to-gray-600', bg: 'bg-gradient-to-r from-gray-100 to-gray-200', text: 'text-gray-700', icon: 'I', border: 'border-gray-400' },
  Bronze: { gradient: 'from-amber-600 via-orange-500 to-amber-700', bg: 'bg-gradient-to-r from-amber-50 to-orange-100', text: 'text-amber-800', icon: 'B', border: 'border-amber-500' },
  Silver: { gradient: 'from-gray-300 via-slate-200 to-gray-400', bg: 'bg-gradient-to-r from-gray-50 to-slate-100', text: 'text-gray-700', icon: 'S', border: 'border-gray-300' },
  Gold: { gradient: 'from-yellow-400 via-amber-300 to-yellow-500', bg: 'bg-gradient-to-r from-yellow-50 to-amber-100', text: 'text-yellow-800', icon: 'G', border: 'border-yellow-400' },
  Platinum: { gradient: 'from-cyan-400 via-teal-300 to-cyan-500', bg: 'bg-gradient-to-r from-cyan-50 to-teal-100', text: 'text-cyan-800', icon: 'P', border: 'border-cyan-400' },
  Diamond: { gradient: 'from-violet-500 via-purple-400 to-pink-500', bg: 'bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50', text: 'text-purple-800', icon: 'D', border: 'border-purple-400' }
}

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuthStore()
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ licensePlate: '', brand: '', model: '', color: '' })
  const [addingVehicle, setAddingVehicle] = useState(false)

  const rank = user?.rank || 'Iron'
  const rankStyle = rankConfig[rank] || rankConfig.Iron

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [vehiclesRes, historyRes] = await Promise.all([
        vehicleAPI.getAll().catch(() => ({ data: { data: [] } })),
        bookingAPI.getHistory(10).catch(() => ({ data: { bookings: [] } }))
      ])
      setVehicles(vehiclesRes.data?.data || vehiclesRes.data?.vehicles || [])
      setBookings(historyRes.data?.bookings || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleLogout = async () => { await logout(); navigate('/login') }
  const handleEditStart = () => { setEditForm({ name: user?.name || '', phone: user?.phone || '' }); setIsEditing(true) }
  const handleEditSave = async () => {
    try { setSaving(true); const res = await userAPI.updateProfile(editForm); if (res.data?.user) setUser(res.data.user); setIsEditing(false) }
    catch { alert('Unable to update') }
    finally { setSaving(false) }
  }
  const handleAddVehicle = async () => {
    if (!newVehicle.licensePlate || !newVehicle.brand) { alert('Please fill license plate and brand'); return }
    try { setAddingVehicle(true); await vehicleAPI.add(newVehicle); setNewVehicle({ licensePlate: '', brand: '', model: '', color: '' }); setShowAddVehicle(false); fetchData() }
    catch { alert('Unable to add vehicle') }
    finally { setAddingVehicle(false) }
  }
  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Delete this vehicle?')) return
    try { await vehicleAPI.delete(vehicleId); fetchData() } catch { alert('Unable to delete') }
  }

  const getStatusStyle = (status) => ({ completed: 'bg-emerald-500/20 text-emerald-300', active: 'bg-blue-500/20 text-blue-300', confirmed: 'bg-violet-500/20 text-violet-300', cancelled: 'bg-red-500/20 text-red-300' }[status] || 'bg-gray-500/20 text-gray-300')
  const getStatusText = (status) => ({ completed: 'Completed', active: 'Active', confirmed: 'Confirmed', cancelled: 'Cancelled' }[status] || status)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
        </div>
        <p className="text-white/80 text-lg animate-pulse">Loading...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="text-center bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 max-w-sm">
        <p className="text-white/60 mb-6">Something went wrong</p>
        <button onClick={fetchData} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-28">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative">
        <div className={`h-56 bg-gradient-to-br ${rankStyle.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <button onClick={handleLogout} className="absolute top-5 right-5 flex items-center gap-2 px-5 py-2.5 bg-black/20 backdrop-blur-md rounded-full text-white text-sm font-medium hover:bg-black/30 transition-all border border-white/20">
            <LogoutIcon /><span>Logout</span>
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-20">
          <div className="relative">
            <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${rankStyle.gradient} blur-md opacity-60 animate-pulse`}></div>
            <div className={`relative w-36 h-36 rounded-full bg-gradient-to-br ${rankStyle.gradient} p-1 shadow-2xl`}>
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-800">
                <span className={`text-6xl font-black bg-gradient-to-br ${rankStyle.gradient} bg-clip-text text-transparent`}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border-2 border-slate-700 text-2xl font-bold text-white/60">{rankStyle.icon}</div>
          </div>
        </div>
      </div>

      <div className="relative px-5 pt-24 pb-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">{user?.name || 'User'}</h1>
          <p className="text-white/50 text-sm">{user?.email}</p>
          <div className={`inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full ${rankStyle.bg} ${rankStyle.text} text-sm font-bold shadow-lg border ${rankStyle.border}`}>
            <CrownIcon /><span>{rank} Member</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[{ v: user?.points || 0, l: 'Points', c: 'from-yellow-500 to-amber-500' }, { v: vehicles.length, l: 'Vehicles', c: 'from-blue-500 to-cyan-500' }, { v: bookings.length, l: 'Bookings', c: 'from-purple-500 to-pink-500' }].map((s, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 hover:border-white/20 transition-all">
              <div className={`text-3xl font-black bg-gradient-to-r ${s.c} bg-clip-text text-transparent`}>{s.v}</div>
              <div className="text-white/40 text-xs mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="flex bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 mb-6 border border-white/10">
          {[{ id: 'profile', icon: <UserIcon />, label: 'Profile' }, { id: 'vehicles', icon: <CarIcon />, label: 'Vehicles' }, { id: 'history', icon: <HistoryIcon />, label: 'History' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}>
              {tab.icon}<span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"><UserIcon /></div>Personal Info</h2>
              {!isEditing && <button onClick={handleEditStart} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white/70 hover:bg-white/20"><EditIcon /> Edit</button>}
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <label className="text-white/40 text-xs uppercase">Full Name</label>
                {isEditing ? <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mt-2 text-white focus:outline-none focus:border-purple-500" /> : <p className="text-white text-lg mt-1 font-medium">{user?.name || '-'}</p>}
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <label className="text-white/40 text-xs uppercase">Email</label>
                <p className="text-white text-lg mt-1 font-medium">{user?.email || '-'}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <label className="text-white/40 text-xs uppercase">Phone</label>
                {isEditing ? <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mt-2 text-white focus:outline-none focus:border-purple-500" placeholder="0xx-xxx-xxxx" /> : <p className="text-white text-lg mt-1 font-medium">{user?.phone || '-'}</p>}
              </div>
              {isEditing && <div className="flex gap-3 pt-4">
                <button onClick={handleEditSave} disabled={saving} className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold disabled:opacity-50 shadow-lg">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-white/10 text-white/70 rounded-2xl font-medium hover:bg-white/20">Cancel</button>
              </div>}
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"><CarIcon /></div>My Vehicles</h2>
              <button onClick={() => setShowAddVehicle(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium shadow-lg"><PlusIcon /> Add New</button>
            </div>
            {vehicles.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/10 border-dashed">
                <h3 className="text-white text-xl font-bold mb-2">No vehicles yet</h3>
                <button onClick={() => setShowAddVehicle(true)} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium">Add your first vehicle</button>
              </div>
            ) : (
              <div className="space-y-3">{vehicles.map((v, i) => (
                <div key={v.id || v._id || i} className="group bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white">CAR</div>
                    <div><p className="text-white font-bold text-xl">{v.licensePlate}</p><p className="text-white/60">{v.brand} {v.model}</p></div>
                  </div>
                  <button onClick={() => handleDeleteVehicle(v.id || v._id)} className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"><TrashIcon /></button>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center"><HistoryIcon /></div>Booking History</h2>
            {bookings.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/10 border-dashed">
                <h3 className="text-white text-xl font-bold mb-2">No bookings yet</h3>
              </div>
            ) : (
              <div className="space-y-3">{bookings.map((b, i) => (
                <div key={b.id || b._id || i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-xl text-white">P</div>
                      <div><p className="text-white font-bold text-lg">{b.zone?.name || b.zoneName || 'Parking'}</p><p className="text-white/50 text-sm">Spot {b.spot?.spotNumber || '-'}</p></div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(b.status)}`}>{getStatusText(b.status)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-white/40 text-sm">{b.startTime ? new Date(b.startTime).toLocaleDateString('en-US') : '-'}</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{b.cost || 0} THB</span>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}
      </div>

      {showAddVehicle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowAddVehicle(false)}></div>
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white">Add Vehicle</h3>
              <button onClick={() => setShowAddVehicle(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60 hover:bg-white/20"><CloseIcon /></button>
            </div>
            <div className="space-y-5">
              <div><label className="text-white/60 text-sm mb-2 block">License Plate *</label><input type="text" placeholder="e.g. ABC 1234" value={newVehicle.licensePlate} onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value.toUpperCase()})} className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:border-purple-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-white/60 text-sm mb-2 block">Brand *</label><input type="text" placeholder="Toyota" value={newVehicle.brand} onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-purple-500" /></div>
                <div><label className="text-white/60 text-sm mb-2 block">Model</label><input type="text" placeholder="Camry" value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-purple-500" /></div>
              </div>
              <div><label className="text-white/60 text-sm mb-2 block">Color</label><input type="text" placeholder="White, Black, Silver..." value={newVehicle.color} onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-purple-500" /></div>
            </div>
            <button onClick={handleAddVehicle} disabled={addingVehicle} className="w-full mt-8 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white rounded-2xl font-black text-lg disabled:opacity-50 shadow-xl">{addingVehicle ? 'Adding...' : 'Add Vehicle'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
