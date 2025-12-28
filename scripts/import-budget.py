import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('.env.local')

supabase = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
)

user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'

# Budget data - matching your 2025→2026 data
budget_data = [
    {'category': 'Loan - Education loan', 'limits': [29361]*12},
    {'category': 'Transport - Travel', 'limits': [1000]*12},
    {'category': 'Transport - Petrol', 'limits': [2000]*12},
    {'category': 'Transport - Bike Insurance', 'limits': [0,0,3000,0,0,0,0,0,0,0,0,0]},
    {'category': 'Transport - Bike Pollution Certificate', 'limits': [80,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Transport - Car Insurance', 'limits': [4000,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Transport - Car Pollution Certificate', 'limits': [100,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Data - Jio', 'limits': [3599,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Data - Airtel', 'limits': [1999,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Data - WiFi', 'limits': [3537,0,0,3537,0,0,3537,0,0,3537,0,0]},
    {'category': 'Self Growth - Books', 'limits': [2000]*12},
    {'category': 'Food - Eating out', 'limits': [1000]*12},
    {'category': 'Food - Swiggy', 'limits': [1000]*12},
    {'category': 'Food - Groceries', 'limits': [3000]*12},
    {'category': 'Food - Dry fruits', 'limits': [3000]*12},
    {'category': 'Food - Vegetables', 'limits': [3000]*12},
    {'category': 'Food - Fruits', 'limits': [3000]*12},
    {'category': 'Food - Snacks', 'limits': [400]*12},
    {'category': 'Grooming - Haircut', 'limits': [400]*12},
    {'category': 'Grooming - Toiletries', 'limits': [1000]*12},
    {'category': 'Health - Fitness bootcamp', 'limits': [0,0,0,10000,10000,0,0,0,0,0,0,0]},
    {'category': 'Health - Chef', 'limits': [8000]*12},
    {'category': 'Health - Yoga instructor', 'limits': [8000]*12},
    {'category': 'Health - Supplements + Vitamins', 'limits': [4000]*12},
    {'category': 'Health - Medicine', 'limits': [500]*12},
    {'category': 'Clothing', 'limits': [3000]*12},
    {'category': 'Insurance - Medical Insurance', 'limits': [20000,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Insurance - Life Insurance', 'limits': [20000,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Subscriptions - Donation', 'limits': [1000]*12},
    {'category': 'Subscriptions - Youtube', 'limits': [300]*12},
    {'category': 'Subscriptions - Google one', 'limits': [0,1300,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Subscriptions - Grok', 'limits': [700]*12},
    {'category': 'Subscriptions - LinkedIn Premium', 'limits': [2000,0,0,2000,0,0,2000,0,0,2000,0,0]},
    {'category': 'Credit Card Monthly - SBI BPCL MP', 'limits': [0,1300,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - SBI Paytm MP', 'limits': [0,2000,0,0,2000,0,0,2000,0,0,2000,0]},
    {'category': 'Credit Card Monthly - SBI Simply save MP', 'limits': [0]*12},
    {'category': 'Credit Card Monthly - SC EaseMyTrip MP', 'limits': [499,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - Axis Rewards MP', 'limits': [500,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - Axis My Zone MP', 'limits': [499,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - Axis Neo MP', 'limits': [350,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - RBL Platinum Delight MP', 'limits': [1000,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - RBL Bajaj Finserv MP', 'limits': [0]*12},
    {'category': 'Credit Card Monthly - HDFC Millenia MP', 'limits': [250,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - HDFC Neu MP', 'limits': [1000,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - Indusind Platinum Aura Edge MP', 'limits': [0]*12},
    {'category': 'Credit Card Monthly - Indusind Rupay (SC) MP', 'limits': [0]*12},
    {'category': 'Credit Card Monthly - ICICI Amazon MP', 'limits': [499,0,0,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card Monthly - ICICI Coral Rupay MP', 'limits': [0]*12},
    {'category': 'Credit Card Monthly - ICICI Adani One MP', 'limits': [0]*12},
    {'category': 'Credit Card Monthly - Pop YES Bank MP', 'limits': [0]*12},
    {'category': 'Credit Card EMI - SBI BPCL EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - SBI Paytm EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - SBI Simply save EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - SC EaseMyTrip EMI', 'limits': [2530]*8 + [0]*4},
    {'category': 'Credit Card EMI - Axis Rewards EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - Axis My Zone EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - Axis Neo EMI', 'limits': [300]*12},
    {'category': 'Credit Card EMI - RBL Platinum Delight EMI', 'limits': [1371]*10 + [0,0]},
    {'category': 'Credit Card EMI - RBL Bajaj Finserv EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - HDFC Millenia EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - HDFC Neu EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - Indusind Platinum Aura Edge EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - Indusind Rupay EMI', 'limits': [0]*12},
    {'category': 'Credit Card EMI - ICICI Amazon EMI', 'limits': [5779]*6 + [2390]*5 + [1859]},
    {'category': 'Credit Card EMI - ICICI Coral Rupay EMI', 'limits': [757,757,757,0,0,0,0,0,0,0,0,0]},
    {'category': 'Credit Card EMI - ICICI Adani One EMI', 'limits': [531]*10 + [0,0]},
    {'category': 'Credit Card EMI - Pop YES Bank EMI', 'limits': [400]*12},
    {'category': 'Pay Later - Simpl', 'limits': [0]*12},
    {'category': 'Pay Later - Lazypay', 'limits': [0]*12},
    {'category': 'Pay Later - Amazon Pay', 'limits': [0]*12},
    {'category': 'Misc - Amazon Pay Recharge', 'limits': [500]*12},
    {'category': 'Misc - Supplement', 'limits': [5000]*12},
    {'category': 'Misc - Shopping', 'limits': [2000]*12},
    {'category': 'Misc - Miscellaneous', 'limits': [2000]*12},
]

print('\n🔄 Importing 2026 Budget Data via Python...\n')

# Step 1: Delete existing 2026 budgets
print('Step 1: Clearing 2026 budget data...')
supabase.table('budgets').delete().eq('user_id', user_id).eq('year', 2026).execute()
print('✅ Cleared\n')

# Step 2: Get categories
print('Step 2: Fetching categories...')
categories = supabase.table('categories').select('*').eq('user_id', user_id).eq('type', 'expense').execute()
cat_map = {c['name']: c['id'] for c in categories.data}
print(f'✅ Found {len(cat_map)} categories\n')

# Step 3: Build and insert budget records
print('Step 3: Building budget records...')
records = []
for item in budget_data:
    cat_id = cat_map.get(item['category'])
    if not cat_id:
        print(f'⚠️  Skipping {item["category"]} - not found')
        continue
    
    for month in range(1, 13):
        records.append({
            'user_id': user_id,
            'category_id': cat_id,
            'category_name': item['category'],
            'monthly_limit': item['limits'][month-1],
            'year': 2026,
            'month': month,
            'spent_amount': 0
        })

print(f'📊 Inserting {len(records)} budget records...')
supabase.table('budgets').insert(records).execute()
print('✅ Inserted\n')

# Step 4: Verify
print('Step 4: Verification...')
result = supabase.table('budgets').select('*').eq('user_id', user_id).eq('year', 2026).execute()
total = sum(r['monthly_limit'] for r in result.data)
categories_count = len(set(r['category_name'] for r in result.data))

print(f'  Total records: {len(result.data)}')
print(f'  Categories: {categories_count}')
print(f'  Annual budget: ₹{total:,}')
print(f'  Monthly average: ₹{total//12:,}')
print('\n🎉 Import complete!\n')
