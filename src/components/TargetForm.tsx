import { useState } from 'react'
import { Target, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { TargetSettings } from '../types'

interface TargetFormProps {
  onUpdateTarget: (target: TargetSettings) => void
  currentTarget?: TargetSettings
  latestEntryAmount?: number
  latestEntryDate?: string
}

export default function TargetForm({ onUpdateTarget, currentTarget, latestEntryAmount, latestEntryDate }: TargetFormProps) {
  const [annualSavings, setAnnualSavings] = useState(currentTarget?.annualSavings?.toString() || '')
  const [startDate, setStartDate] = useState(currentTarget?.startDate || latestEntryDate || new Date().toISOString().split('T')[0])
  const [startAmount, setStartAmount] = useState(currentTarget?.startAmount?.toString() || latestEntryAmount?.toString() || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!annualSavings || !startDate || !startAmount) return

    const newTarget: TargetSettings = {
      annualSavings: parseFloat(annualSavings),
      startDate,
      startAmount: parseFloat(startAmount)
    }

    onUpdateTarget(newTarget)
  }

  const handleClear = () => {
    setAnnualSavings('')
    setStartAmount('')
    setStartDate(latestEntryDate || new Date().toISOString().split('T')[0])
    onUpdateTarget(null as any)
  }

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <Target className="w-5 h-5 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Target Trajectory
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="annualSavings" className="block text-sm font-medium text-gray-700 mb-1">
            Annual Savings Goal
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              id="annualSavings"
              value={annualSavings}
              onChange={(e) => setAnnualSavings(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field pl-10"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            How much you plan to save per year
          </p>
        </div>

        <div>
          <label htmlFor="targetStartDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              id="targetStartDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="startAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Starting Amount
          </label>
          <div className="relative">
            <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              id="startAmount"
              value={startAmount}
              onChange={(e) => setStartAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center"
          >
            <Target className="w-4 h-4 mr-2" />
            Set Target
          </button>
          
          {currentTarget && (
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary flex-1"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {currentTarget && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <div className="flex items-center text-sm text-primary-700">
            <Target className="w-4 h-4 mr-2" />
            <span className="font-medium">Active Target:</span>
          </div>
          <div className="mt-1 text-xs text-primary-600">
            ${currentTarget.annualSavings.toLocaleString()}/year from {new Date(currentTarget.startDate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
} 