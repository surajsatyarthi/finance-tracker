'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Notification from '@/components/Notification'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationData {
  id: string
  message: string
  type: NotificationType
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const showNotification = (message: string, type: NotificationType) => {
    const id = Date.now().toString()
    const newNotification: NotificationData = { id, message, type }
    
    // Clear existing notifications to prevent duplicates
    setNotifications([newNotification])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center w-screen pointer-events-none">
        <div className="pointer-events-auto">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            title={notification.message}
            type={notification.type}
            onDismiss={removeNotification}
          />
        ))}
        </div>
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}