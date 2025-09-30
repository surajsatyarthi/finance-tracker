'use client'

import { useState } from 'react'
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

export default function DataBackup() {
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null)

  const exportData = () => {
    try {
      const data: Record<string, string | null> = {}
      
      // Export all finance tracker data from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('finance-tracker-')) {
          data[key] = localStorage.getItem(key)
        }
      }
      
      // Create backup file
      const backup = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: data
      }
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setMessage({
        type: 'success',
        text: `Backup exported successfully! File saved as: finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      })
      
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to export data. Please try again.'
      })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const backup = JSON.parse(content)
        
        // Validate backup format
        if (!backup.data || !backup.exportDate) {
          throw new Error('Invalid backup file format')
        }
        
        // Clear existing data (optional - you might want to merge instead)
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('finance-tracker-')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Import new data
        Object.entries(backup.data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value)
          }
        })
        
        setMessage({
          type: 'success',
          text: `Data imported successfully from backup created on ${new Date(backup.exportDate).toLocaleDateString()}`
        })
        
        // Reload page to reflect imported data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
        
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to import data. Please check the file format.'
        })
      } finally {
        setImporting(false)
        // Clear the file input
        event.target.value = ''
      }
    }
    
    reader.readAsText(file)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Data Backup & Security</h3>
      </div>
      
      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Important</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Your data is stored locally in your browser. Regular backups are essential to prevent data loss.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Export */}
        <div>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Backup
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Download all your financial data as a JSON file. Store it safely in cloud storage.
          </p>
        </div>

        {/* Import */}
        <div>
          <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            {importing ? 'Importing...' : 'Import Backup'}
            <input
              type="file"
              accept=".json"
              onChange={importData}
              disabled={importing}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-600 mt-2">
            Restore data from a previously exported backup file.
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' :
          message.type === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Backup Recommendations */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Backup Recommendations:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Export backup weekly and store in cloud storage</li>
          <li>• Keep multiple backup versions (monthly archives)</li>
          <li>• Test import process occasionally to ensure backups work</li>
          <li>• Consider upgrading to cloud database for automatic sync</li>
        </ul>
      </div>
    </div>
  )
}