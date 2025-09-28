'use client'

import { useMemo, useState } from 'react'
import { useRequireAuth } from '../../contexts/AuthContext'
import {
  BanknotesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TagIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { parse } from 'date-fns'
import { sanitizeFinancialInput } from '@/lib/security'

interface ExpenseData {
  id: string
  timestamp: string
  date: string // dd/MM/yyyy
  item: string
  amount: number
  purpose: string
  paidVia: string
  paymentType: string
  category: string
  subcategory: string
}

// Move static data out of the component to avoid re-allocations
const EXPENSES: ExpenseData[] = [
  { id: '1', timestamp: '02/02/2025 21:26:20', date: '02/02/2025', item: 'Poha + Samosa', amount: 20, purpose: 'Food: Eating out', paidVia: 'Cash', paymentType: 'Cash', category: 'Food', subcategory: 'Eating out' },
  { id: '2', timestamp: '03/02/2025 19:26:45', date: '03/02/2025', item: 'HDFC Neu', amount: 2857, purpose: 'HDFC Neu MP', paidVia: 'CBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '3', timestamp: '05/02/2025 07:31:20', date: '05/02/2025', item: 'Vegetables', amount: 90, purpose: 'Food: Vegetables', paidVia: 'Cash', paymentType: 'Cash', category: 'Food', subcategory: 'Vegetables' },
  { id: '4', timestamp: '05/02/2025 12:30:07', date: '05/02/2025', item: 'Medicine', amount: 3350, purpose: 'Health: Medicine', paidVia: 'SBI', paymentType: 'UPI', category: 'Health', subcategory: 'Medicine' },
  { id: '5', timestamp: '05/02/2025 12:32:30', date: '05/02/2025', item: 'Rogan', amount: 425, purpose: 'Health: Medicine', paidVia: 'SBI', paymentType: 'UPI', category: 'Health', subcategory: 'Medicine' },
  { id: '6', timestamp: '05/02/2025 13:03:19', date: '05/02/2025', item: 'Chips', amount: 226, purpose: 'Food: Snacks', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Snacks' },
  { id: '7', timestamp: '05/02/2025 17:18:39', date: '05/02/2025', item: 'Golgappa', amount: 40, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
  { id: '8', timestamp: '06/02/2025 04:24:44', date: '05/02/2025', item: 'Travel', amount: 100, purpose: 'Transport: Travel', paidVia: 'CBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '9', timestamp: '07/02/2025 10:16:50', date: '07/02/2025', item: 'Loan documents', amount: 1770, purpose: 'Loan: Home loan 1', paidVia: 'CBI', paymentType: 'UPI', category: 'Loan', subcategory: 'Home loan' },
  { id: '10', timestamp: '07/02/2025 18:56:12', date: '07/02/2025', item: 'Credit card payment', amount: 6846, purpose: 'ICICI Adani One MP', paidVia: 'CBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '11', timestamp: '09/02/2025 03:49:47', date: '09/02/2025', item: 'Food', amount: 204, purpose: 'Food: Swiggy', paidVia: 'Axis Rewards', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
  { id: '12', timestamp: '09/02/2025 20:53:49', date: '09/02/2025', item: 'Jacket', amount: 6700, purpose: 'Clothing', paidVia: 'ICICI Coral Rupay', paymentType: 'Credit Card', category: 'Shopping', subcategory: 'Clothing' },
  { id: '13', timestamp: '09/02/2025 20:55:33', date: '09/02/2025', item: 'Shoes', amount: 11628, purpose: 'Clothing', paidVia: 'ICICI Coral Rupay', paymentType: 'Credit Card', category: 'Shopping', subcategory: 'Clothing' },
  { id: '14', timestamp: '09/02/2025 20:56:26', date: '09/02/2025', item: 'Snacks', amount: 180, purpose: 'Food: Snacks', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Snacks' },
  { id: '15', timestamp: '09/02/2025 20:58:36', date: '09/02/2025', item: 'Uber', amount: 353, purpose: 'Transport: Travel', paidVia: 'SBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '16', timestamp: '10/02/2025 07:24:55', date: '10/02/2025', item: 'Vegetables', amount: 170, purpose: 'Food: Vegetables', paidVia: 'Cash', paymentType: 'Cash', category: 'Food', subcategory: 'Vegetables' },
  { id: '17', timestamp: '12/02/2025 05:39:48', date: '11/02/2025', item: 'Food', amount: 500, purpose: 'Food: Swiggy', paidVia: 'CBI', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '18', timestamp: '12/02/2025 12:09:32', date: '12/02/2025', item: 'Volini', amount: 187, purpose: 'Health: Medicine', paidVia: 'CBI', paymentType: 'UPI', category: 'Health', subcategory: 'Medicine' },
  { id: '19', timestamp: '13/02/2025 02:27:43', date: '13/02/2025', item: 'Food', amount: 240, purpose: 'Food: Swiggy', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '20', timestamp: '13/02/2025 12:46:27', date: '13/02/2025', item: 'Food', amount: 270, purpose: 'Food: Swiggy', paidVia: 'CBI', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '21', timestamp: '13/02/2025 13:44:39', date: '13/02/2025', item: 'Sugar badam', amount: 225, purpose: 'Health: Medicine', paidVia: 'ICICI Amazon', paymentType: 'Credit Card', category: 'Health', subcategory: 'Medicine' },
  { id: '22', timestamp: '13/02/2025 20:53:38', date: '13/02/2025', item: 'Food', amount: 103, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '23', timestamp: '14/02/2025 16:46:43', date: '14/02/2025', item: 'Food', amount: 178, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '24', timestamp: '15/02/2025 23:47:33', date: '15/02/2025', item: 'Food', amount: 210, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '25', timestamp: '19/02/2025 09:56:53', date: '18/02/2025', item: 'Axis Neo CC', amount: 2184, purpose: 'Axis Neo MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '26', timestamp: '19/02/2025 09:57:53', date: '18/02/2025', item: 'Yes Bank CC', amount: 902, purpose: 'Pop YES Bank MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '27', timestamp: '19/02/2025 09:58:27', date: '18/02/2025', item: 'BPCL CC', amount: 2285, purpose: 'SBI BPCL MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '28', timestamp: '19/02/2025 09:59:41', date: '18/02/2025', item: 'Indusind', amount: 299, purpose: 'Indusind Platinum Aura Edge MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '29', timestamp: '19/02/2025 10:00:21', date: '18/02/2025', item: 'Simply Save', amount: 371, purpose: 'SBI Simply save MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '30', timestamp: '19/02/2025 10:01:16', date: '18/02/2025', item: 'ICICI', amount: 6846, purpose: 'ICICI Adani One MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '31', timestamp: '19/02/2025 10:02:34', date: '18/02/2025', item: 'SC', amount: 32005, purpose: 'SC EaseMyTrip MP', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '32', timestamp: '19/02/2025 17:23:51', date: '19/02/2025', item: 'Food', amount: 251, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '33', timestamp: '20/02/2025 12:50:23', date: '22/02/2025', item: 'Google one', amount: 1300, purpose: 'Miscellaneous', paidVia: 'Axis Neo', paymentType: 'Credit Card', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '34', timestamp: '21/02/2025 05:20:15', date: '21/02/2025', item: 'Food', amount: 161, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '35', timestamp: '21/02/2025 11:19:55', date: '21/02/2025', item: 'Septlin', amount: 202, purpose: 'Health: Medicine', paidVia: 'CBI', paymentType: 'UPI', category: 'Health', subcategory: 'Medicine' },
  { id: '36', timestamp: '21/02/2025 11:29:42', date: '21/02/2025', item: 'Food', amount: 135, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '37', timestamp: '22/02/2025 02:09:06', date: '22/02/2025', item: 'Food', amount: 262, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '38', timestamp: '22/02/2025 15:05:02', date: '22/02/2025', item: 'Food', amount: 100, purpose: 'Food: Swiggy', paidVia: 'CBI', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '39', timestamp: '23/02/2025 00:46:55', date: '22/02/2025', item: 'Ride', amount: 60, purpose: 'Transport: Travel', paidVia: 'Amazon Pay', paymentType: 'Amazon Pay', category: 'Transport', subcategory: 'Travel' },
  { id: '40', timestamp: '23/02/2025 00:47:26', date: '23/02/2025', item: 'Ride', amount: 70, purpose: 'Transport: Travel', paidVia: 'SBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '41', timestamp: '23/02/2025 00:48:20', date: '23/02/2025', item: 'Pamist', amount: 500, purpose: 'Miscellaneous', paidVia: 'Cash', paymentType: 'Cash', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '42', timestamp: '23/02/2025 02:48:00', date: '23/02/2025', item: 'Food', amount: 135, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '43', timestamp: '23/02/2025 18:20:15', date: '23/02/2025', item: 'Uber one', amount: 79, purpose: 'Transport: Travel', paidVia: 'SBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '44', timestamp: '25/02/2025 01:05:33', date: '25/02/2025', item: 'Food', amount: 135, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '45', timestamp: '25/02/2025 01:08:02', date: '24/02/2025', item: 'Ride', amount: 241, purpose: 'Transport: Travel', paidVia: 'CBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '46', timestamp: '25/02/2025 02:14:22', date: '25/02/2025', item: 'Ankle weight', amount: 269, purpose: 'Health: Supliments + Vitamins', paidVia: 'CBI', paymentType: 'UPI', category: 'Health', subcategory: 'Supplements' },
  { id: '47', timestamp: '26/02/2025 22:06:34', date: '26/02/2025', item: 'Pooja', amount: 786, purpose: 'Miscellaneous', paidVia: 'HDFC Neu', paymentType: 'Credit Card', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '48', timestamp: '26/02/2025 22:07:17', date: '26/02/2025', item: 'Pooja', amount: 300, purpose: 'Miscellaneous', paidVia: 'Cash', paymentType: 'Cash', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '49', timestamp: '01/03/2025 08:15:16', date: '28/02/2025', item: 'Petrol', amount: 1000, purpose: 'Transport: Petrol', paidVia: 'RBL Platinum Delight', paymentType: 'Credit Card', category: 'Transport', subcategory: 'Petrol' },
  { id: '50', timestamp: '01/03/2025 08:16:03', date: '01/03/2025', item: 'Visiting card', amount: 100, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '51', timestamp: '01/03/2025 08:16:30', date: '28/02/2025', item: 'Edu loan', amount: 30000, purpose: 'Loan: Education loan', paidVia: 'CBI', paymentType: 'UPI', category: 'Loan', subcategory: 'Education loan' },
  { id: '52', timestamp: '01/03/2025 23:50:09', date: '01/03/2025', item: 'Slipper', amount: 725, purpose: 'Shopping', paidVia: 'SBI', paymentType: 'UPI', category: 'Shopping', subcategory: 'Footwear' },
  { id: '53', timestamp: '02/03/2025 11:23:53', date: '02/03/2025', item: 'CC bill pay', amount: 9054, purpose: 'ICICI Amazon MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '54', timestamp: '02/03/2025 14:33:18', date: '02/03/2025', item: 'Bright the soul', amount: 1000, purpose: 'Subscriptions: Donation', paidVia: 'SBI', paymentType: 'UPI', category: 'Subscription', subcategory: 'Donation' },
  { id: '55', timestamp: '03/03/2025 09:45:04', date: '03/03/2025', item: 'HDFC Neu', amount: 786, purpose: 'HDFC Neu MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '56', timestamp: '03/03/2025 09:48:20', date: '03/03/2025', item: 'Axis neo', amount: 3003, purpose: 'Axis Neo MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '57', timestamp: '03/03/2025 09:51:21', date: '03/03/2025', item: 'ICICI Amazon', amount: 18942, purpose: 'ICICI Amazon MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
  { id: '58', timestamp: '03/03/2025 17:15:48', date: '03/03/2025', item: 'Coffee', amount: 296, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
  { id: '59', timestamp: '04/03/2025 12:26:03', date: '04/03/2025', item: 'Food', amount: 60, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
  { id: '60', timestamp: '04/03/2025 14:04:26', date: '04/03/2025', item: 'Ride', amount: 400, purpose: 'Transport: Travel', paidVia: 'Amazon Pay', paymentType: 'Amazon Pay', category: 'Transport', subcategory: 'Travel' },
  { id: '61', timestamp: '05/09/2025 20:57:30', date: '05/09/2025', item: 'Food', amount: 275, purpose: 'Food: Snacks', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Snacks' },
  { id: '62', timestamp: '08/09/2025 00:59:56', date: '08/09/2025', item: 'Wifi', amount: 825, purpose: 'Data: WiFi', paidVia: 'SBI', paymentType: 'UPI', category: 'Data', subcategory: 'WiFi' },
  { id: '63', timestamp: '08/09/2025 01:00:29', date: '08/09/2025', item: 'Delhi ticket', amount: 2233, purpose: 'Transport: Travel', paidVia: 'ICICI Adani One', paymentType: 'Credit Card', category: 'Transport', subcategory: 'Travel' },
  { id: '64', timestamp: '09/09/2025 03:41:12', date: '09/09/2025', item: 'Food', amount: 271, purpose: 'Food: Eating out', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Eating out' },
  { id: '65', timestamp: '10/09/2025 23:33:44', date: '10/09/2025', item: 'Rides', amount: 825, purpose: 'Transport: Travel', paidVia: 'SBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '66', timestamp: '10/09/2025 23:38:14', date: '10/09/2025', item: 'Food', amount: 430, purpose: 'Food: Eating out', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Eating out' },
  { id: '67', timestamp: '10/09/2025 23:38:56', date: '10/09/2025', item: 'Rent agreement', amount: 350, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '68', timestamp: '13/09/2025 12:51:24', date: '13/09/2025', item: 'Zepto', amount: 121, purpose: 'Food: Groceries', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Groceries' },
  { id: '69', timestamp: '13/09/2025 13:02:24', date: '12/09/2025', item: 'Slice card fee', amount: 300, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '70', timestamp: '13/09/2025 13:04:18', date: '12/09/2025', item: 'Food Zepto', amount: 126, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
  { id: '71', timestamp: '13/09/2025 13:04:59', date: '12/09/2025', item: 'Rent agreement', amount: 350, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '72', timestamp: '13/09/2025 13:05:32', date: '12/09/2025', item: 'Courier', amount: 110, purpose: 'Miscellaneous', paidVia: 'Simpl', paymentType: 'Simpl', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '73', timestamp: '13/09/2025 13:08:20', date: '12/09/2025', item: 'Travel', amount: 186, purpose: 'Transport: Travel', paidVia: 'Simpl', paymentType: 'Simpl', category: 'Transport', subcategory: 'Travel' },
  { id: '74', timestamp: '13/09/2025 13:08:47', date: '12/09/2025', item: 'Water', amount: 20, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
  { id: '75', timestamp: '13/09/2025 13:14:20', date: '12/09/2025', item: 'Food', amount: 154, purpose: 'Food: Snacks', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Snacks' },
  { id: '76', timestamp: '13/09/2025 19:01:45', date: '13/09/2025', item: 'Food', amount: 153, purpose: 'Food: Swiggy', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '77', timestamp: '14/09/2025 15:19:28', date: '14/09/2025', item: 'Perfume', amount: 194, purpose: 'Grooming: Toiletries', paidVia: 'ICICI Amazon', paymentType: 'Credit Card', category: 'Grooming', subcategory: 'Toiletries' },
  { id: '78', timestamp: '14/09/2025 15:58:53', date: '14/09/2025', item: 'Food', amount: 114, purpose: 'Food: Eating out', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
  { id: '79', timestamp: '14/09/2025 22:46:30', date: '14/09/2025', item: 'Food', amount: 140, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
  { id: '80', timestamp: '15/09/2025 00:04:21', date: '15/09/2025', item: 'Food', amount: 147, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
  { id: '81', timestamp: '15/09/2025 15:06:32', date: '15/09/2025', item: 'Food', amount: 96, purpose: 'Food: Swiggy', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '82', timestamp: '15/09/2025 17:35:51', date: '15/09/2025', item: 'Courier', amount: 35, purpose: 'Miscellaneous', paidVia: 'SBI BPCL', paymentType: 'Credit Card', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '83', timestamp: '15/09/2025 17:52:16', date: '15/09/2025', item: 'Printing', amount: 200, purpose: 'Miscellaneous', paidVia: 'Slice', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '84', timestamp: '17/09/2025 04:40:03', date: '17/09/2025', item: 'Coder', amount: 440, purpose: 'Miscellaneous', paidVia: 'ICICI Amazon', paymentType: 'Credit Card', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '85', timestamp: '17/09/2025 04:40:30', date: '16/09/2025', item: 'Travel', amount: 50, purpose: 'Transport: Travel', paidVia: 'Slice', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '86', timestamp: '17/09/2025 10:13:02', date: '17/09/2025', item: 'Food', amount: 200, purpose: 'Food: Fruits', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Fruits' },
  { id: '87', timestamp: '17/09/2025 19:18:21', date: '17/09/2025', item: 'Stamp', amount: 250, purpose: 'Miscellaneous', paidVia: 'Slice', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
  { id: '88', timestamp: '18/09/2025 05:24:25', date: '18/09/2025', item: 'Food', amount: 172, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
  { id: '89', timestamp: '18/09/2025 16:03:27', date: '18/09/2025', item: 'Warp subscription', amount: 400, purpose: 'Miscellaneous', paidVia: 'ICICI Adani One', paymentType: 'Credit Card', category: 'Subscription', subcategory: 'Software' },
  { id: '90', timestamp: '18/09/2025 19:06:07', date: '18/09/2025', item: 'Food', amount: 110, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
  { id: '91', timestamp: '18/09/2025 23:52:35', date: '18/09/2025', item: 'Food', amount: 222, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
  { id: '92', timestamp: '19/09/2025 18:48:18', date: '19/09/2025', item: 'Food', amount: 23, purpose: 'Food: Groceries', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Groceries' },
  { id: '93', timestamp: '20/09/2025 02:19:56', date: '20/09/2025', item: 'Travel', amount: 88, purpose: 'Transport: Travel', paidVia: 'Slice', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '94', timestamp: '20/09/2025 02:20:30', date: '20/09/2025', item: 'Food', amount: 70, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
  { id: '95', timestamp: '20/09/2025 02:45:25', date: '20/09/2025', item: 'Food', amount: 169, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
  { id: '96', timestamp: '20/09/2025 03:35:02', date: '20/09/2025', item: 'Food', amount: 108, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
  { id: '97', timestamp: '20/09/2025 21:24:09', date: '20/09/2025', item: 'Travel urbainia', amount: 840, purpose: 'Transport: Travel', paidVia: 'SBI BPCL', paymentType: 'Credit Card', category: 'Transport', subcategory: 'Travel' },
  { id: '98', timestamp: '20/09/2025 21:24:44', date: '20/09/2025', item: 'travel from urbainia', amount: 800, purpose: 'Transport: Travel', paidVia: 'Slice', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
  { id: '99', timestamp: '20/09/2025 21:25:19', date: '20/09/2025', item: 'Food', amount: 50, purpose: 'Food: Snacks', paidVia: 'Cash', paymentType: 'Cash', category: 'Food', subcategory: 'Snacks' },
  { id: '100', timestamp: '21/09/2025 03:19:23', date: '21/09/2025', item: 'Food', amount: 286, purpose: 'Food: Swiggy', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
  { id: '101', timestamp: '21/09/2025 07:22:44', date: '21/09/2025', item: 'Grocery', amount: 176, purpose: 'Food: Groceries', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Groceries' }
]

type SortKey = 'date' | 'amount' | 'item' | 'category'

function parseDMY(dateStr: string) {
  const d = parse(dateStr, 'dd/MM/yyyy', new Date())
  return d.getTime()
}

export default function Expenses() {
  const { loading } = useRequireAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const uniqueCategories = useMemo(() => [...new Set(EXPENSES.map(e => e.category))].sort(), [])
  const uniquePaymentMethods = useMemo(() => [...new Set(EXPENSES.map(e => e.paymentType))].sort(), [])
  const months = ['01','02','03','04','05','06','07','08','09','10','11','12']

  const filteredSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const by = sortBy

    const res = EXPENSES.filter(expense => {
      const matchesSearch = term === '' ||
        expense.item.toLowerCase().includes(term) ||
        expense.purpose.toLowerCase().includes(term) ||
        expense.paidVia.toLowerCase().includes(term)

      const matchesCategory = !filterCategory || expense.category === filterCategory
      const matchesPaymentMethod = !filterPaymentMethod || expense.paymentType === filterPaymentMethod
      const expenseMonth = expense.date.split('/')[1]
      const matchesMonth = !filterMonth || expenseMonth === filterMonth

      return matchesSearch && matchesCategory && matchesPaymentMethod && matchesMonth
    }).sort((a, b) => {
      let aVal: number | string
      let bVal: number | string
      if (by === 'amount') {
        aVal = a.amount
        bVal = b.amount
      } else if (by === 'date') {
        aVal = parseDMY(a.date)
        bVal = parseDMY(b.date)
      } else if (by === 'item') {
        aVal = a.item.toLowerCase()
        bVal = b.item.toLowerCase()
      } else {
        aVal = a.category.toLowerCase()
        bVal = b.category.toLowerCase()
      }

      if (aVal === bVal) return 0
      const cmp = aVal > (bVal as any) ? 1 : -1
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return res
  }, [searchTerm, filterCategory, filterPaymentMethod, filterMonth, sortBy, sortOrder])

  const totalExpenses = useMemo(() => filteredSorted.reduce((sum, e) => sum + e.amount, 0), [filteredSorted])
  const avgExpense = filteredSorted.length ? totalExpenses / filteredSorted.length : 0

  const categoryBreakdown = useMemo(() => {
    const totals = uniqueCategories.map(category => {
      const items = filteredSorted.filter(e => e.category === category)
      const total = items.reduce((s, e) => s + e.amount, 0)
      return {
        category,
        total,
        count: items.length,
        percentage: totalExpenses ? (total / totalExpenses) * 100 : 0
      }
    }).filter(i => i.total > 0).sort((a,b) => b.total - a.total)
    return totals
  }, [filteredSorted, totalExpenses, uniqueCategories])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => filteredSorted.slice((currentPage-1)*pageSize, currentPage*pageSize), [filteredSorted, currentPage])

  const getPaymentIcon = (paymentType: string) => {
    switch (paymentType) {
      case 'Credit Card':
        return <CreditCardIcon className="h-4 w-4" />
      case 'UPI':
        return <BuildingLibraryIcon className="h-4 w-4" />
      case 'Cash':
        return <BanknotesIcon className="h-4 w-4" />
      default:
        return <TagIcon className="h-4 w-4" />
    }
  }

  const getPaymentColor = (paymentType: string) => {
    switch (paymentType) {
      case 'Credit Card':
        return 'text-purple-600 bg-purple-50'
      case 'UPI':
        return 'text-primary-600 bg-primary-50'
      case 'Cash':
        return 'text-emerald-600 bg-emerald-50'
      case 'Amazon Pay':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string,string> = {
      'Food': 'bg-emerald-100 text-emerald-800',
      'Transport': 'bg-blue-100 text-blue-800',
      'Health': 'bg-rose-100 text-rose-800',
      'Shopping': 'bg-violet-100 text-violet-800',
      'Credit Card': 'bg-primary-100 text-primary-800',
      'Miscellaneous': 'bg-gray-100 text-gray-800',
      'Subscription': 'bg-yellow-100 text-yellow-800',
      'Loan': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  ← Back to Dashboard
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BanknotesIcon className="h-8 w-8 mr-3 text-primary-600" />
                    Expenses
                  </h1>
                  <p className="text-gray-600">Track your {EXPENSES.length} transactions</p>
                </div>
              </div>
              <Link
                href="/transactions/add"
                className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Transaction
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-700">
                {filteredSorted.length}
              </div>
              <div className="text-sm text-primary-600 font-medium mt-1">Transactions</div>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-lg">
              <div className="text-2xl font-bold text-rose-700">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-rose-600 font-medium mt-1">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-700">
                ₹{avgExpense.toFixed(0)}
              </div>
              <div className="text-sm text-emerald-600 font-medium mt-1">Avg Transaction</div>
            </div>
            <div className="text-center p-4 bg-violet-50 rounded-lg">
              <div className="text-2xl font-bold text-violet-700">
                {uniqueCategories.length}
              </div>
              <div className="text-sm text-violet-600 font-medium mt-1">Categories</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {categoryBreakdown.slice(0, 6).map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category.category)}`}>
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-600">{category.count} items</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">₹{category.total.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  aria-label="Search expenses"
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
              >
                <option value="">All Payment Methods</option>
                {uniquePaymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    {new Date(2025, parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="item">Sort by Item</option>
                <option value="category">Sort by Category</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                aria-label="Toggle sort order"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <FunnelIcon className="h-4 w-4 mr-1" />
              Showing {filteredSorted.length} of {EXPENSES.length} transactions
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <caption className="sr-only">Expense transactions</caption>
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Via</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paged.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{expense.date}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{expense.item}</div>
                        <div className="text-sm text-gray-500">{expense.purpose}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">₹{expense.amount.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPaymentColor(expense.paymentType)}`}>
                          {getPaymentIcon(expense.paymentType)}
                          <span className="ml-1">{expense.paymentType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.paidVia}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {filteredSorted.length === 0 && (
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found matching your criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredSorted.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="space-x-2">
                <button
                  className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <button
                  className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
    { id: '3', timestamp: '05/02/2025 07:31:20', date: '05/02/2025', item: 'Vegetables', amount: 90, purpose: 'Food: Vegetables', paidVia: 'Cash', paymentType: 'Cash', category: 'Food', subcategory: 'Vegetables' },
    { id: '4', timestamp: '05/02/2025 12:30:07', date: '05/02/2025', item: 'Medicine', amount: 3350, purpose: 'Health: Medicine', paidVia: 'SBI', paymentType: 'UPI', category: 'Health', subcategory: 'Medicine' },
    { id: '5', timestamp: '05/02/2025 12:32:30', date: '05/02/2025', item: 'Rogan', amount: 425, purpose: 'Health: Medicine', paidVia: 'SBI', paymentType: 'UPI', category: 'Health', subcategory: 'Medicine' },
    { id: '6', timestamp: '05/02/2025 13:03:19', date: '05/02/2025', item: 'Chips', amount: 226, purpose: 'Food: Snacks', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Snacks' },
    { id: '7', timestamp: '05/02/2025 17:18:39', date: '05/02/2025', item: 'Golgappa', amount: 40, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
    { id: '8', timestamp: '06/02/2025 04:24:44', date: '05/02/2025', item: 'Travel', amount: 100, purpose: 'Transport: Travel', paidVia: 'CBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '9', timestamp: '07/02/2025 10:16:50', date: '07/02/2025', item: 'Loan documents', amount: 1770, purpose: 'Loan: Home loan 1', paidVia: 'CBI', paymentType: 'UPI', category: 'Loan', subcategory: 'Home loan' },
    { id: '10', timestamp: '07/02/2025 18:56:12', date: '07/02/2025', item: 'Credit card payment', amount: 6846, purpose: 'ICICI Adani One MP', paidVia: 'CBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '11', timestamp: '09/02/2025 03:49:47', date: '09/02/2025', item: 'Food', amount: 204, purpose: 'Food: Swiggy', paidVia: 'Axis Rewards', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
    { id: '12', timestamp: '09/02/2025 20:53:49', date: '09/02/2025', item: 'Jacket', amount: 6700, purpose: 'Clothing', paidVia: 'ICICI Coral Rupay', paymentType: 'Credit Card', category: 'Shopping', subcategory: 'Clothing' },
    { id: '13', timestamp: '09/02/2025 20:55:33', date: '09/02/2025', item: 'Shoes', amount: 11628, purpose: 'Clothing', paidVia: 'ICICI Coral Rupay', paymentType: 'Credit Card', category: 'Shopping', subcategory: 'Clothing' },
    { id: '14', timestamp: '09/02/2025 20:56:26', date: '09/02/2025', item: 'Snacks', amount: 180, purpose: 'Food: Snacks', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Snacks' },
    { id: '15', timestamp: '09/02/2025 20:58:36', date: '09/02/2025', item: 'Uber', amount: 353, purpose: 'Transport: Travel', paidVia: 'SBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '16', timestamp: '10/02/2025 07:24:55', date: '10/02/2025', item: 'Vegetables', amount: 170, purpose: 'Food: Vegetables', paidVia: 'Cash', paymentType: 'Cash', category: 'Food', subcategory: 'Vegetables' },
    { id: '17', timestamp: '12/02/2025 05:39:48', date: '11/02/2025', item: 'Food', amount: 500, purpose: 'Food: Swiggy', paidVia: 'CBI', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '18', timestamp: '12/02/2025 12:09:32', date: '12/02/2025', item: 'Volini', amount: 187, purpose: 'Health: Medicine', paidVia: 'CBI', paymentType: 'UPI', category: 'Health', subcategory: 'Medicine' },
    { id: '19', timestamp: '13/02/2025 02:27:43', date: '13/02/2025', item: 'Food', amount: 240, purpose: 'Food: Swiggy', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '20', timestamp: '13/02/2025 12:46:27', date: '13/02/2025', item: 'Food', amount: 270, purpose: 'Food: Swiggy', paidVia: 'CBI', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '21', timestamp: '13/02/2025 13:44:39', date: '13/02/2025', item: 'Sugar badam', amount: 225, purpose: 'Health: Medicine', paidVia: 'ICICI Amazon', paymentType: 'Credit Card', category: 'Health', subcategory: 'Medicine' },
    { id: '22', timestamp: '13/02/2025 20:53:38', date: '13/02/2025', item: 'Food', amount: 103, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '23', timestamp: '14/02/2025 16:46:43', date: '14/02/2025', item: 'Food', amount: 178, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '24', timestamp: '15/02/2025 23:47:33', date: '15/02/2025', item: 'Food', amount: 210, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '25', timestamp: '19/02/2025 09:56:53', date: '18/02/2025', item: 'Axis Neo CC', amount: 2184, purpose: 'Axis Neo MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '26', timestamp: '19/02/2025 09:57:53', date: '18/02/2025', item: 'Yes Bank CC', amount: 902, purpose: 'Pop YES Bank MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '27', timestamp: '19/02/2025 09:58:27', date: '18/02/2025', item: 'BPCL CC', amount: 2285, purpose: 'SBI BPCL MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '28', timestamp: '19/02/2025 09:59:41', date: '18/02/2025', item: 'Indusind', amount: 299, purpose: 'Indusind Platinum Aura Edge MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '29', timestamp: '19/02/2025 10:00:21', date: '18/02/2025', item: 'Simply Save', amount: 371, purpose: 'SBI Simply save MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '30', timestamp: '19/02/2025 10:01:16', date: '18/02/2025', item: 'ICICI', amount: 6846, purpose: 'ICICI Adani One MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '31', timestamp: '19/02/2025 10:02:34', date: '18/02/2025', item: 'SC', amount: 32005, purpose: 'SC EaseMyTrip MP', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '32', timestamp: '19/02/2025 17:23:51', date: '19/02/2025', item: 'Food', amount: 251, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '33', timestamp: '20/02/2025 12:50:23', date: '22/02/2025', item: 'Google one', amount: 1300, purpose: 'Miscellaneous', paidVia: 'Axis Neo', paymentType: 'Credit Card', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '34', timestamp: '21/02/2025 05:20:15', date: '21/02/2025', item: 'Food', amount: 161, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '35', timestamp: '21/02/2025 11:19:55', date: '21/02/2025', item: 'Septlin', amount: 202, purpose: 'Health: Medicine', paidVia: 'CBI', paymentType: 'UPI', category: 'Health', subcategory: 'Medicine' },
    { id: '36', timestamp: '21/02/2025 11:29:42', date: '21/02/2025', item: 'Food', amount: 135, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '37', timestamp: '22/02/2025 02:09:06', date: '22/02/2025', item: 'Food', amount: 262, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '38', timestamp: '22/02/2025 15:05:02', date: '22/02/2025', item: 'Food', amount: 100, purpose: 'Food: Swiggy', paidVia: 'CBI', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '39', timestamp: '23/02/2025 00:46:55', date: '22/02/2025', item: 'Ride', amount: 60, purpose: 'Transport: Travel', paidVia: 'Amazon Pay', paymentType: 'Amazon Pay', category: 'Transport', subcategory: 'Travel' },
    { id: '40', timestamp: '23/02/2025 00:47:26', date: '23/02/2025', item: 'Ride', amount: 70, purpose: 'Transport: Travel', paidVia: 'SBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '41', timestamp: '23/02/2025 00:48:20', date: '23/02/2025', item: 'Pamist', amount: 500, purpose: 'Miscellaneous', paidVia: 'Cash', paymentType: 'Cash', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '42', timestamp: '23/02/2025 02:48:00', date: '23/02/2025', item: 'Food', amount: 135, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '43', timestamp: '23/02/2025 18:20:15', date: '23/02/2025', item: 'Uber one', amount: 79, purpose: 'Transport: Travel', paidVia: 'SBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '44', timestamp: '25/02/2025 01:05:33', date: '25/02/2025', item: 'Food', amount: 135, purpose: 'Food: Swiggy', paidVia: 'Jupiter', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '45', timestamp: '25/02/2025 01:08:02', date: '24/02/2025', item: 'Ride', amount: 241, purpose: 'Transport: Travel', paidVia: 'CBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '46', timestamp: '25/02/2025 02:14:22', date: '25/02/2025', item: 'Ankle weight', amount: 269, purpose: 'Health: Supliments + Vitamins', paidVia: 'CBI', paymentType: 'UPI', category: 'Health', subcategory: 'Supplements' },
    { id: '47', timestamp: '26/02/2025 22:06:34', date: '26/02/2025', item: 'Pooja', amount: 786, purpose: 'Miscellaneous', paidVia: 'HDFC Neu', paymentType: 'Credit Card', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '48', timestamp: '26/02/2025 22:07:17', date: '26/02/2025', item: 'Pooja', amount: 300, purpose: 'Miscellaneous', paidVia: 'Cash', paymentType: 'Cash', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '49', timestamp: '01/03/2025 08:15:16', date: '28/02/2025', item: 'Petrol', amount: 1000, purpose: 'Transport: Petrol', paidVia: 'RBL Platinum Delight', paymentType: 'Credit Card', category: 'Transport', subcategory: 'Petrol' },
    { id: '50', timestamp: '01/03/2025 08:16:03', date: '01/03/2025', item: 'Visiting card', amount: 100, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '51', timestamp: '01/03/2025 08:16:30', date: '28/02/2025', item: 'Edu loan', amount: 30000, purpose: 'Loan: Education loan', paidVia: 'CBI', paymentType: 'UPI', category: 'Loan', subcategory: 'Education loan' },
    { id: '52', timestamp: '01/03/2025 23:50:09', date: '01/03/2025', item: 'Slipper', amount: 725, purpose: 'Shopping', paidVia: 'SBI', paymentType: 'UPI', category: 'Shopping', subcategory: 'Footwear' },
    { id: '53', timestamp: '02/03/2025 11:23:53', date: '02/03/2025', item: 'CC bill pay', amount: 9054, purpose: 'ICICI Amazon MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '54', timestamp: '02/03/2025 14:33:18', date: '02/03/2025', item: 'Bright the soul', amount: 1000, purpose: 'Subscriptions: Donation', paidVia: 'SBI', paymentType: 'UPI', category: 'Subscription', subcategory: 'Donation' },
    { id: '55', timestamp: '03/03/2025 09:45:04', date: '03/03/2025', item: 'HDFC Neu', amount: 786, purpose: 'HDFC Neu MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '56', timestamp: '03/03/2025 09:48:20', date: '03/03/2025', item: 'Axis neo', amount: 3003, purpose: 'Axis Neo MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '57', timestamp: '03/03/2025 09:51:21', date: '03/03/2025', item: 'ICICI Amazon', amount: 18942, purpose: 'ICICI Amazon MP', paidVia: 'SBI', paymentType: 'UPI', category: 'Credit Card', subcategory: 'Payment' },
    { id: '58', timestamp: '03/03/2025 17:15:48', date: '03/03/2025', item: 'Coffee', amount: 296, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
    { id: '59', timestamp: '04/03/2025 12:26:03', date: '04/03/2025', item: 'Food', amount: 60, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
    { id: '60', timestamp: '04/03/2025 14:04:26', date: '04/03/2025', item: 'Ride', amount: 400, purpose: 'Transport: Travel', paidVia: 'Amazon Pay', paymentType: 'Amazon Pay', category: 'Transport', subcategory: 'Travel' },
    { id: '61', timestamp: '05/09/2025 20:57:30', date: '05/09/2025', item: 'Food', amount: 275, purpose: 'Food: Snacks', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Snacks' },
    { id: '62', timestamp: '08/09/2025 00:59:56', date: '08/09/2025', item: 'Wifi', amount: 825, purpose: 'Data: WiFi', paidVia: 'SBI', paymentType: 'UPI', category: 'Data', subcategory: 'WiFi' },
    { id: '63', timestamp: '08/09/2025 01:00:29', date: '08/09/2025', item: 'Delhi ticket', amount: 2233, purpose: 'Transport: Travel', paidVia: 'ICICI Adani One', paymentType: 'Credit Card', category: 'Transport', subcategory: 'Travel' },
    { id: '64', timestamp: '09/09/2025 03:41:12', date: '09/09/2025', item: 'Food', amount: 271, purpose: 'Food: Eating out', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Eating out' },
    { id: '65', timestamp: '10/09/2025 23:33:44', date: '10/09/2025', item: 'Rides', amount: 825, purpose: 'Transport: Travel', paidVia: 'SBI', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '66', timestamp: '10/09/2025 23:38:14', date: '10/09/2025', item: 'Food', amount: 430, purpose: 'Food: Eating out', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Eating out' },
    { id: '67', timestamp: '10/09/2025 23:38:56', date: '10/09/2025', item: 'Rent agreement', amount: 350, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '68', timestamp: '13/09/2025 12:51:24', date: '13/09/2025', item: 'Zepto', amount: 121, purpose: 'Food: Groceries', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Groceries' },
    { id: '69', timestamp: '13/09/2025 13:02:24', date: '12/09/2025', item: 'Slice card fee', amount: 300, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '70', timestamp: '13/09/2025 13:04:18', date: '12/09/2025', item: 'Food Zepto', amount: 126, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
    { id: '71', timestamp: '13/09/2025 13:04:59', date: '12/09/2025', item: 'Rent agreement', amount: 350, purpose: 'Miscellaneous', paidVia: 'SBI', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '72', timestamp: '13/09/2025 13:05:32', date: '12/09/2025', item: 'Courier', amount: 110, purpose: 'Miscellaneous', paidVia: 'Simpl', paymentType: 'Simpl', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '73', timestamp: '13/09/2025 13:08:20', date: '12/09/2025', item: 'Travel', amount: 186, purpose: 'Transport: Travel', paidVia: 'Simpl', paymentType: 'Simpl', category: 'Transport', subcategory: 'Travel' },
    { id: '74', timestamp: '13/09/2025 13:08:47', date: '12/09/2025', item: 'Water', amount: 20, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
    { id: '75', timestamp: '13/09/2025 13:14:20', date: '12/09/2025', item: 'Food', amount: 154, purpose: 'Food: Snacks', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Snacks' },
    { id: '76', timestamp: '13/09/2025 19:01:45', date: '13/09/2025', item: 'Food', amount: 153, purpose: 'Food: Swiggy', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '77', timestamp: '14/09/2025 15:19:28', date: '14/09/2025', item: 'Perfume', amount: 194, purpose: 'Grooming: Toiletries', paidVia: 'ICICI Amazon', paymentType: 'Credit Card', category: 'Grooming', subcategory: 'Toiletries' },
    { id: '78', timestamp: '14/09/2025 15:58:53', date: '14/09/2025', item: 'Food', amount: 114, purpose: 'Food: Eating out', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
    { id: '79', timestamp: '14/09/2025 22:46:30', date: '14/09/2025', item: 'Food', amount: 140, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
    { id: '80', timestamp: '15/09/2025 00:04:21', date: '15/09/2025', item: 'Food', amount: 147, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
    { id: '81', timestamp: '15/09/2025 15:06:32', date: '15/09/2025', item: 'Food', amount: 96, purpose: 'Food: Swiggy', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '82', timestamp: '15/09/2025 17:35:51', date: '15/09/2025', item: 'Courier', amount: 35, purpose: 'Miscellaneous', paidVia: 'SBI BPCL', paymentType: 'Credit Card', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '83', timestamp: '15/09/2025 17:52:16', date: '15/09/2025', item: 'Printing', amount: 200, purpose: 'Miscellaneous', paidVia: 'Slice', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '84', timestamp: '17/09/2025 04:40:03', date: '17/09/2025', item: 'Coder', amount: 440, purpose: 'Miscellaneous', paidVia: 'ICICI Amazon', paymentType: 'Credit Card', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '85', timestamp: '17/09/2025 04:40:30', date: '16/09/2025', item: 'Travel', amount: 50, purpose: 'Transport: Travel', paidVia: 'Slice', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '86', timestamp: '17/09/2025 10:13:02', date: '17/09/2025', item: 'Food', amount: 200, purpose: 'Food: Fruits', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Fruits' },
    { id: '87', timestamp: '17/09/2025 19:18:21', date: '17/09/2025', item: 'Stamp', amount: 250, purpose: 'Miscellaneous', paidVia: 'Slice', paymentType: 'UPI', category: 'Miscellaneous', subcategory: 'Other' },
    { id: '88', timestamp: '18/09/2025 05:24:25', date: '18/09/2025', item: 'Food', amount: 172, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
    { id: '89', timestamp: '18/09/2025 16:03:27', date: '18/09/2025', item: 'Warp subscription', amount: 400, purpose: 'Miscellaneous', paidVia: 'ICICI Adani One', paymentType: 'Credit Card', category: 'Subscription', subcategory: 'Software' },
    { id: '90', timestamp: '18/09/2025 19:06:07', date: '18/09/2025', item: 'Food', amount: 110, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
    { id: '91', timestamp: '18/09/2025 23:52:35', date: '18/09/2025', item: 'Food', amount: 222, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
    { id: '92', timestamp: '19/09/2025 18:48:18', date: '19/09/2025', item: 'Food', amount: 23, purpose: 'Food: Groceries', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Groceries' },
    { id: '93', timestamp: '20/09/2025 02:19:56', date: '20/09/2025', item: 'Travel', amount: 88, purpose: 'Transport: Travel', paidVia: 'Slice', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '94', timestamp: '20/09/2025 02:20:30', date: '20/09/2025', item: 'Food', amount: 70, purpose: 'Food: Eating out', paidVia: 'SBI', paymentType: 'UPI', category: 'Food', subcategory: 'Eating out' },
    { id: '95', timestamp: '20/09/2025 02:45:25', date: '20/09/2025', item: 'Food', amount: 169, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
    { id: '96', timestamp: '20/09/2025 03:35:02', date: '20/09/2025', item: 'Food', amount: 108, purpose: 'Food: Swiggy', paidVia: 'Indusind Platinum Aura Edge', paymentType: 'Credit Card', category: 'Food', subcategory: 'Swiggy' },
    { id: '97', timestamp: '20/09/2025 21:24:09', date: '20/09/2025', item: 'Travel urbainia', amount: 840, purpose: 'Transport: Travel', paidVia: 'SBI BPCL', paymentType: 'Credit Card', category: 'Transport', subcategory: 'Travel' },
    { id: '98', timestamp: '20/09/2025 21:24:44', date: '20/09/2025', item: 'travel from urbainia', amount: 800, purpose: 'Transport: Travel', paidVia: 'Slice', paymentType: 'UPI', category: 'Transport', subcategory: 'Travel' },
    { id: '99', timestamp: '20/09/2025 21:25:19', date: '20/09/2025', item: 'Food', amount: 50, purpose: 'Food: Snacks', paidVia: 'Cash', paymentType: 'Cash', category: 'Food', subcategory: 'Snacks' },
    { id: '100', timestamp: '21/09/2025 03:19:23', date: '21/09/2025', item: 'Food', amount: 286, purpose: 'Food: Swiggy', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Swiggy' },
    { id: '101', timestamp: '21/09/2025 07:22:44', date: '21/09/2025', item: 'Grocery', amount: 176, purpose: 'Food: Groceries', paidVia: 'Slice', paymentType: 'UPI', category: 'Food', subcategory: 'Groceries' }
  ]

  // Filter and sort logic
  const filteredExpenses = useMemo(() => {
    return expenseData.filter(expense => {
      const matchesSearch = expense.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.paidVia.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = filterCategory === '' || expense.category === filterCategory
      const matchesPaymentMethod = filterPaymentMethod === '' || expense.paymentType === filterPaymentMethod
      
      const expenseMonth = expense.date.split('/')[1]
      const matchesMonth = filterMonth === '' || expenseMonth === filterMonth
      
      return matchesSearch && matchesCategory && matchesPaymentMethod && matchesMonth
    }).sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof ExpenseData]
      let bValue: string | number = b[sortBy as keyof ExpenseData]
      
      if (sortBy === 'amount') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortBy === 'date') {
        aValue = new Date((aValue as string).split('/').reverse().join('-')).getTime()
        bValue = new Date((bValue as string).split('/').reverse().join('-')).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [searchTerm, filterCategory, filterPaymentMethod, filterMonth, sortBy, sortOrder, expenseData])

  const uniqueCategories = [...new Set(expenseData.map(expense => expense.category))].sort()
  const uniquePaymentMethods = [...new Set(expenseData.map(expense => expense.paymentType))].sort()
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

  // Summary calculations
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0
  
  // Category breakdown
  const categoryBreakdown = uniqueCategories.map(category => {
    const categoryExpenses = filteredExpenses.filter(expense => expense.category === category)
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    return {
      category,
      total,
      count: categoryExpenses.length,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
    }
  }).filter(item => item.total > 0).sort((a, b) => b.total - a.total)

  const getPaymentIcon = (paymentType: string) => {
    switch (paymentType) {
      case 'Credit Card':
        return <CreditCardIcon className="h-4 w-4" />
      case 'UPI':
        return <BuildingLibraryIcon className="h-4 w-4" />
      case 'Cash':
        return <BanknotesIcon className="h-4 w-4" />
      default:
        return <TagIcon className="h-4 w-4" />
    }
  }

  const getPaymentColor = (paymentType: string) => {
    switch (paymentType) {
      case 'Credit Card':
        return 'text-purple-600 bg-purple-50'
      case 'UPI':
        return 'text-blue-600 bg-blue-50'
      case 'Cash':
        return 'text-green-600 bg-green-50'
      case 'Amazon Pay':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Food': 'bg-green-100 text-green-800',
      'Transport': 'bg-blue-100 text-blue-800',
      'Health': 'bg-red-100 text-red-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Credit Card': 'bg-indigo-100 text-indigo-800',
      'Miscellaneous': 'bg-gray-100 text-gray-800',
      'Subscription': 'bg-yellow-100 text-yellow-800',
      'Loan': 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  ← Back to Dashboard
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BanknotesIcon className="h-8 w-8 mr-3 text-indigo-600" />
                    Expenses
                  </h1>
                  <p className="text-gray-600">Track your {expenseData.length} transactions</p>
                </div>
              </div>
              <Link
                href="/transactions/add"
                className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Transaction
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-700">
                {filteredExpenses.length}
              </div>
              <div className="text-sm text-indigo-600 font-medium mt-1">Transactions</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                ₹{(totalExpenses / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-red-600 font-medium mt-1">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                ₹{avgExpense.toFixed(0)}
              </div>
              <div className="text-sm text-green-600 font-medium mt-1">Avg Transaction</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {uniqueCategories.length}
              </div>
              <div className="text-sm text-purple-600 font-medium mt-1">Categories</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {categoryBreakdown.slice(0, 6).map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category.category)}`}>
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-600">{category.count} items</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">₹{category.total.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
              >
                <option value="">All Payment Methods</option>
                {uniquePaymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    {new Date(2025, parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="item">Sort by Item</option>
                <option value="category">Sort by Category</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <FunnelIcon className="h-4 w-4 mr-1" />
              Showing {filteredExpenses.length} of {expenseData.length} transactions
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Via</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{expense.date}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{expense.item}</div>
                        <div className="text-sm text-gray-500">{expense.purpose}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPaymentColor(expense.paymentType)}`}>
                          {getPaymentIcon(expense.paymentType)}
                          <span className="ml-1">{expense.paymentType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.paidVia}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}