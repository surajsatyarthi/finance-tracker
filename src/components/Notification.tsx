'use client'

import React, { useEffect, useState } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // Auto dismiss after this many milliseconds (0 = no auto dismiss)
  onDismiss?: (id: string) => void
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 0,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss?.(id)
    }, 300) // Match animation duration
  }

  if (!isVisible) return null

  const getIcon = () => {
    const iconClass = "h-5 w-5 icon-white"
    
    switch (type) {
      case 'success':
        return <div className="icon-golden-card"><CheckCircleIcon className={iconClass} /></div>
      case 'error':
        return <div className="icon-golden-card"><XCircleIcon className={iconClass} /></div>
      case 'warning':
        return <div className="icon-golden-card"><ExclamationTriangleIcon className={iconClass} /></div>
      case 'info':
        return <div className="icon-golden-card"><InformationCircleIcon className={iconClass} /></div>
      default:
        return <div className="icon-golden-card"><InformationCircleIcon className={iconClass} /></div>
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  return (
    <div
      className={`
        ${getStyles()} 
        min-w-fit max-w-md w-auto border rounded-lg shadow-lg p-4 
        ${isExiting ? 'notification-exit' : 'notification-enter'}
        relative mx-auto
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 break-words">
            {title}
          </p>
          {message && (
            <p className="mt-1 text-sm opacity-90 text-gray-700 break-words">
              {message}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          <button
            className="inline-flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-golden-500"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <div className="icon-golden-card">
              <XMarkIcon className="h-4 w-4 icon-white" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Progress bar for timed notifications */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-30 animate-pulse"
            style={{
              animation: `shrink ${duration}ms linear`
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Notification

// Add this CSS animation to globals.css
const shrinkAnimation = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`