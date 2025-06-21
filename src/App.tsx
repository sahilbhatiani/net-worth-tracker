import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import NetWorthForm from './components/NetWorthForm'
import NetWorthStats from './components/NetWorthStats'
import TargetForm from './components/TargetForm'
import { NetWorthEntry, TargetSettings } from './types'
import AuthButton from './components/AuthButton'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebase'
import { db } from './firebase'
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function removeUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    );
  }
  return obj;
}

function App() {
  const [entries, setEntries] = useState<NetWorthEntry[]>([]);
  const [targetSettings, setTargetSettings] = useState<TargetSettings | null>(null);
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem('netWorthEntries', JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem('targetSettings', JSON.stringify(targetSettings))
  }, [targetSettings])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [])

  // Firestore sync for logged-in users
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    const userDoc = doc(db, 'users', user.uid)
    const unsub = onSnapshot(userDoc, (docSnap) => {
      const data = docSnap.data()
      setEntries(data?.entries || [])
      setTargetSettings(data?.targetSettings || null)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  // Save to localStorage for guests (for session only, not persistent)
  useEffect(() => {
    if (user) return
    // No-op: data is in memory only for guests
  }, [entries, targetSettings, user])

  // Write to Firestore only when data changes (not on every render)
  const saveToFirestore = (newEntries: NetWorthEntry[], newTargetSettings: TargetSettings | null) => {
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    setDoc(userDoc, removeUndefined({ entries: newEntries, targetSettings: newTargetSettings }), { merge: true });
  };

  const addEntry = (entry: NetWorthEntry) => {
    setEntries(prev => {
      const updated = [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (user) saveToFirestore(updated, targetSettings);
      return updated;
    });
  }

  const deleteEntry = (id: string) => {
    setEntries(prev => {
      const updated = prev.filter(entry => entry.id !== id);
      if (user) saveToFirestore(updated, targetSettings);
      return updated;
    });
  }

  const updateTarget = (target: TargetSettings | null) => {
    setTargetSettings(target);
    if (user) saveToFirestore(entries, target);
  }

  // Generate target trajectory data
  const generateTargetData = () => {
    if (!targetSettings || entries.length < 1) {
      return null
    }

    const dailySavings = targetSettings.annualSavings / 365.25

    return entries.map(entry => {
      const entryDate = new Date(entry.date)
      const startDate = new Date(targetSettings.startDate)

      if (entryDate < startDate) {
        return null // Creates a gap in the line if target starts after first entry
      }

      const timeDiff = entryDate.getTime() - startDate.getTime()
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

      const expectedAmount = targetSettings.startAmount + (daysDiff * dailySavings)
      return expectedAmount
    })
  }

  const targetData = generateTargetData()

  const chartData = {
    labels: entries.map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Actual Net Worth',
        data: entries.map(entry => entry.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      ...(targetData ? [{
        label: 'Target Trajectory',
        data: targetData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: true,
      }] : [])
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterBody: function(tooltipItems: any[]) {
            const dataIndex = tooltipItems[0].dataIndex;
            const chart = tooltipItems[0].chart;
            
            if (chart.data.datasets.length < 2 || !chart.data.datasets[1]) {
              return [];
            }
            
            const actualValue = chart.data.datasets[0].data[dataIndex] as number | null;
            const targetValue = chart.data.datasets[1].data[dataIndex] as number | null;

            if (actualValue !== null && targetValue !== null) {
              const difference = actualValue - targetValue;

              const formattedDifference = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(difference);

              let label = `Difference: ${formattedDifference}`;
              if (difference >= 0) {
                label += ' (Ahead)';
              } else {
                label += ' (Behind)';
              }

              return ['', label];
            }
            return [];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  const latestEntry = entries[entries.length - 1]

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Net Worth Tracker
            </h1>
            <p className="text-lg text-gray-600">
              Track your financial progress over time
            </p>
            {!user && (
              <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">Guest Mode: Data will not be saved</span>
            )}
          </div>
          <AuthButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms and Stats */}
          <div className="lg:col-span-1 space-y-6">
            <NetWorthForm onAddEntry={addEntry} />
            <TargetForm 
              onUpdateTarget={updateTarget}
              currentTarget={targetSettings || undefined}
              latestEntryAmount={latestEntry?.amount}
              latestEntryDate={latestEntry?.date}
            />
            <NetWorthStats entries={entries} targetSettings={targetSettings} />
          </div>

          {/* Right Column - Chart */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Net Worth Over Time
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {entries.length} entries
                  {targetSettings && (
                    <span className="ml-2 text-success-600">
                      • Target active
                    </span>
                  )}
                </div>
              </div>
              
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No data yet
                  </h3>
                  <p className="text-gray-500">
                    Add your first net worth entry to see your progress chart
                  </p>
                </div>
              ) : (
                <div className="h-80">
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            {/* Recent Entries */}
            {entries.length > 0 && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Entries
                </h3>
                <div className="space-y-3">
                  {entries.slice(-5).reverse().map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(entry.amount)}
                        </span>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="ml-3 text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 