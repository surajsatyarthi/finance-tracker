'use client'

import React, { useState } from 'react'
import { 
  BuildingOfficeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  MapPinIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { createBusinessAccount, validateGSTNumber } from '@/lib/businessManager'

interface BusinessAccountFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function BusinessAccountForm({ onSuccess, onCancel }: BusinessAccountFormProps) {
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    balance: 0,
    business_name: '',
    gst_number: '',
    pan_number: '',
    business_address: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showGSTFields, setShowGSTFields] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.account_name.trim()) {
      newErrors.account_name = 'Account name is required'
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required'
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = 'Account number is required'
    }

    if (formData.balance < 0) {
      newErrors.balance = 'Balance cannot be negative'
    }

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    }

    if (showGSTFields && formData.gst_number) {
      if (!validateGSTNumber(formData.gst_number)) {
        newErrors.gst_number = 'Please enter a valid GST number (15 digits)'
      }
    }

    if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
      newErrors.pan_number = 'Please enter a valid PAN number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createBusinessAccount({
        account_name: formData.account_name,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        balance: formData.balance,
        business_name: formData.business_name,
        gst_number: formData.gst_number || undefined,
        pan_number: formData.pan_number || undefined,
        business_address: formData.business_address || undefined
      })

      if (result.success) {
        alert('Business account created successfully!')
        onSuccess?.()
      } else {
        alert(`Error creating account: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Business Account</h2>
        <p className="text-gray-600">Set up a new business account with GST tracking capabilities</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Details Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-blue-600" />
            Account Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account_name" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                id="account_name"
                value={formData.account_name}
                onChange={(e) => handleInputChange('account_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.account_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Business Current Account"
              />
              {errors.account_name && <p className="text-red-500 text-sm mt-1">{errors.account_name}</p>}
            </div>

            <div>
              <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bank_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="HDFC Bank"
              />
              {errors.bank_name && <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>}
            </div>

            <div>
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                id="account_number"
                value={formData.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.account_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234567890"
              />
              {errors.account_number && <p className="text-red-500 text-sm mt-1">{errors.account_number}</p>}
            </div>

            <div>
              <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                Current Balance
              </label>
              <input
                type="number"
                id="balance"
                value={formData.balance}
                onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.balance ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                step="0.01"
              />
              {errors.balance && <p className="text-red-500 text-sm mt-1">{errors.balance}</p>}
            </div>
          </div>
        </div>

        {/* Business Details Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
            Business Details
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.business_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your Business Name"
              />
              {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>}
            </div>

            <div>
              <label htmlFor="business_address" className="block text-sm font-medium text-gray-700 mb-1">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Business Address
              </label>
              <textarea
                id="business_address"
                value={formData.business_address}
                onChange={(e) => handleInputChange('business_address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Complete business address"
              />
            </div>
          </div>
        </div>

        {/* GST & Tax Details Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-orange-600" />
              Tax Details
            </h3>
            <button
              type="button"
              onClick={() => setShowGSTFields(!showGSTFields)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showGSTFields ? 'Hide GST Fields' : 'Add GST Details'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pan_number" className="block text-sm font-medium text-gray-700 mb-1">
                <UserCircleIcon className="w-4 h-4 inline mr-1" />
                PAN Number
              </label>
              <input
                type="text"
                id="pan_number"
                value={formData.pan_number}
                onChange={(e) => handleInputChange('pan_number', e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pan_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ABCTY1234D"
                maxLength={10}
              />
              {errors.pan_number && <p className="text-red-500 text-sm mt-1">{errors.pan_number}</p>}
            </div>

            {showGSTFields && (
              <div>
                <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  id="gst_number"
                  value={formData.gst_number}
                  onChange={(e) => handleInputChange('gst_number', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.gst_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
                {errors.gst_number && <p className="text-red-500 text-sm mt-1">{errors.gst_number}</p>}
              </div>
            )}
          </div>

          {showGSTFields && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>GST Registration Benefits:</strong>
                <br />• Input tax credit on business purchases
                <br />• Legal compliance for business transactions
                <br />• Enhanced credibility with customers
                <br />• Automated GST calculations and reporting
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Business Account'}
          </button>
        </div>
      </form>
    </div>
  )
}