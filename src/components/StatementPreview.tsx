'use client'

import { useState } from 'react'
import { StatementData, EMIDetail } from '@/scripts/statement-analyzer/types'

interface StatementPreviewProps {
    data: StatementData
    currentBalance: number
    onConfirm: () => void
    onCancel: () => void
    isUpdating: boolean
}

export default function StatementPreview({
    data,
    currentBalance,
    onConfirm,
    onCancel,
    isUpdating
}: StatementPreviewProps) {
    const difference = data.totalAmountDue - currentBalance

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Statement Preview</h2>

            {/* Card Info */}
            <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Card Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Card Name</p>
                        <p className="font-medium">{data.cardName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Last 4 Digits</p>
                        <p className="font-medium">****{data.lastFourDigits}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Statement Date</p>
                        <p className="font-medium">{data.statementDate || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium">{data.dueDate || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Balance Comparison */}
            <div className="mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Balance Update</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className="text-lg sm:text-xl font-bold">₹{currentBalance.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Statement Balance</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600">₹{data.totalAmountDue.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Difference</p>
                        <p className={`text-lg sm:text-xl font-bold ${difference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {difference >= 0 ? '+' : ''}₹{difference.toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Statement Details */}
            <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Statement Details</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Previous Balance</span>
                        <span className="font-medium">₹{data.previousBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">New Charges</span>
                        <span className="font-medium">₹{data.newCharges.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Payments/Credits</span>
                        <span className="font-medium text-green-600">-₹{data.paymentsCredits.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Total Amount Due</span>
                        <span className="font-bold">₹{data.totalAmountDue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Amount Due</span>
                        <span className="font-medium">₹{data.minimumAmountDue.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Credit Limit Info */}
            <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Credit Limit</h3>
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Limit</span>
                    <span className="font-medium">₹{data.creditLimit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Available Credit</span>
                    <span className="font-medium">₹{data.availableCredit.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* EMIs if any */}
            {data.emis && data.emis.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Active EMIs ({data.emis.length})</h3>
                    <div className="space-y-2">
                        {data.emis.map((emi: EMIDetail, idx: number) => (
                            <div key={idx} className="p-3 bg-yellow-50 rounded">
                                <p className="font-medium">{emi.description}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-gray-600">Outstanding: </span>
                                        <span className="font-medium">₹{emi.outstandingAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Monthly: </span>
                                        <span className="font-medium">₹{emi.emiAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Pending: </span>
                                        <span className="font-medium">{emi.pendingInstallments}/{emi.totalInstallments}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                    onClick={onConfirm}
                    disabled={isUpdating}
                    className="flex-1 bg-blue-600 text-white py-3 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                >
                    {isUpdating ? 'Updating...' : 'Update Balance'}
                </button>
                <button
                    onClick={onCancel}
                    disabled={isUpdating}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
