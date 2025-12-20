
import { FuturePayable } from '@/types/finance'
import { CalendarDaysIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/dateUtils'

interface LiabilityCardProps {
    liability: FuturePayable
}

export default function LiabilityCard({ liability }: LiabilityCardProps) {
    const isOverdue = liability.status === 'overdue'
    const isPending = liability.status === 'pending'

    // Parse date for display
    const dueDateObj = new Date(liability.dueDate)
    const daysRemaining = Math.ceil((dueDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    const getStatusColor = () => {
        if (isOverdue) return 'bg-red-50 border-red-200'
        if (daysRemaining <= 5) return 'bg-orange-50 border-orange-200' // Urgent
        return 'bg-white border-gray-200'
    }

    const getTextColor = () => {
        if (isOverdue) return 'text-red-700'
        if (daysRemaining <= 5) return 'text-orange-700'
        return 'text-gray-700'
    }

    return (
        <div className={`rounded-xl border shadow-sm p-6 ${getStatusColor()} transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <CalendarDaysIcon className={`h-6 w-6 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{liability.source}</h3>
                        <p className="text-sm text-gray-500">{liability.description}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{liability.amount.toLocaleString()}</p>
                    <div className={`flex items-center justify-end text-sm font-medium mt-1 ${getTextColor()}`}>
                        {isOverdue && <ExclamationTriangleIcon className="h-4 w-4 mr-1" />}
                        {isOverdue ? `Overdue by ${Math.abs(daysRemaining)} days` : `Due in ${daysRemaining} days`}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200/60 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Due Date: <span className="font-medium text-gray-900">{formatDate(liability.dueDate)}</span>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    View Details
                </button>
            </div>
        </div>
    )
}
