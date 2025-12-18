'use client'

import { useRequireAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClockIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface ActivityEntry {
  id: string
  timestamp: string
  action: string
  description: string
  amount?: number
  category: 'transaction' | 'account' | 'goal' | 'security' | 'system'
  ip_address?: string
  user_agent?: string
}

export default function ActivityPage() {
  const { loading } = useRequireAuth()
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [filter, setFilter] = useState<string>('all')

  // Mock activity data - in real app, this would come from your backend
  useEffect(() => {
    const mockActivities: ActivityEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        action: 'Transaction Added',
        description: 'Added expense: Coffee ₹296',
        amount: 296,
        category: 'transaction',
        ip_address: '192.168.1.100',
        user_agent: 'Safari'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        action: 'Account Updated',
        description: 'Updated SBI account balance',
        category: 'account',
        ip_address: '192.168.1.100',
        user_agent: 'Safari'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        action: 'Login',
        description: 'User logged in successfully',
        category: 'security',
        ip_address: '192.168.1.100',
        user_agent: 'Safari'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        action: 'Goal Created',
        description: 'Created new goal: Emergency Fund',
        category: 'goal',
        ip_address: '192.168.1.100',
        user_agent: 'Chrome'
      }
    ]
    setActivities(mockActivities)
  }, [])

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'transaction':
        return <BanknotesIcon className="h-5 w-5 text-success-600" />
      case 'account':
        return <CreditCardIcon className="h-5 w-5 text-neutral-600" />
      case 'goal':
        return <ChartBarIcon className="h-5 w-5 text-warning-600" />
      case 'security':
        return <UserIcon className="h-5 w-5 text-error-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-neutral-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transaction':
        return 'bg-success-100 text-success-800 border-success-200'
      case 'account':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200'
      case 'goal':
        return 'bg-warning-100 text-warning-800 border-warning-200'
      case 'security':
        return 'bg-error-100 text-error-800 border-error-200'
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.category === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading activity log...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-700 transition-colors">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900 flex items-center">
                  <ClockIcon className="h-6 w-6 mr-3 text-success-600" />
                  Activity Log
                </h1>
                <p className="text-neutral-600">Track all your financial data activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg border border-neutral-200 p-1">
            {[
              { key: 'all', label: 'All Activities' },
              { key: 'transaction', label: 'Transactions' },
              { key: 'account', label: 'Accounts' },
              { key: 'goal', label: 'Goals' },
              { key: 'security', label: 'Security' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-success-100 text-success-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Recent Activities ({filteredActivities.length})
              </h2>
              <div className="text-sm text-neutral-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="space-y-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-neutral-100 rounded-lg">
                        {getActivityIcon(activity.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-medium text-neutral-900">
                            {activity.action}
                          </h3>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(activity.category)}`}>
                            {activity.category}
                          </span>
                        </div>
                        <p className="text-neutral-600 mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-neutral-500">
                          <span>{formatTimestamp(activity.timestamp)}</span>
                          {activity.ip_address && (
                            <span>IP: {activity.ip_address}</span>
                          )}
                          {activity.user_agent && (
                            <span>{activity.user_agent}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-neutral-900">
                          ₹{activity.amount.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No activities found for the selected filter</p>
                  <p className="text-sm text-neutral-500 mt-2">Activities will appear here as you use the application</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-neutral-100 rounded-lg border border-neutral-200 p-6">
          <div className="flex items-start space-x-3">
            <UserIcon className="h-5 w-5 text-neutral-600 mt-1" />
            <div>
              <h3 className="font-medium text-neutral-900 mb-1">
                Security & Privacy
              </h3>
              <p className="text-sm text-neutral-600">
                Your activity log helps track all changes to your financial data. We log IP addresses and browser information for security purposes. 
                This data is encrypted and stored securely to protect your privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}