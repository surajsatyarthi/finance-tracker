'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    HomeIcon,
    BuildingLibraryIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ChartBarIcon,
    FlagIcon,
    CreditCardIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    BanknotesIcon,
    WalletIcon,
    DocumentMagnifyingGlassIcon,
    PresentationChartLineIcon,
    DocumentArrowUpIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, signOut } = useAuth()
    const pathname = usePathname()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Accounts', href: '/accounts', icon: WalletIcon },
        { name: 'Income', href: '/income', icon: BanknotesIcon },
        { name: 'Expenses', href: '/expenses/add', icon: ArrowTrendingDownIcon },
        { name: 'Budget', href: '/budget', icon: ChartBarIcon },
        { name: 'Summary', href: '/summary', icon: DocumentMagnifyingGlassIcon },
        { name: 'Goals', href: '/goals', icon: FlagIcon },
        { name: 'Loans', href: '/loans', icon: ArrowTrendingDownIcon },
        { name: 'Savings & FDs', href: '/savings-fds', icon: FlagIcon },
        { name: 'Credit Cards', href: '/credit-cards', icon: CreditCardIcon },
        { name: 'Analyze Statement', href: '/statements/upload', icon: DocumentArrowUpIcon },
        { name: 'Future Payables', href: '/liabilities', icon: ArrowTrendingDownIcon },
        { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
    ]

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            Finance Tracker
                        </span>
                        <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="px-6 py-4 bg-gradient-to-br from-indigo-50/50 to-violet-50/50">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {(user.user_metadata?.name || user.email || 'U')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {user.user_metadata?.name || 'Hello!'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => { signOut(); onClose(); }}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                            Sign Out
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
