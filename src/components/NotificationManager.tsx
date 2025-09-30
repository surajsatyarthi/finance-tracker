'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Notification, { NotificationProps } from './Notification'

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => void
  showSuccess: (title: string, message?: string, duration?: number) => void
  showError: (title: string, message?: string, duration?: number) => void
  showWarning: (title: string, message?: string, duration?: number) => void
  showInfo: (title: string, message?: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const showNotification = useCallback((notification: Omit<NotificationProps, 'id' | 'onDismiss'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onDismiss: (dismissedId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== dismissedId))
      }
    }
    
    setNotifications(prev => [...prev, newNotification])
  }, [])

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({ type: 'success', title, message, duration })
  }, [showNotification])

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({ type: 'error', title, message, duration })
  }, [showNotification])

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({ type: 'warning', title, message, duration })
  }, [showNotification])

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({ type: 'info', title, message, duration })
  }, [showNotification])

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification {...notification} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}