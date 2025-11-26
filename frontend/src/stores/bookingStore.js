import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookingStore = create(
  persist(
    (set) => ({
      activeBooking: null,
      bookingHistory: [],
      
      setActiveBooking: (booking) => set({ activeBooking: booking }),
      
      updateBooking: (booking) => set({ activeBooking: booking }),
      
      clearActiveBooking: () => set({ activeBooking: null }),
      
      addToHistory: (booking) => set((state) => ({
        bookingHistory: [...state.bookingHistory, booking]
      })),
    }),
    {
      name: 'booking-storage',
    }
  )
)
