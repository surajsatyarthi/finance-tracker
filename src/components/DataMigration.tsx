'use client'

import { useState } from 'react'
import { financeManager } from '@/lib/supabaseDataManager'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function DataMigration() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'backing-up' | 'migrating' | 'completed' | 'error'>('idle')
  const [backupComplete, setBackupComplete] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    migrated: number
    error?: string
  } | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const createBackup = async () => {
    setMigrationStatus('backing-up')
    addLog('Creating local backup...')
    
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
        type: 'pre-migration-backup',
        data: data
      }
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `finance-tracker-pre-migration-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      addLog('✅ Local backup created successfully')
      setBackupComplete(true)
    } catch (error) {
      addLog('❌ Failed to create backup: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setMigrationStatus('error')
    }
  }

  const runMigration = async () => {
    if (!backupComplete) {
      addLog('⚠️ Please create a backup first')
      return
    }

    setMigrationStatus('migrating')
    addLog('🚀 Starting migration to Supabase...')

    try {
      // Initialize finance manager
      addLog('Initializing Supabase connection...')
      const initResult = await financeManager.initialize()
      if (!initResult.success) {
        throw new Error(initResult.error || 'Failed to initialize')
      }
      addLog('✅ Supabase connection established')

      // Run health check
      addLog('Running system health check...')
      const healthCheck = await financeManager.healthCheck()
      addLog(`System status: ${healthCheck.status}`)
      
      if (healthCheck.status === 'unhealthy') {
        throw new Error(healthCheck.message || 'System unhealthy')
      }

      // Perform migration
      addLog('Migrating data from localStorage to Supabase...')
      const result = await financeManager.migrateFromLocalStorage()
      
      setMigrationResult(result)
      
      if (result.success) {
        addLog(`✅ Migration completed successfully!`)
        addLog(`📊 Migrated ${result.migrated} items to Supabase`)
        setMigrationStatus('completed')
      } else {
        throw new Error(result.error || 'Migration failed')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLog(`❌ Migration failed: ${errorMessage}`)
      setMigrationResult({ success: false, migrated: 0, error: errorMessage })
      setMigrationStatus('error')
    }
  }

  const getLocalStorageInfo = () => {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('finance-tracker-')) {
        keys.push(key)
      }
    }
    return keys
  }

  const localStorageKeys = getLocalStorageInfo()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <CloudArrowUpIcon className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Enterprise Data Migration</h3>
          <p className="text-sm text-gray-600">Migrate your data from browser storage to Supabase database</p>
        </div>
      </div>

      {/* Current Data Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Current Local Data</h4>
        <div className="text-sm text-blue-700">
          <p>Found {localStorageKeys.length} data items in browser storage:</p>
          <ul className="mt-2 space-y-1 text-xs">
            {localStorageKeys.map(key => (
              <li key={key} className="font-mono">• {key.replace('finance-tracker-', '')}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Migration Steps */}
      <div className="space-y-6">
        {/* Step 1: Backup */}
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            backupComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {backupComplete ? <CheckCircleIcon className="w-5 h-5" /> : '1'}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">Create Local Backup</h4>
            <p className="text-sm text-gray-600 mb-3">
              Safety first! Download a backup of all your data before migration.
            </p>
            <button
              onClick={createBackup}
              disabled={migrationStatus === 'backing-up' || backupComplete}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                backupComplete
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : migrationStatus === 'backing-up'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {migrationStatus === 'backing-up' ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : backupComplete ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Backup Complete
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Create Backup
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Migration */}
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            migrationStatus === 'completed' ? 'bg-green-100 text-green-600' : 
            migrationStatus === 'error' ? 'bg-red-100 text-red-600' :
            'bg-gray-100 text-gray-400'
          }`}>
            {migrationStatus === 'completed' ? <CheckCircleIcon className="w-5 h-5" /> : 
             migrationStatus === 'error' ? <ExclamationCircleIcon className="w-5 h-5" /> : '2'}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">Migrate to Supabase</h4>
            <p className="text-sm text-gray-600 mb-3">
              Transfer all your data to the secure Supabase database.
            </p>
            <button
              onClick={runMigration}
              disabled={!backupComplete || migrationStatus === 'migrating' || migrationStatus === 'completed'}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                migrationStatus === 'completed'
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : migrationStatus === 'migrating'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : !backupComplete
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {migrationStatus === 'migrating' ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : migrationStatus === 'completed' ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Migration Complete
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                  Start Migration
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Migration Results */}
      {migrationResult && (
        <div className={`mt-6 p-4 rounded-lg ${
          migrationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {migrationResult.success ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
            )}
            <h4 className={`text-sm font-medium ${
              migrationResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {migrationResult.success ? 'Migration Successful!' : 'Migration Failed'}
            </h4>
          </div>
          <div className={`mt-2 text-sm ${
            migrationResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {migrationResult.success ? (
              <div>
                <p>Successfully migrated {migrationResult.migrated} items to Supabase database.</p>
                <p className="mt-1 font-medium">
                  🎉 Your finance tracker is now running on enterprise-grade infrastructure!
                </p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>✅ Data is now stored securely in Supabase</li>
                  <li>✅ Automatic backups and sync</li>
                  <li>✅ Access from multiple devices</li>
                  <li>✅ Commercial-grade reliability</li>
                </ul>
              </div>
            ) : (
              <p>Error: {migrationResult.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Migration Logs */}
      {logs.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Migration Log</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
            <div className="space-y-1 text-xs font-mono text-gray-700">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Post-Migration Instructions */}
      {migrationStatus === 'completed' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h4 className="text-sm font-medium text-blue-800">Next Steps</h4>
          </div>
          <div className="mt-2 text-sm text-blue-700">
            <ol className="space-y-1">
              <li>1. Verify your data in the dashboard</li>
              <li>2. The app will now automatically save to Supabase</li>
              <li>3. Your backup file is safely downloaded</li>
              <li>4. You can access your data from any device</li>
            </ol>
            <p className="mt-2 font-medium">
              🔒 Your financial data is now enterprise-grade secure!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}