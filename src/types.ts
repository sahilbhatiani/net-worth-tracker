export interface NetWorthEntry {
  id: string
  amount: number
  date: string
  notes?: string
}

export interface NetWorthStats {
  totalEntries: number
  currentNetWorth: number
  totalChange: number
  percentageChange: number
  averageGrowth: number
}

export interface TargetSettings {
  annualSavings: number
  startDate: string
  startAmount: number
} 