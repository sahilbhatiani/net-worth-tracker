import { useState } from 'react'
import { Plus, DollarSign, Calendar, FileText } from 'lucide-react'
import { NetWorthEntry } from '../types'

interface NetWorthFormProps {
  onAddEntry: (entry: NetWorthEntry) => void
}

export default function NetWorthForm({ onAddEntry }: NetWorthFormProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !date) return

    const newEntry: NetWorthEntry = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      date,
      notes: notes.trim() || undefined
    }

    onAddEntry(newEntry)
    
    // Reset form
    setAmount('')
    setNotes('')
    setDate(new Date().toISOString().split('T')[0])
  }

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <Plus className="w-5 h-5 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Add Net Worth Entry
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Net Worth Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this entry..."
              rows={3}
              className="input-field pl-10 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </button>
      </form>
    </div>
  )
} 