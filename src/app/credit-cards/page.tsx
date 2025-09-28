'use client'

import { useState, useMemo } from 'react'
import { useRequireAuth } from '../../contexts/AuthContext'
import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface CreditCardData {
  id: string
  name: string
  type: string
  number: string
  cvv: string
  pin: string
  limit: number
  statementDate: string
  paymentDate: string
  annualFee: number
  renewMonth?: string
  waveOffLimit?: number
  primaryUse: string
  cashback: string
  rewardPoints: string
  rewardValue: number
  rewardExpiry: number
  rewardLimit?: string
  partnerMerchants: string
  nationalAirport: string
  internationalAirport: string
  railwayLounge: string
  bank: string
  network: string
}

export default function CreditCards() {
  const { user, loading } = useRequireAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBank, setFilterBank] = useState('')
  const [filterNetwork, setFilterNetwork] = useState('')
  const [showNumbers, setShowNumbers] = useState(false)
  // Remove selectedCard state as we're showing all details by default

  // Your credit card data
  const creditCards: CreditCardData[] = [
    {
      id: '1',
      name: 'SBI BPCL',
      type: 'VISA',
      number: '4611199394936359',
      cvv: '226',
      pin: '429',
      limit: 34000,
      statementDate: '12 Aug',
      paymentDate: '20 Aug',
      annualFee: 499,
      renewMonth: 'Feb',
      waveOffLimit: 100000,
      primaryUse: 'Fuel at BPCL, groceries, dining',
      cashback: '4.25% on fuel at BPCL',
      rewardPoints: '5X on groceries, dining',
      rewardValue: 0.25,
      rewardExpiry: 24,
      rewardLimit: 'Max 1300 RP per billing cycle',
      partnerMerchants: 'BPCL',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'SBI',
      network: 'VISA'
    },
    {
      id: '2',
      name: 'SBI Paytm',
      type: 'VISA',
      number: '4129470904684093',
      cvv: '529',
      pin: '963',
      limit: 150000,
      statementDate: '18 June',
      paymentDate: '6 July',
      annualFee: 500,
      renewMonth: 'Feb',
      waveOffLimit: 100000,
      primaryUse: 'Paytm Mall, movies, travel, daily',
      cashback: '3% on Paytm Mall, movies, travel; 2% Paytm',
      rewardPoints: '1% elsewhere',
      rewardValue: 0.25,
      rewardExpiry: 24,
      rewardLimit: 'Capped at ₹100 per statement cycle for fuel surcharge waiver',
      partnerMerchants: 'Paytm Mall, movies, travel, daily',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'SBI',
      network: 'VISA'
    },
    {
      id: '3',
      name: 'SBI Simply save',
      type: 'MASTERCARD',
      number: '5241828335115906',
      cvv: '826',
      pin: '948',
      limit: 16000,
      statementDate: '9 Mar',
      paymentDate: '28 Mar',
      annualFee: 499,
      primaryUse: 'Dining, movies, groceries, fuel',
      cashback: 'NA',
      rewardPoints: '10X on dining, movies, groceries; 1X on others',
      rewardValue: 0.25,
      rewardExpiry: 24,
      rewardLimit: 'Max 10,000 RP per month',
      partnerMerchants: 'Dining, movies, groceries, fuel',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'SBI',
      network: 'MASTERCARD'
    },
    {
      id: '4',
      name: 'SC EaseMyTrip',
      type: 'VISA',
      number: '4940777670885622',
      cvv: '928',
      pin: '536',
      limit: 214500,
      statementDate: '11 Oct',
      paymentDate: '2 Nov',
      annualFee: 350,
      renewMonth: 'Oct',
      waveOffLimit: 50000,
      primaryUse: 'Travel, hotel, flight bookings',
      cashback: '20% on hotels, 10% on flights',
      rewardPoints: '10X on hotel/flight bookings; 2X on other spends',
      rewardValue: 0.5,
      rewardExpiry: 24,
      rewardLimit: 'Max discount ₹5000 on hotels, ₹1000 on flights',
      partnerMerchants: 'EaseMyTrip, hotels, flights',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'Standard Chartered',
      network: 'VISA'
    },
    {
      id: '5',
      name: 'Axis Rewards',
      type: 'VISA',
      number: '5521370103599087',
      cvv: '330',
      pin: 'o46',
      limit: 120000,
      statementDate: '21 Mar',
      paymentDate: '08 Apr',
      annualFee: 1000,
      renewMonth: 'Feb',
      waveOffLimit: 30000,
      primaryUse: 'Dining, movies, groceries',
      cashback: '2.5% on dining, movies, groceries',
      rewardPoints: '1X on dining, movies, groceries',
      rewardValue: 0.25,
      rewardExpiry: 36,
      rewardLimit: 'NA',
      partnerMerchants: 'Dining, movies, groceries',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'Axis Bank',
      network: 'VISA'
    },
    {
      id: '6',
      name: 'Axis My Zone',
      type: 'VISA',
      number: '4514570059089171',
      cvv: '1027',
      pin: 'o43',
      limit: 154000,
      statementDate: '13 July',
      paymentDate: '30 July',
      annualFee: 0,
      primaryUse: 'Daily spends, Swiggy, AJIO',
      cashback: '2% on daily spends, 15% on Swiggy',
      rewardPoints: '1X on daily spends',
      rewardValue: 0.25,
      rewardExpiry: 36,
      rewardLimit: 'Max discount ₹1000 on Swiggy',
      partnerMerchants: 'Daily spends, Swiggy, AJIO',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'Axis Bank',
      network: 'VISA'
    },
    {
      id: '7',
      name: 'Axis Neo',
      type: 'VISA',
      number: '4641180019364981',
      cvv: '527',
      pin: '916',
      limit: 154000,
      statementDate: '18 July',
      paymentDate: '5 Aug',
      annualFee: 250,
      renewMonth: 'May',
      primaryUse: 'Dining, movies, groceries',
      cashback: '2.5% on dining, movies, groceries',
      rewardPoints: '1X on dining, movies, groceries',
      rewardValue: 0.25,
      rewardExpiry: 36,
      rewardLimit: 'NA',
      partnerMerchants: 'Dining, movies, groceries',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'Axis Bank',
      network: 'VISA'
    },
    {
      id: '8',
      name: 'RBL Platinum Delight',
      type: 'VISA',
      number: '4391230234617796',
      cvv: '730',
      pin: '437',
      limit: 160000,
      statementDate: '12 August',
      paymentDate: '2 Sep',
      annualFee: 1000,
      renewMonth: 'Feb',
      waveOffLimit: 200000,
      primaryUse: 'Weekdays and weekends shopping',
      cashback: 'NA',
      rewardPoints: '2X on weekdays, 4X on weekends',
      rewardValue: 0.25,
      rewardExpiry: 24,
      rewardLimit: 'Up to ₹150 fuel surcharge waiver per month',
      partnerMerchants: 'Weekdays and weekends shopping',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'RBL Bank',
      network: 'VISA'
    },
    {
      id: '9',
      name: 'RBL Bajaj Finserv',
      type: 'VISA',
      number: '4391230898849636',
      cvv: '230',
      pin: '946',
      limit: 160000,
      statementDate: '12 August',
      paymentDate: '2 Sep',
      annualFee: 1000,
      renewMonth: 'Dec',
      waveOffLimit: 200000,
      primaryUse: 'Airport lounges, concierge service',
      cashback: 'NA',
      rewardPoints: 'NA',
      rewardValue: 0,
      rewardExpiry: 0,
      rewardLimit: 'NA',
      partnerMerchants: 'Airport lounges, concierge service',
      nationalAirport: 'Yes',
      internationalAirport: 'Yes',
      railwayLounge: 'NA',
      bank: 'RBL Bank',
      network: 'VISA'
    },
    {
      id: '10',
      name: 'HDFC Millenia',
      type: 'DISCOVER',
      number: '36113573131471',
      cvv: '628',
      pin: '864',
      limit: 10000,
      statementDate: '19 Dec',
      paymentDate: '7 Jan',
      annualFee: 0,
      primaryUse: 'Select online merchants, other spends',
      cashback: '5% on select online merchants, 1% on others',
      rewardPoints: 'NA',
      rewardValue: 0,
      rewardExpiry: 24,
      rewardLimit: 'Fuel surcharge waiver up to ₹250 per statement cycle',
      partnerMerchants: 'Amazon, BookMyShow, Cult.fit, Flipkart, Myntra, Sony LIV, Swiggy, Tata CLiQ, Uber, Zomato',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'HDFC Bank',
      network: 'DISCOVER'
    },
    {
      id: '11',
      name: 'HDFC Neu',
      type: 'RUPAY',
      number: '6529250009245557',
      cvv: '831',
      pin: '644',
      limit: 10000,
      statementDate: '2 Feb',
      paymentDate: '21 Feb',
      annualFee: 499,
      renewMonth: 'Sep',
      primaryUse: 'Select online merchants, dining',
      cashback: '5% on select online merchants, 1% on others',
      rewardPoints: 'NA',
      rewardValue: 0,
      rewardExpiry: 24,
      rewardLimit: 'NA',
      partnerMerchants: 'Amazon, BookMyShow, Cult.fit, Flipkart, Myntra, Sony LIV, Swiggy, Tata CLiQ, Uber, Zomato',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'HDFC Bank',
      network: 'RUPAY'
    },
    {
      id: '12',
      name: 'Indusind Platinum Aura Edge',
      type: 'VISA',
      number: '4412859670930977',
      cvv: '128',
      pin: '750',
      limit: 151000,
      statementDate: '13 June',
      paymentDate: '2 July',
      annualFee: 0,
      primaryUse: 'Shopping, dining, travel',
      cashback: 'Up to 4 RP on select categories, 0.5 RP elsewhere',
      rewardPoints: 'Up to 4 RP on select categories, 0.5 RP elsewhere',
      rewardValue: 0.25,
      rewardExpiry: 24,
      rewardLimit: 'Max 2500 RP per calendar month for cash redemption',
      partnerMerchants: 'Amazon, Flipkart, Big Bazaar, Zee5, Apollo Pharmacy, Uber, Ola, etc.',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'IndusInd Bank',
      network: 'VISA'
    },
    {
      id: '13',
      name: 'Indusind Rupay',
      type: 'RUPAY',
      number: '3561420006556274',
      cvv: '929',
      pin: '755',
      limit: 100000,
      statementDate: '',
      paymentDate: '',
      annualFee: 0,
      primaryUse: 'Daily spends, UPI transactions',
      cashback: '1% on non-UPI transactions',
      rewardPoints: '2 RP on UPI transactions, 1 RP on non-UPI transactions',
      rewardValue: 0.6,
      rewardExpiry: 24,
      rewardLimit: 'NA',
      partnerMerchants: 'NA',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'IndusInd Bank',
      network: 'RUPAY'
    },
    {
      id: '14',
      name: 'ICICI Amazon',
      type: 'RUPAY',
      number: '4315812748438018',
      cvv: '332',
      pin: '954',
      limit: 460000,
      statementDate: '18 July',
      paymentDate: '5 Aug',
      annualFee: 0,
      primaryUse: 'Amazon India, partner merchants',
      cashback: '5% on Amazon India for Prime members',
      rewardPoints: 'NA',
      rewardValue: 0,
      rewardExpiry: 0,
      rewardLimit: 'NA',
      partnerMerchants: 'Amazon India, partner merchants',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'ICICI Bank',
      network: 'RUPAY'
    },
    {
      id: '15',
      name: 'ICICI Coral Rupay',
      type: 'RUPAY',
      number: '6528681673153027',
      cvv: '1131',
      pin: '985',
      limit: 0,
      statementDate: '2 August',
      paymentDate: '20 Aug',
      annualFee: 0,
      renewMonth: 'Aug',
      primaryUse: 'Dining, movies, groceries',
      cashback: 'NA',
      rewardPoints: '2X on dining, movies, groceries',
      rewardValue: 0.25,
      rewardExpiry: 0,
      rewardLimit: 'NA',
      partnerMerchants: 'Dining, movies, groceries',
      nationalAirport: 'Yes',
      internationalAirport: 'NA',
      railwayLounge: 'Yes',
      bank: 'ICICI Bank',
      network: 'RUPAY'
    },
    {
      id: '16',
      name: 'ICICI Adani One',
      type: 'VISA',
      number: '4786723001037027',
      cvv: '232',
      pin: '241',
      limit: 0,
      statementDate: '5 Aug',
      paymentDate: '23 Aug',
      annualFee: 0,
      renewMonth: 'Feb',
      waveOffLimit: 50000,
      primaryUse: 'Adani ecosystem spends, travel',
      cashback: 'NA',
      rewardPoints: '2X on Adani ecosystem spends, 1X on others',
      rewardValue: 0.25,
      rewardExpiry: 0,
      rewardLimit: 'NA',
      partnerMerchants: 'Adani Group companies including Adani Airports, Adani Gas, Adani Wilmar, Adani Power, etc.',
      nationalAirport: 'Yes',
      internationalAirport: 'Yes',
      railwayLounge: 'NA',
      bank: 'ICICI Bank',
      network: 'VISA'
    },
    {
      id: '17',
      name: 'Pop YES Bank',
      type: 'JCB',
      number: '3561395210028239',
      cvv: '132',
      pin: '345',
      limit: 300000,
      statementDate: '16 Aug',
      paymentDate: '5 Sep',
      annualFee: 0,
      primaryUse: 'Online spending, UPI transactions',
      cashback: 'NA',
      rewardPoints: '2 POPcoins on UPI transactions, 1 POPcoin on online spending',
      rewardValue: 0.25,
      rewardExpiry: 36,
      rewardLimit: 'NA',
      partnerMerchants: 'Amazon, Flipkart, Swiggy, Myntra, BookMyShow, Cleartrip, etc.',
      nationalAirport: 'NA',
      internationalAirport: 'NA',
      railwayLounge: 'NA',
      bank: 'YES Bank',
      network: 'JCB'
    }
  ]

  // Filter logic
  const filteredCards = useMemo(() => {
    return creditCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.partnerMerchants.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesBank = filterBank === '' || card.bank === filterBank
      const matchesNetwork = filterNetwork === '' || card.network === filterNetwork
      
      return matchesSearch && matchesBank && matchesNetwork
    })
  }, [searchTerm, filterBank, filterNetwork, creditCards])

  const uniqueBanks = [...new Set(creditCards.map(card => card.bank))].sort()
  const uniqueNetworks = [...new Set(creditCards.map(card => card.network))].sort()

  const maskCardNumber = (number: string) => {
    if (showNumbers) return number
    return '**** **** **** ' + number.slice(-4)
  }

  const maskCvvPin = (value: string) => {
    if (showNumbers) return value
    return '***'
  }

  const getNetworkColor = (network: string) => {
    const colors = {
      'VISA': 'bg-blue-100 text-blue-800',
      'MASTERCARD': 'bg-red-100 text-red-800',
      'RUPAY': 'bg-orange-100 text-orange-800',
      'DISCOVER': 'bg-purple-100 text-purple-800',
      'JCB': 'bg-green-100 text-green-800'
    }
    return colors[network as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getBankColor = (bank: string) => {
    const colors = {
      'SBI': 'border-l-blue-500',
      'Axis Bank': 'border-l-red-500',
      'HDFC Bank': 'border-l-orange-500',
      'ICICI Bank': 'border-l-purple-500',
      'IndusInd Bank': 'border-l-green-500',
      'RBL Bank': 'border-l-yellow-500',
      'Standard Chartered': 'border-l-indigo-500',
      'YES Bank': 'border-l-pink-500'
    }
    return colors[bank as keyof typeof colors] || 'border-l-gray-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your credit cards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-premium-600 hover:text-premium-800 font-medium transition-colors">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center">
                  <CreditCardIcon className="h-8 w-8 mr-3 text-primary-600" />
                  Credit Cards
                </h1>
                <p className="text-premium-600 font-medium">Manage your {creditCards.length} premium credit cards</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNumbers(!showNumbers)}
                className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  showNumbers 
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'bg-white/80 backdrop-blur-sm text-premium-700 hover:bg-white shadow-lg hover:shadow-xl border border-white/20'
                }`}
              >
                {showNumbers ? (
                  <><EyeSlashIcon className="h-5 w-5 mr-2" />Hide Details</>
                ) : (
                  <><EyeIcon className="h-5 w-5 mr-2" />Show Details</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="mb-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-8">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-8">Portfolio Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-lg border border-indigo-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {creditCards.length}
              </div>
              <div className="text-sm text-indigo-700 font-semibold mt-2">Total Cards</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-100">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                ₹{(creditCards.reduce((sum, card) => sum + card.limit, 0) / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-emerald-700 font-semibold mt-2">Credit Limit</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl shadow-lg border border-rose-100">
              <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                ₹{creditCards.reduce((sum, card) => sum + card.annualFee, 0).toLocaleString()}
              </div>
              <div className="text-sm text-rose-700 font-semibold mt-2">Annual Fees</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-lg border border-purple-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                {uniqueBanks.length}
              </div>
              <div className="text-sm text-purple-700 font-semibold mt-2">Banks</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards, banks, merchants..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
            >
              <option value="">All Banks</option>
              {uniqueBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={filterNetwork}
              onChange={(e) => setFilterNetwork(e.target.value)}
            >
              <option value="">All Networks</option>
              {uniqueNetworks.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>

            <div className="flex items-center text-sm text-gray-600">
              <FunnelIcon className="h-4 w-4 mr-1" />
              Showing {filteredCards.length} of {creditCards.length} cards
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-premium border-l-4 ${getBankColor(card.bank)} hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 hover:scale-105 border border-white/20`}
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
                    <p className="text-sm text-gray-600">{card.bank}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNetworkColor(card.network)}`}>
                    {card.network}
                  </span>
                </div>

                {/* Card Number & Details */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl mb-6 shadow-glass border border-white/10">
                  <div className="font-mono text-xl tracking-widest mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    {card.number}
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="text-slate-400 text-xs uppercase tracking-wide font-semibold">CVV</div>
                      <div className="font-mono font-bold text-white">{showNumbers ? card.cvv : '***'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs uppercase tracking-wide font-semibold">PIN</div>
                      <div className="font-mono font-bold text-white">{showNumbers ? card.pin : '***'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Limit</div>
                      <div className="font-bold text-emerald-400">₹{card.limit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Billing Details */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-600 text-xs uppercase tracking-wide font-medium">Statement Date</div>
                    <div className="font-semibold text-gray-900">{card.statementDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs uppercase tracking-wide font-medium">Payment Date</div>
                    <div className="font-semibold text-gray-900">{card.paymentDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs uppercase tracking-wide font-medium">Annual Fee</div>
                    <div className="font-semibold text-gray-900">₹{card.annualFee}</div>
                  </div>
                  {card.renewMonth && (
                    <div>
                      <div className="text-gray-600 text-xs uppercase tracking-wide font-medium">Renew Month</div>
                      <div className="font-semibold text-gray-900">{card.renewMonth}</div>
                    </div>
                  )}
                </div>

                {/* Benefits Summary */}
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-600 text-xs uppercase tracking-wide font-medium">Primary Use</div>
                    <div className="text-gray-900 font-medium">{card.primaryUse}</div>
                  </div>
                  
                  {card.cashback !== 'NA' && (
                    <div>
                      <div className="text-gray-600 text-xs uppercase tracking-wide font-medium">Cashback</div>
                      <div className="text-green-700 font-semibold">{card.cashback}</div>
                    </div>
                  )}

                  {card.rewardPoints !== 'NA' && (
                    <div>
                      <div className="text-gray-600 text-xs uppercase tracking-wide font-medium">Reward Points</div>
                      <div className="text-blue-700 font-semibold">{card.rewardPoints}</div>
                      {card.rewardValue > 0 && (
                        <div className="text-xs text-gray-600">1 RP = ₹{card.rewardValue}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Details - Always Visible */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 text-sm">
                  {card.waveOffLimit && (
                    <div>
                      <div className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-1">Fee Waiver Limit</div>
                      <div className="text-gray-900 font-semibold">₹{card.waveOffLimit.toLocaleString()}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-1">Partner Merchants</div>
                    <div className="text-gray-900 font-medium">{card.partnerMerchants}</div>
                  </div>

                  {card.rewardLimit && card.rewardLimit !== 'NA' && (
                    <div>
                      <div className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-1">Reward Limits</div>
                      <div className="text-gray-900 font-medium">{card.rewardLimit}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-1">Reward Expiry</div>
                      <div className="text-gray-900 font-semibold">{card.rewardExpiry} months</div>
                    </div>
                  </div>

                  {/* Lounge Access Icons */}
                  <div className="flex items-center space-x-4 mt-4 pt-2">
                    {card.nationalAirport === 'Yes' && (
                      <div className="flex items-center text-xs text-green-600">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        National Airport
                      </div>
                    )}
                    {card.internationalAirport === 'Yes' && (
                      <div className="flex items-center text-xs text-blue-600">
                        <GlobeAltIcon className="h-4 w-4 mr-1" />
                        International Airport
                      </div>
                    )}
                    {card.railwayLounge === 'Yes' && (
                      <div className="flex items-center text-xs text-purple-600">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        Railway Lounge
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}