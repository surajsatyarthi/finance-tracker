'use client'

import { useState } from 'react'
import { financeManager } from '@/lib/supabaseDataManager'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

export default function HeaderDataMigration() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'backing-up' | 'migrating' | 'completed' | 'error'>('idle')
  const [backupComplete, setBackupComplete] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    migrated: number
    error?: string
  } | null>(null)

  const getLocalStorageInfo = () => {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('bank_accounts') || 
        key.includes('income_transactions') || 
        key.includes('expense_transactions') ||
        key.includes('cash_balance') ||
        key.includes('credit_cards')
      )) {
        keys.push(key)
      }
    }
    
    // Debug logging
    console.log('=== LOCALSTORAGE DEBUG ===');
    console.log('Found keys:', keys);
    
    // Check specific keys
    const specificKeys = ['bank_accounts', 'cash_balance', 'income_transactions', 'expense_transactions'];
    specificKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value ? JSON.parse(value) : 'NOT FOUND');
    });
    
    // Show all localStorage keys for debugging
    console.log('All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`  ${key}: ${localStorage.getItem(key)}`);
      }
    }
    
    return keys
  }

  const createBackup = async () => {
    setMigrationStatus('backing-up')
    
    try {
      const data: Record<string, string | null> = {}
      
      // Export all finance tracker data from localStorage
      const financeKeys = [
        'bank_accounts',
        'income_transactions', 
        'expense_transactions',
        'cash_balance',
        'credit_cards',
        'future_payables',
        'total_liquidity',
        'liquidity_last_updated'
      ]
      
      financeKeys.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          data[key] = value
        }
      })
      
      // Create backup file
      const backup = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'finance-tracker-backup',
        data: data
      }
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setBackupComplete(true)
      setMigrationStatus('idle')
    } catch (error) {
      console.error('Backup failed:', error)
      setMigrationStatus('error')
    }
  }

  const runMigration = async () => {
    if (!backupComplete) {
      alert('Please create a backup first!')
      return
    }

    setMigrationStatus('migrating')

    try {
      // Initialize finance manager
      console.log('🚀 Initializing finance manager...');
      const initResult = await financeManager.initialize()
      if (!initResult.success) {
        throw new Error(initResult.error || 'Failed to initialize')
      }
      console.log('✅ Finance manager initialized');

      // Test RLS access by trying a simple query
      console.log('🔒 Testing database access...');
      try {
        const testResult = await financeManager.getAccounts();
        console.log('Database test result:', testResult);
      } catch (testError) {
        console.error('Database access test failed:', testError);
      }

      // Test creating a simple account
      console.log('🧪 Testing account creation...');
      try {
        const createTest = await financeManager.createAccount({
          name: 'Test Account',
          type: 'cash',
          balance: 100
        });
        console.log('Account creation test result:', createTest);
        
        // If successful, delete the test account
        if (createTest.data) {
          console.log('✅ Account creation works! Test successful.');
        }
      } catch (createError) {
        console.error('❌ Account creation test failed:', createError);
      }

      // Perform migration
      console.log('📦 Starting migration...');
      const result = await financeManager.migrateFromLocalStorage()
      console.log('Migration result:', result);
      setMigrationResult(result)
      
      if (result.success) {
        setMigrationStatus('completed')
      } else {
        throw new Error(result.error || 'Migration failed')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Migration error:', error);
      setMigrationResult({ success: false, migrated: 0, error: errorMessage })
      setMigrationStatus('error')
    }
  }

  const localStorageKeys = getLocalStorageInfo()
  const hasData = localStorageKeys.length > 0

  if (!hasData) {
    return null // Don't show if no data to migrate
  }

  return (
    <div className="border-t border-gray-100 pt-2 mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <CloudArrowUpIcon className="h-4 w-4 mr-2" />
          <span>Data Migration</span>
          {migrationStatus === 'completed' && (
            <CheckCircleIcon className="h-4 w-4 ml-2 text-green-500" />
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-3">
          <div className="text-xs text-gray-600">
            Found {localStorageKeys.length} data items to migrate to Supabase
          </div>

          {/* Backup Step */}
          <div className="flex items-center space-x-2">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              backupComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {backupComplete ? <CheckCircleIcon className="w-3 h-3" /> : '1'}
            </div>
            <button
              onClick={createBackup}
              disabled={migrationStatus === 'backing-up' || backupComplete}
              className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                backupComplete
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : migrationStatus === 'backing-up'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {migrationStatus === 'backing-up' ? (
                <>
                  <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                  Backing up...
                </>
              ) : backupComplete ? (
                <>
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Backup Complete
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-3 h-3 mr-1" />
                  Create Backup
                </>
              )}
            </button>
          </div>

          {/* Migration Step */}
          <div className="flex items-center space-x-2">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              migrationStatus === 'completed' ? 'bg-green-100 text-green-600' : 
              migrationStatus === 'error' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-500'
            }`}>
              {migrationStatus === 'completed' ? <CheckCircleIcon className="w-3 h-3" /> : 
               migrationStatus === 'error' ? <ExclamationCircleIcon className="w-3 h-3" /> : '2'}
            </div>
            <button
              onClick={runMigration}
              disabled={!backupComplete || migrationStatus === 'migrating' || migrationStatus === 'completed'}
              className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
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
                  <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                  Migrating...
                </>
              ) : migrationStatus === 'completed' ? (
                <>
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-3 h-3 mr-1" />
                  Migrate to Supabase
                </>
              )}
            </button>
          </div>

          {/* Result */}
          {migrationResult && (
            <div className={`text-xs p-2 rounded ${
              migrationResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {migrationResult.success ? (
                <>✅ Migrated {migrationResult.migrated} items successfully!</>
              ) : (
                <>❌ Migration failed: {migrationResult.error}</>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}