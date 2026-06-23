import { create } from 'zustand'
import { PointsTransaction } from '@/types'

interface WalletState {
  points: number
  transactions: PointsTransaction[]
  setPoints: (points: number) => void
  addPoints: (points: number) => void
  addTransaction: (tx: PointsTransaction) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  points: 99999,
  transactions: [],
  setPoints: (points) => set({ points }),
  addPoints: (points) => set((state) => ({ points: state.points + points })),
  addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
}))
