import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (userData, token = null) => {
        set({ 
          user: userData, 
          token: token,
          isAuthenticated: true 
        })
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false 
        })
      },
      
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },
      
      setToken: (token) => {
        set({ token })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
