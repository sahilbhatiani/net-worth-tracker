import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target } from 'lucide-react'
import { NetWorthEntry, TargetSettings } from '../types'

interface NetWorthStatsProps {
  entries: NetWorthEntry[]
  targetSettings?: TargetSettings | null
}

export default function NetWorthStats({ entries, targetSettings }: NetWorthStatsProps) {
  if (entries.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Statistics
          </h2>
        </div>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Add entries to see your statistics
          </p>
        </div>
      </div>
    )
  }

  const currentNetWorth = entries[entries.length - 1]?.amount || 0
  const firstNetWorth = entries[0]?.amount || 0
  const totalChange = currentNetWorth - firstNetWorth
  const percentageChange = firstNetWorth > 0 ? (totalChange / firstNetWorth) * 100 : 0
  
  // Calculate average monthly growth
  const timeSpan = entries.length > 1 
    ? (new Date(entries[entries.length - 1].date).getTime() - new Date(entries[0].date).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    : 0
  const averageGrowth = timeSpan > 0 ? totalChange / timeSpan : 0

  // Calculate target comparison
  const getTargetComparison = () => {
    if (!targetSettings || entries.length === 0) return null

    const latestEntryDate = new Date(entries[entries.length - 1].date)
    const startDate = new Date(targetSettings.startDate)
    
    if (latestEntryDate < startDate) return null

    const timeDiff = latestEntryDate.getTime() - startDate.getTime()
    const daysElapsed = timeDiff / (1000 * 60 * 60 * 24)
    
    const expectedAmount = targetSettings.startAmount + (targetSettings.annualSavings / 365.25) * daysElapsed
    const difference = currentNetWorth - expectedAmount
    const percentageDiff = expectedAmount > 0 ? (difference / expectedAmount) * 100 : 0

    return {
      expected: expectedAmount,
      difference,
      percentageDiff,
      isAhead: difference > 0
    }
  }

  const targetComparison = getTargetComparison()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Statistics
        </h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 font-medium">Current Net Worth</p>
              <p className="text-2xl font-bold text-primary-900">
                {formatCurrency(currentNetWorth)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        {targetComparison && (
          <div className="bg-gradient-to-r from-success-50 to-success-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success-600 font-medium">vs Target</p>
                <p className={`text-lg font-bold ${targetComparison.isAhead ? 'text-success-700' : 'text-red-700'}`}>
                  {formatCurrency(targetComparison.difference)}
                </p>
                <p className="text-xs text-success-600">
                  Expected: {formatCurrency(targetComparison.expected)}
                </p>
              </div>
              <Target className="w-8 h-8 text-success-600" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              {totalChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success-600 mr-2" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
              )}
              <div>
                <p className="text-xs text-gray-600">Total Change</p>
                <p className={`font-semibold ${totalChange >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  {formatCurrency(totalChange)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              {percentageChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success-600 mr-2" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
              )}
              <div>
                <p className="text-xs text-gray-600">% Change</p>
                <p className={`font-semibold ${percentageChange >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  {formatPercentage(percentageChange)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">Average Monthly Growth</p>
            <p className={`font-semibold ${averageGrowth >= 0 ? 'text-success-600' : 'text-red-600'}`}>
              {formatCurrency(averageGrowth)}
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            {entries.length} entry{entries.length !== 1 ? 'ies' : 'y'} tracked
          </p>
        </div>
      </div>
    </div>
  )
} 