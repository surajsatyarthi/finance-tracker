
export const budgetCategories = {
  'Food': { name: 'Food', limit: 14400 },
  'Groceries': { name: 'Groceries', limit: 3000 },
  'Eating out': { name: 'Eating out', limit: 1000 },
  'Swiggy': { name: 'Swiggy', limit: 1000 },
  'Dry fruits': { name: 'Dry fruits', limit: 3000 },
  'Vegetables': { name: 'Vegetables', limit: 3000 },
  'Fruits': { name: 'Fruits', limit: 3000 },
  'Snacks': { name: 'Snacks', limit: 400 },

  'Transport': { name: 'Transport', limit: 7180 },
  'Petrol': { name: 'Petrol', limit: 2000 },
  'Travel': { name: 'Travel', limit: 1000 },
  'Bike Insurance': { name: 'Bike Insurance', limit: 0 },
  'Car Insurance': { name: 'Car Insurance', limit: 4000 },

  'Loan': { name: 'Loan', limit: 29361 },
  'Education loan': { name: 'Education Loan', limit: 29361 },

  'Health': { name: 'Health', limit: 20500 },
  'Chef': { name: 'Chef', limit: 8000 },
  'Yoga instructor': { name: 'Yoga Instructor', limit: 8000 },
  'Supliments + Vitamins': { name: 'Supplements', limit: 4000 },
  'Medicine': { name: 'Medicine', limit: 500 },
  'Grooming': { name: 'Grooming', limit: 1400 },
  'Haircut': { name: 'Haircut', limit: 400 },
  'Tolietries': { name: 'Toiletries', limit: 1000 },

  'Clothing': { name: 'Clothing', limit: 3000 },
  'Shopping': { name: 'Shopping', limit: 2000 },

  'Data': { name: 'Data & WiFi', limit: 9135 },
  'Jio': { name: 'Jio', limit: 3599 },
  'Airtel': { name: 'Airtel', limit: 1999 },
  'WiFi': { name: 'WiFi', limit: 3537 },

  'Self Growth': { name: 'Self Growth', limit: 2000 },
  'Books': { name: 'Books', limit: 2000 },

  'Subscriptions': { name: 'Subscriptions', limit: 4000 },
  'Youtube': { name: 'Youtube', limit: 300 },
  'Google one': { name: 'Google One', limit: 0 },
  'Grok': { name: 'Grok', limit: 700 },
  'LinkedIn Premium': { name: 'LinkedIn', limit: 2000 },

  'Insurance': { name: 'Insurance', limit: 40000 },
  'Donation': { name: 'Donation', limit: 1000 },
  'Miscellaneous': { name: 'Miscellaneous', limit: 2000 },

  'Credit Card Monthly': { name: 'CC Monthly', limit: 4597 },
  'Credit Card EMI': { name: 'CC EMI', limit: 11668 },
}

export const budgetProjections2025 = [
  { category: 'Education loan', limits: [29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361] },
  { category: 'Transport', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Using subcategories: Travel, Petrol, Insurance
  { category: 'Travel', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
  { category: 'Petrol', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
  { category: 'Bike Insurance', limits: [0, 0, 3000, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'Bike Pollution Certificate', limits: [80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'Car Insurance', limits: [4000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'Car Pollution Certificate', limits: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'Data', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Using subcategories: Jio, Airtel, Wifi
  { category: 'Jio', limits: [3599, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'Airtel', limits: [1999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'WiFi', limits: [3537, 0, 0, 3537, 0, 0, 3537, 0, 0, 3537, 0, 0] },
  { category: 'Self Growth', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Using subcategories
  { category: 'Books', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
  { category: 'Food', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Using subcategories
  { category: 'Eating out', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
  { category: 'Swiggy', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
  { category: 'Groceries', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
  { category: 'Dry fruits', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
  { category: 'Vegetables', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
  { category: 'Fruits', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
  { category: 'Snacks', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
  { category: 'Grooming', limits: [1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400] },
  { category: 'Haircut', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
  { category: 'Tolietries', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
  { category: 'Health', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Using subcategories: Fitness, Chef, etc.
  { category: 'Fitness bootcamp', limits: [0, 0, 0, 10000, 10000, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'Chef', limits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000] },
  { category: 'Yoga instructor', limits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000] },
  { category: 'Supliments + Vitamins', limits: [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000] },
  { category: 'Medicine', limits: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
  { category: 'Clothing', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
  { category: 'Insurance', limits: [40000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'Subscriptions', limits: [4000, 3300, 2000, 4000, 2000, 2000, 4000, 2000, 2000, 4000, 2000, 2000] },
  { category: 'Donation', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
  { category: 'Youtube', limits: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300] },
  { category: 'Google one', limits: [0, 1300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: 'Grok', limits: [700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700] },
  { category: 'LinkedIn Premium', limits: [2000, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0, 0] },
  { category: 'Credit Card Monthly', limits: [4597, 3300, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0] },
  { category: 'Credit Card EMI', limits: [11668, 11668, 11668, 10911, 10911, 10911, 7522, 7522, 4992, 4992, 3090, 2559] },
  { category: 'Shopping', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
  { category: 'Miscellaneous', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
  { category: 'Supplement', limits: [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000] }
]