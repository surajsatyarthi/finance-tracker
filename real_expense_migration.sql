
-- CRITICAL FINANCIAL DATA MIGRATION
-- Real expense transactions from daily tracking discipline
-- 214 transactions from February 2025 to July 2025
-- Handle with extreme care

-- Clear existing transactions for this user (optional - uncomment if needed)
-- DELETE FROM transactions WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense';

INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'ec9cea2b-6f04-453c-8da1-86efb8279a1b',
    '00000000-0000-0000-0000-000000000001',
    20.0,
    'expense',
    'Poha + Samosa',
    'cash',
    '2025-02-02',
    2,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '0c40db44-7970-4685-8830-90db0d21ef0d',
    '00000000-0000-0000-0000-000000000001',
    2857.0,
    'expense',
    'HDFC Neu',
    'upi',
    '2025-02-03',
    2,
    2025,
    'HDFC Neu MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '7faa896c-cee1-4e2c-9029-913acc9c1447',
    '00000000-0000-0000-0000-000000000001',
    90.0,
    'expense',
    'Vegetables',
    'cash',
    '2025-02-05',
    2,
    2025,
    'Vegetables',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '0ffd0c8a-4984-4911-bb09-3331e3e300c3',
    '00000000-0000-0000-0000-000000000001',
    3350.0,
    'expense',
    'Medicine',
    'upi',
    '2025-02-05',
    2,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '5f0e38e2-cd9c-4321-a150-2dca210925ce',
    '00000000-0000-0000-0000-000000000001',
    425.0,
    'expense',
    'Rogan',
    'upi',
    '2025-02-05',
    2,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '06971098-1e44-492d-a47d-e6c38f105c01',
    '00000000-0000-0000-0000-000000000001',
    226.0,
    'expense',
    'Chips',
    'upi',
    '2025-02-05',
    2,
    2025,
    'Snacks',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '5cf05b51-09c7-4aef-a6b2-b8436d1c5531',
    '00000000-0000-0000-0000-000000000001',
    40.0,
    'expense',
    'Golgappa',
    'upi',
    '2025-02-05',
    2,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '4d9c53bb-2f1d-4eb5-a71e-e2c309445f24',
    '00000000-0000-0000-0000-000000000001',
    100.0,
    'expense',
    'Travel',
    'upi',
    '2025-02-05',
    2,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '711e4c82-e155-43ae-b344-fe2f59a14634',
    '00000000-0000-0000-0000-000000000001',
    1770.0,
    'expense',
    'Loan documents',
    'upi',
    '2025-02-07',
    2,
    2025,
    'Home loan 1',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'de1b831c-158a-47c8-9f3f-48759a3fd9e0',
    '00000000-0000-0000-0000-000000000001',
    6846.0,
    'expense',
    'Credit card payment',
    'upi',
    '2025-02-07',
    2,
    2025,
    'ICICI Adani One MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '516b46c1-c95d-4f56-81bc-87796a0a1e47',
    '00000000-0000-0000-0000-000000000001',
    204.0,
    'expense',
    'Food',
    'card',
    '2025-02-09',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '161d1706-cae7-4f61-917e-1297edc9a1b6',
    '00000000-0000-0000-0000-000000000001',
    6700.0,
    'expense',
    'Jacket',
    'card',
    '2025-02-09',
    2,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '2b175d7f-0d4f-470e-bd84-102865ceb933',
    '00000000-0000-0000-0000-000000000001',
    11628.0,
    'expense',
    'Shoes',
    'card',
    '2025-02-09',
    2,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f17c62bd-18e0-43a7-9ac1-634b26c40d1d',
    '00000000-0000-0000-0000-000000000001',
    180.0,
    'expense',
    'Snacks',
    'upi',
    '2025-02-09',
    2,
    2025,
    'Snacks',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'ee267dd5-37a9-4c7b-a126-7290c45a8534',
    '00000000-0000-0000-0000-000000000001',
    353.0,
    'expense',
    'Uber',
    'upi',
    '2025-02-09',
    2,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '09841369-9e5f-427c-8b6b-158f3049cd80',
    '00000000-0000-0000-0000-000000000001',
    170.0,
    'expense',
    'Vegetables',
    'cash',
    '2025-02-10',
    2,
    2025,
    'Vegetables',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'e3697f40-5023-4be3-95f4-c6b1c7f896dc',
    '00000000-0000-0000-0000-000000000001',
    500.0,
    'expense',
    'Food',
    'upi',
    '2025-02-11',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c64006a1-0a3e-4c05-b4e2-696b51f762d6',
    '00000000-0000-0000-0000-000000000001',
    187.0,
    'expense',
    'Volini',
    'upi',
    '2025-02-12',
    2,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '136336e3-5c6d-4b3f-b90e-9b8461768d58',
    '00000000-0000-0000-0000-000000000001',
    240.0,
    'expense',
    'Food',
    'upi',
    '2025-02-13',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'fc2049fe-ebd2-4835-9866-e93216b512e3',
    '00000000-0000-0000-0000-000000000001',
    270.0,
    'expense',
    'Food',
    'upi',
    '2025-02-13',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b0d8ca22-b57e-4e22-a2e2-99bc3fa624bf',
    '00000000-0000-0000-0000-000000000001',
    225.0,
    'expense',
    'Sugar badam',
    'card',
    '2025-02-13',
    2,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'aa6c38a0-54bc-4887-b2f3-ee558dad6333',
    '00000000-0000-0000-0000-000000000001',
    103.0,
    'expense',
    'Food',
    'upi',
    '2025-02-13',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'df4d9030-67dc-4f32-8440-4b4922f273fd',
    '00000000-0000-0000-0000-000000000001',
    178.0,
    'expense',
    'Food',
    'upi',
    '2025-02-14',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a2266187-9c13-4687-a2a2-f82d9eb051a3',
    '00000000-0000-0000-0000-000000000001',
    210.0,
    'expense',
    'Food',
    'upi',
    '2025-02-15',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '823b1eb2-1111-44b1-be11-461371679b47',
    '00000000-0000-0000-0000-000000000001',
    2184.0,
    'expense',
    'Axis Neo CC',
    'upi',
    '2025-02-18',
    2,
    2025,
    'Axis Neo MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '6b767708-15f7-42a3-8ecb-3eb2c722be31',
    '00000000-0000-0000-0000-000000000001',
    902.0,
    'expense',
    'Yes Bank CC',
    'upi',
    '2025-02-18',
    2,
    2025,
    'Pop YES Bank MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f2afc28b-5d18-4134-a165-42005ae359b0',
    '00000000-0000-0000-0000-000000000001',
    2285.0,
    'expense',
    'BPCL CC',
    'upi',
    '2025-02-18',
    2,
    2025,
    'SBI BPCL MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '9e8f2aaf-fb7c-4c3c-8d52-fd6471f9b736',
    '00000000-0000-0000-0000-000000000001',
    299.0,
    'expense',
    'Indusind',
    'upi',
    '2025-02-18',
    2,
    2025,
    'Indusind Platinum Aura Edge MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '3e69ba41-77f7-44be-b014-0656404e407f',
    '00000000-0000-0000-0000-000000000001',
    371.0,
    'expense',
    'Simply Save',
    'upi',
    '2025-02-18',
    2,
    2025,
    'SBI Simply save MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '98520849-5ad0-4d55-83b2-4d4bc29552f8',
    '00000000-0000-0000-0000-000000000001',
    6846.0,
    'expense',
    'ICICI',
    'upi',
    '2025-02-18',
    2,
    2025,
    'ICICI Adani One MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'ca7442f6-7f19-410c-bcbf-11a70457b9ef',
    '00000000-0000-0000-0000-000000000001',
    32005.0,
    'expense',
    'SC',
    'upi',
    '2025-02-18',
    2,
    2025,
    'SC EaseMyTrip MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a4449b6b-bd9e-4ed7-a489-b4b821d5ef14',
    '00000000-0000-0000-0000-000000000001',
    251.0,
    'expense',
    'Food',
    'upi',
    '2025-02-19',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f51acf52-88e0-4457-8e53-0a229374b5a5',
    '00000000-0000-0000-0000-000000000001',
    1300.0,
    'expense',
    'Google one',
    'card',
    '2025-02-22',
    2,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '9d5659fe-3bf3-4baf-8c22-67b1be88ef2f',
    '00000000-0000-0000-0000-000000000001',
    161.0,
    'expense',
    'Food',
    'upi',
    '2025-02-21',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '25b4821f-806c-44a1-ba01-f3c7f78f35b5',
    '00000000-0000-0000-0000-000000000001',
    202.0,
    'expense',
    'Septlin',
    'upi',
    '2025-02-21',
    2,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '0a67bbe0-a48f-44b5-8b65-35a197007382',
    '00000000-0000-0000-0000-000000000001',
    135.0,
    'expense',
    'Food',
    'upi',
    '2025-02-21',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'e1d4d20d-d66f-4394-8aca-cdb2bf9d902e',
    '00000000-0000-0000-0000-000000000001',
    262.0,
    'expense',
    'Food',
    'upi',
    '2025-02-22',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'ac640584-16ce-429b-9048-4701a6ab0db7',
    '00000000-0000-0000-0000-000000000001',
    100.0,
    'expense',
    'Food',
    'upi',
    '2025-02-22',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '0b8f053f-0b2f-4ac4-9856-3b5238aa6038',
    '00000000-0000-0000-0000-000000000001',
    60.0,
    'expense',
    'Ride',
    'upi',
    '2025-02-22',
    2,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '7a7c2e0d-d7c6-47c4-8ebc-8e48c4befbcf',
    '00000000-0000-0000-0000-000000000001',
    70.0,
    'expense',
    'Ride',
    'upi',
    '2025-02-23',
    2,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'cf88552c-4eb1-4dbc-9bcb-c848f6f3ce3e',
    '00000000-0000-0000-0000-000000000001',
    500.0,
    'expense',
    'Pamist',
    'cash',
    '2025-02-23',
    2,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '6532fe68-41f8-4de1-b452-5ea62fa3432b',
    '00000000-0000-0000-0000-000000000001',
    135.0,
    'expense',
    'Food',
    'upi',
    '2025-02-23',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '33ab5b16-0afa-4200-a9c0-c5921428db28',
    '00000000-0000-0000-0000-000000000001',
    79.0,
    'expense',
    'Uber one',
    'upi',
    '2025-02-23',
    2,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '4c02ab2d-1770-4f19-93bd-30f8afe5adbd',
    '00000000-0000-0000-0000-000000000001',
    135.0,
    'expense',
    'Food',
    'upi',
    '2025-02-25',
    2,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'e1732317-1dbc-4c35-93ad-448d3f12c07e',
    '00000000-0000-0000-0000-000000000001',
    241.0,
    'expense',
    'Ride',
    'upi',
    '2025-02-24',
    2,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'bf464258-f2a0-4d49-b3e4-1f4c7d8d86a6',
    '00000000-0000-0000-0000-000000000001',
    269.0,
    'expense',
    'Ankle weight',
    'upi',
    '2025-02-25',
    2,
    2025,
    'Supliments + Vitamins',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '50d17ec3-dd8c-4c7c-8823-0a92fcde5234',
    '00000000-0000-0000-0000-000000000001',
    786.0,
    'expense',
    'Pooja',
    'card',
    '2025-02-26',
    2,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'd785a030-a681-4d23-bde1-819988334b3a',
    '00000000-0000-0000-0000-000000000001',
    300.0,
    'expense',
    'Pooja',
    'cash',
    '2025-02-26',
    2,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '04bfd2d0-481d-4afa-a89d-edc9f5fa5775',
    '00000000-0000-0000-0000-000000000001',
    1000.0,
    'expense',
    'Petrol',
    'card',
    '2025-02-28',
    2,
    2025,
    'Petrol',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f4c2aae2-29b8-42f5-a995-80d3e62998da',
    '00000000-0000-0000-0000-000000000001',
    100.0,
    'expense',
    'Visiting card',
    'upi',
    '2025-03-01',
    3,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'dfcf7fdc-d2e5-494e-9af0-5528e28a4c1e',
    '00000000-0000-0000-0000-000000000001',
    30000.0,
    'expense',
    'Edu loan',
    'upi',
    '2025-02-28',
    2,
    2025,
    'Education loan',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '54a1aaf6-1106-4c1c-a86b-e7b35f5ac3a8',
    '00000000-0000-0000-0000-000000000001',
    725.0,
    'expense',
    'Slipper',
    'upi',
    '2025-03-01',
    3,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '9bbb7f1d-f308-43be-8020-754df4c25a36',
    '00000000-0000-0000-0000-000000000001',
    9054.0,
    'expense',
    'CC bill pay',
    'upi',
    '2025-03-02',
    3,
    2025,
    'ICICI Amazon MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '13fcd554-5333-4f71-8d5f-99136f3b06f2',
    '00000000-0000-0000-0000-000000000001',
    1000.0,
    'expense',
    'Bright the soul',
    'upi',
    '2025-03-02',
    3,
    2025,
    'Donation',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c877cf2b-f6f2-4887-8536-e93580e7d065',
    '00000000-0000-0000-0000-000000000001',
    786.0,
    'expense',
    'HDFC Neu',
    'upi',
    '2025-03-03',
    3,
    2025,
    'HDFC Neu MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '14ca273e-8d0f-48ef-a060-d6db6a7f6000',
    '00000000-0000-0000-0000-000000000001',
    3003.0,
    'expense',
    'Axis neo',
    'upi',
    '2025-03-03',
    3,
    2025,
    'Axis Neo MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a2476ad3-3080-4b9c-aceb-82c71b91062f',
    '00000000-0000-0000-0000-000000000001',
    18942.0,
    'expense',
    'ICICI Amazon',
    'upi',
    '2025-03-03',
    3,
    2025,
    'ICICI Amazon MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'cf70946b-313e-490b-a85f-a1a896fac775',
    '00000000-0000-0000-0000-000000000001',
    296.0,
    'expense',
    'Coffee',
    'upi',
    '2025-03-03',
    3,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'afb2fb0c-3c3e-467a-87d9-c043d819dbdd',
    '00000000-0000-0000-0000-000000000001',
    60.0,
    'expense',
    'Food',
    'upi',
    '2025-03-04',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '39c7e13b-847c-4eef-890d-6984bfa13f6e',
    '00000000-0000-0000-0000-000000000001',
    400.0,
    'expense',
    'Ride',
    'upi',
    '2025-03-04',
    3,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '244001d8-822e-485c-aed5-66a336172cb1',
    '00000000-0000-0000-0000-000000000001',
    20.0,
    'expense',
    'Water',
    'card',
    '2025-03-04',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '452a6931-1dc9-4d54-ae9f-ee56998917fe',
    '00000000-0000-0000-0000-000000000001',
    20.0,
    'expense',
    'Travel',
    'upi',
    '2025-03-04',
    3,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8a467ced-ce43-44f2-843b-1703fdd36cd7',
    '00000000-0000-0000-0000-000000000001',
    312.0,
    'expense',
    'Sweets',
    'upi',
    '2025-03-04',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '277622ed-c847-4ea9-88da-16b6f11861bf',
    '00000000-0000-0000-0000-000000000001',
    135.0,
    'expense',
    'Food',
    'upi',
    '2025-03-05',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '648cc27e-168f-4760-aaf4-4eeb9c59db30',
    '00000000-0000-0000-0000-000000000001',
    65.0,
    'expense',
    'Food',
    'upi',
    '2025-03-06',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '7dbb3dc7-1ea2-497d-9d2a-45d01789fbb6',
    '00000000-0000-0000-0000-000000000001',
    60.0,
    'expense',
    'Printout',
    'card',
    '2025-03-06',
    3,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'e508dd44-7728-43a1-aa60-5523a303797d',
    '00000000-0000-0000-0000-000000000001',
    33.0,
    'expense',
    'Ride',
    'upi',
    '2025-03-06',
    3,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '66a9ec33-bf40-4aaf-8352-de8e2fe76895',
    '00000000-0000-0000-0000-000000000001',
    29.0,
    'expense',
    'Ride',
    'upi',
    '2025-03-06',
    3,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '3fc772f3-eb3d-4999-b02a-19f6be1ed698',
    '00000000-0000-0000-0000-000000000001',
    20.0,
    'expense',
    'Food',
    'upi',
    '2025-03-06',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '14ff2fe8-cc20-47a9-8cc8-ac3319fdce46',
    '00000000-0000-0000-0000-000000000001',
    27.0,
    'expense',
    'Ride',
    'upi',
    '2025-03-06',
    3,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '1b27a03a-efca-4d8a-bdcd-b6b07939235c',
    '00000000-0000-0000-0000-000000000001',
    105.0,
    'expense',
    'Food',
    'upi',
    '2025-03-07',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '03631a0f-e2ea-42fd-9f47-c5eea33b89ec',
    '00000000-0000-0000-0000-000000000001',
    20.0,
    'expense',
    'Water',
    'upi',
    '2025-03-07',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '88ad42cf-8697-40d6-b3e9-dbe0ed5aa9e7',
    '00000000-0000-0000-0000-000000000001',
    300.0,
    'expense',
    'Puncture',
    'upi',
    '2025-03-07',
    3,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '5a1dbb6d-8a99-471a-8fa8-b0037c120531',
    '00000000-0000-0000-0000-000000000001',
    212.0,
    'expense',
    'Ride baba',
    'upi',
    '2025-03-07',
    3,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c4a62f76-26bf-4b17-8f2a-290ea8ca2eda',
    '00000000-0000-0000-0000-000000000001',
    300.0,
    'expense',
    'Youtube',
    'card',
    '2025-03-07',
    3,
    2025,
    'Youtube',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c044bba6-c348-4f65-87f3-fed3aa24152e',
    '00000000-0000-0000-0000-000000000001',
    499.0,
    'expense',
    'Water kettle',
    'card',
    '2025-03-09',
    3,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '7c7af017-d41e-4c3d-b385-ab0f5528057b',
    '00000000-0000-0000-0000-000000000001',
    50000.0,
    'expense',
    'Travel',
    'upi',
    '2025-03-20',
    3,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'ed9d2ba2-6ed1-4dae-8c45-d4540fd809d6',
    '00000000-0000-0000-0000-000000000001',
    103.0,
    'expense',
    'Food',
    'upi',
    '2025-03-20',
    3,
    2025,
    'Snacks',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f78df7bc-3eca-4df9-8ac1-48df10f69592',
    '00000000-0000-0000-0000-000000000001',
    10000.0,
    'expense',
    'Photo frame',
    'upi',
    '2025-03-20',
    3,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '134d9135-e811-4e87-927b-6b60eaeefd04',
    '00000000-0000-0000-0000-000000000001',
    25.0,
    'expense',
    'Food',
    'upi',
    '2025-03-20',
    3,
    2025,
    'Snacks',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '5eb1cf4b-b03f-4a2f-8b07-c189cc95ff63',
    '00000000-0000-0000-0000-000000000001',
    230.0,
    'expense',
    'Food',
    'upi',
    '2025-03-20',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'cd782f97-db7b-49d7-835a-ad6124101644',
    '00000000-0000-0000-0000-000000000001',
    205.0,
    'expense',
    'Food',
    'upi',
    '2025-03-20',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a1df2e25-aba1-4cd5-bbf8-cfe4e30db171',
    '00000000-0000-0000-0000-000000000001',
    60.0,
    'expense',
    'Food',
    'cash',
    '2025-03-21',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '85e22a2b-dd56-4a46-9414-10fcc090c21b',
    '00000000-0000-0000-0000-000000000001',
    400.0,
    'expense',
    'Haircut',
    'upi',
    '2025-03-21',
    3,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c2123de5-3877-42e6-ab32-f7b0b973718c',
    '00000000-0000-0000-0000-000000000001',
    185.0,
    'expense',
    'Food',
    'upi',
    '2025-03-21',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '7efd853f-12a5-4a8a-a8cc-e4724248c56e',
    '00000000-0000-0000-0000-000000000001',
    266.0,
    'expense',
    'Food',
    'upi',
    '2025-03-22',
    3,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '059181e3-ba62-4316-94f4-ec449f6ee494',
    '00000000-0000-0000-0000-000000000001',
    226.0,
    'expense',
    'Food',
    'upi',
    '2025-03-23',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'd1953267-3efd-41b5-ba9c-6bb052ae4d1c',
    '00000000-0000-0000-0000-000000000001',
    382.0,
    'expense',
    'Food',
    'upi',
    '2025-03-25',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f670c6c4-fda9-45ba-b5c6-e80ffa60d3b0',
    '00000000-0000-0000-0000-000000000001',
    185.0,
    'expense',
    'Food',
    'upi',
    '2025-03-26',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '3d1a3f07-f836-454f-b09e-37a881429ed9',
    '00000000-0000-0000-0000-000000000001',
    300.0,
    'expense',
    'Phone recharge',
    'card',
    '2025-03-26',
    3,
    2025,
    'Jio',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '9d379dbb-472a-4d23-a68d-006954d58fbf',
    '00000000-0000-0000-0000-000000000001',
    229.0,
    'expense',
    'Food',
    'upi',
    '2025-03-27',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f1985165-3452-4284-8a26-6b3c9605879d',
    '00000000-0000-0000-0000-000000000001',
    166.0,
    'expense',
    'Food',
    'upi',
    '2025-03-28',
    3,
    2025,
    'Groceries',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b60d4f43-b6be-4a45-ade7-4c5cf1f60f1b',
    '00000000-0000-0000-0000-000000000001',
    215.0,
    'expense',
    'Food',
    'upi',
    '2025-03-29',
    3,
    2025,
    'Groceries',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '2f5cd4cd-8e39-49f2-a666-ab6fcb14f395',
    '00000000-0000-0000-0000-000000000001',
    159.0,
    'expense',
    'Food',
    'upi',
    '2025-03-29',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '42d83f32-d7a6-469f-ad0f-e3e5c56d2e86',
    '00000000-0000-0000-0000-000000000001',
    158.0,
    'expense',
    'Food',
    'upi',
    '2025-03-30',
    3,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '4f82f40f-6da7-42e7-96b0-b668a61507b3',
    '00000000-0000-0000-0000-000000000001',
    433.0,
    'expense',
    'Book',
    'card',
    '2025-04-01',
    4,
    2025,
    'Books',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '433edce0-e648-428d-b62f-707bd88fce55',
    '00000000-0000-0000-0000-000000000001',
    200.0,
    'expense',
    'Book',
    'card',
    '2025-04-02',
    4,
    2025,
    'Books',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c51192cc-09dd-4538-9a84-7c4f229931a7',
    '00000000-0000-0000-0000-000000000001',
    335.0,
    'expense',
    'Bill pay',
    'upi',
    '2025-04-02',
    4,
    2025,
    'HDFC Neu MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '88c2c07d-9ee5-4e50-bcc5-40bec69e83d8',
    '00000000-0000-0000-0000-000000000001',
    194.0,
    'expense',
    'Food',
    'upi',
    '2025-04-03',
    4,
    2025,
    'Snacks',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'dee0a1fa-ed67-4c1d-a6d0-ef40bce69ebc',
    '00000000-0000-0000-0000-000000000001',
    382.0,
    'expense',
    'Simpl bill',
    'upi',
    '2025-04-04',
    4,
    2025,
    'Simpl',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '478aad72-b5b4-41a8-861a-2ad3868b08ac',
    '00000000-0000-0000-0000-000000000001',
    241.0,
    'expense',
    'Bulb',
    'upi',
    '2025-04-05',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '0ad90955-fb23-4d51-a735-be1e96808905',
    '00000000-0000-0000-0000-000000000001',
    271.0,
    'expense',
    'Food',
    'card',
    '2025-04-06',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '0b5b4032-2319-4bac-b389-13314b27b5f8',
    '00000000-0000-0000-0000-000000000001',
    179.0,
    'expense',
    'Food',
    'card',
    '2025-04-07',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '82d00cd5-6c6a-4879-b732-ee8b9a350b3e',
    '00000000-0000-0000-0000-000000000001',
    230.0,
    'expense',
    'Food',
    'upi',
    '2025-04-07',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a4c1be28-6d2c-472c-813c-2ed0365ff739',
    '00000000-0000-0000-0000-000000000001',
    368.0,
    'expense',
    'Food',
    'upi',
    '2025-04-07',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '6a700307-25a1-4525-b408-3a6aafc746e6',
    '00000000-0000-0000-0000-000000000001',
    180.0,
    'expense',
    'Ride',
    'card',
    '2025-04-08',
    4,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8dd302fa-fba4-4e20-9a97-c667dc7410b9',
    '00000000-0000-0000-0000-000000000001',
    171.0,
    'expense',
    'Food',
    'upi',
    '2025-04-10',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '171816da-1a23-4682-a89f-2d6b526c8544',
    '00000000-0000-0000-0000-000000000001',
    1180.0,
    'expense',
    'Jio fiber',
    'upi',
    '2025-04-11',
    4,
    2025,
    'WiFi',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a47f6917-482a-4715-a641-639c00629d66',
    '00000000-0000-0000-0000-000000000001',
    9828.0,
    'expense',
    'ICICI Bill',
    'upi',
    '2025-04-11',
    4,
    2025,
    'ICICI Adani One MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8e33952d-ad06-46d3-a3a7-57febf2f15a6',
    '00000000-0000-0000-0000-000000000001',
    2100.0,
    'expense',
    'Dr Pooja Nupur',
    'upi',
    '2025-04-11',
    4,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c4cda055-f6be-4009-bfa9-0d4f385e52d6',
    '00000000-0000-0000-0000-000000000001',
    50.0,
    'expense',
    'Food',
    'upi',
    '2025-04-11',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'd4f32b1e-85ef-4e79-9a52-e5c67c2f9c1a',
    '00000000-0000-0000-0000-000000000001',
    190.0,
    'expense',
    'Food',
    'upi',
    '2025-04-13',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c0002fa8-008a-4481-899c-f33ca349222d',
    '00000000-0000-0000-0000-000000000001',
    115.0,
    'expense',
    'Food',
    'upi',
    '2025-04-14',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '09c2b6c7-364a-4925-b1d8-a87183656a00',
    '00000000-0000-0000-0000-000000000001',
    3988.0,
    'expense',
    'Bill Indusind',
    'upi',
    '2025-04-14',
    4,
    2025,
    'Indusind Platinum Aura Edge MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '0ee5a0f8-3bda-4fd0-9d05-9081a78b064c',
    '00000000-0000-0000-0000-000000000001',
    146.0,
    'expense',
    'Food',
    'upi',
    '2025-04-15',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '6816fe0a-3235-44e9-991b-2d4e62d6a083',
    '00000000-0000-0000-0000-000000000001',
    240.0,
    'expense',
    'Food',
    'upi',
    '2025-04-20',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '988a750c-da60-4518-8b2f-c1cf66cfa45f',
    '00000000-0000-0000-0000-000000000001',
    189.0,
    'expense',
    'Food',
    'upi',
    '2025-04-20',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '1b630075-2cbd-4beb-9092-279e79ab46ff',
    '00000000-0000-0000-0000-000000000001',
    125.0,
    'expense',
    'Redbull',
    'cash',
    '2025-04-20',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '053d2503-7b5e-4ec4-ba3b-e8fdf4f2de4a',
    '00000000-0000-0000-0000-000000000001',
    40.0,
    'expense',
    'Food',
    'upi',
    '2025-04-21',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8a66ed3d-f35b-4549-a020-0077f67f8fc0',
    '00000000-0000-0000-0000-000000000001',
    500.0,
    'expense',
    'Petrol',
    'cash',
    '2025-04-22',
    4,
    2025,
    'Petrol',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '35d44fd2-cca7-40d1-8a64-0003d4529127',
    '00000000-0000-0000-0000-000000000001',
    40.0,
    'expense',
    'Ice cream',
    'cash',
    '2025-04-22',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '1ea0cec7-b306-478c-b0cc-4439fc682443',
    '00000000-0000-0000-0000-000000000001',
    200.0,
    'expense',
    'Food',
    'upi',
    '2025-04-24',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '27b9a156-6424-4811-8c05-dd6b5f512749',
    '00000000-0000-0000-0000-000000000001',
    321.0,
    'expense',
    'Snacks',
    'upi',
    '2025-04-24',
    4,
    2025,
    'Groceries',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '3854ca87-e2ae-46c9-a82e-4da879e1a5f0',
    '00000000-0000-0000-0000-000000000001',
    109.0,
    'expense',
    'Ride',
    'upi',
    '2025-04-24',
    4,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '290c71bf-cde5-4b7e-a132-3db026088177',
    '00000000-0000-0000-0000-000000000001',
    80.0,
    'expense',
    'Ride',
    'upi',
    '2025-04-24',
    4,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'ff6b6c60-3190-40fb-a1b5-cd7dd3be47c7',
    '00000000-0000-0000-0000-000000000001',
    117.0,
    'expense',
    'Food',
    'upi',
    '2025-04-26',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f5d03171-a769-4b5c-874a-77e219703570',
    '00000000-0000-0000-0000-000000000001',
    1000.0,
    'expense',
    'Amazon pay recharge',
    'upi',
    '2025-04-26',
    4,
    2025,
    'Amazon Pay Recharge',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8f42be84-9373-4c81-af6b-0e62e7fafd47',
    '00000000-0000-0000-0000-000000000001',
    470.0,
    'expense',
    'Medicine',
    'upi',
    '2025-04-26',
    4,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c8ac4110-a75b-476a-b6c8-129571ddd06b',
    '00000000-0000-0000-0000-000000000001',
    230.0,
    'expense',
    'Ice cream',
    'upi',
    '2025-04-26',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b3f6eae5-696b-464a-9095-e9b59cc3e848',
    '00000000-0000-0000-0000-000000000001',
    32.0,
    'expense',
    'Ride',
    'upi',
    '2025-04-26',
    4,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b24693be-838c-4250-8956-edc3a79b41ef',
    '00000000-0000-0000-0000-000000000001',
    90.0,
    'expense',
    'Ride',
    'upi',
    '2025-04-26',
    4,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '7f772668-2d8b-40e0-aeb2-f30d1279d092',
    '00000000-0000-0000-0000-000000000001',
    116.0,
    'expense',
    'Food',
    'upi',
    '2025-04-28',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'fb1e1ed2-40c7-4046-af18-cab782344cd7',
    '00000000-0000-0000-0000-000000000001',
    206.0,
    'expense',
    'Food',
    'upi',
    '2025-04-28',
    4,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '34ce0569-12cd-48d7-a8d7-fd80a0db4aca',
    '00000000-0000-0000-0000-000000000001',
    90.0,
    'expense',
    'Food',
    'upi',
    '2025-04-29',
    4,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'ca947c3d-02a4-4493-89d0-a5479fd2aeff',
    '00000000-0000-0000-0000-000000000001',
    155.0,
    'expense',
    'Food',
    'card',
    '2025-05-01',
    5,
    2025,
    'Swiggy',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b8978e79-2046-4e19-abd6-5db9973ff67c',
    '00000000-0000-0000-0000-000000000001',
    200.0,
    'expense',
    'Recharge airtel',
    'upi',
    '2025-05-03',
    5,
    2025,
    'Airtel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '22e10e39-b515-47fd-b0d9-393c438d9f7c',
    '00000000-0000-0000-0000-000000000001',
    60.0,
    'expense',
    'Satuu',
    'upi',
    '2025-05-05',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '3b2b85ba-643d-4032-bbd4-169a9814fe45',
    '00000000-0000-0000-0000-000000000001',
    249.0,
    'expense',
    'Bsnl sim',
    'upi',
    '2025-05-05',
    5,
    2025,
    'Airtel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'cdf3daea-676e-4ef1-b41c-1c3ed3a682ef',
    '00000000-0000-0000-0000-000000000001',
    135.0,
    'expense',
    'Vegetables',
    'cash',
    '2025-05-05',
    5,
    2025,
    'Vegetables',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '65d8c15d-d7a7-4d58-88ca-5d8669a05685',
    '00000000-0000-0000-0000-000000000001',
    167.0,
    'expense',
    'Rice',
    'upi',
    '2025-05-05',
    5,
    2025,
    'Groceries',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '52d04155-5c7a-4a62-bd68-ca7f163f2302',
    '00000000-0000-0000-0000-000000000001',
    5679.0,
    'expense',
    'CC card payment',
    'upi',
    '2025-05-05',
    5,
    2025,
    'ICICI Amazon EMI',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '414d04e0-4210-4406-977f-dd5622c52c5a',
    '00000000-0000-0000-0000-000000000001',
    1847.0,
    'expense',
    'Credit card',
    'upi',
    '2025-05-05',
    5,
    2025,
    'Axis Rewards EMI',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '48ce1d37-d5c5-4ce0-8162-6f3e866d823c',
    '00000000-0000-0000-0000-000000000001',
    157.0,
    'expense',
    'Ride',
    'upi',
    '2025-05-05',
    5,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '078e90d1-85e4-4e9c-bb6c-50ca88dbbe81',
    '00000000-0000-0000-0000-000000000001',
    150.0,
    'expense',
    'Ride',
    'upi',
    '2025-05-06',
    5,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f9bd575e-bd92-4fd4-8916-d6aefa47d462',
    '00000000-0000-0000-0000-000000000001',
    190.0,
    'expense',
    'Book',
    'upi',
    '2025-05-06',
    5,
    2025,
    'Books',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b456aa2f-4333-4aba-b147-d2234ccfead1',
    '00000000-0000-0000-0000-000000000001',
    2000.0,
    'expense',
    'Photo',
    'upi',
    '2025-05-07',
    5,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '98eed584-2d81-4cf6-8a10-b64a3c21f318',
    '00000000-0000-0000-0000-000000000001',
    50.0,
    'expense',
    'CC bill',
    'upi',
    '2025-05-07',
    5,
    2025,
    'HDFC Neu MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '7d772ced-fad2-4f1f-bf12-f5053e55592d',
    '00000000-0000-0000-0000-000000000001',
    75.0,
    'expense',
    'Shoe',
    'cash',
    '2025-05-07',
    5,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'd6d2f3e1-b526-4430-993e-22f0451415a4',
    '00000000-0000-0000-0000-000000000001',
    750.0,
    'expense',
    'Wifi router',
    'card',
    '2025-05-07',
    5,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '9306ca59-d108-4794-991a-7b14d69cd2d0',
    '00000000-0000-0000-0000-000000000001',
    1000.0,
    'expense',
    'Pertol',
    'card',
    '2025-05-08',
    5,
    2025,
    'Petrol',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '6098d318-e373-4b0d-acb3-6be3d422d4ac',
    '00000000-0000-0000-0000-000000000001',
    110.0,
    'expense',
    'Food',
    'upi',
    '2025-05-08',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b70396c9-2243-4502-9e32-62922748b585',
    '00000000-0000-0000-0000-000000000001',
    500.0,
    'expense',
    'Dr Nupur',
    'upi',
    '2025-05-09',
    5,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f6c39ba4-76b3-41b0-8154-520df4788df3',
    '00000000-0000-0000-0000-000000000001',
    15.0,
    'expense',
    'Icecream',
    'upi',
    '2025-05-09',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '6c2b95db-922a-45f5-8e55-4788ed2f3224',
    '00000000-0000-0000-0000-000000000001',
    2032.0,
    'expense',
    'Medicine',
    'upi',
    '2025-05-09',
    5,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c3d739c7-acc3-465b-bbe2-19420c4b35ea',
    '00000000-0000-0000-0000-000000000001',
    30.0,
    'expense',
    'Sattu',
    'upi',
    '2025-05-10',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '74d9d3a7-a903-427a-ba2a-5c382250daac',
    '00000000-0000-0000-0000-000000000001',
    525.0,
    'expense',
    'Csuite email',
    'card',
    '2025-05-11',
    5,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '5429e0e3-2ec2-46bb-a4b9-dc14cf7d9003',
    '00000000-0000-0000-0000-000000000001',
    535.0,
    'expense',
    'CSuite Domain',
    'upi',
    '2025-05-11',
    5,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '278234a8-011c-42f3-9b5e-2f7118761621',
    '00000000-0000-0000-0000-000000000001',
    824.0,
    'expense',
    'Wifi Recharge',
    'card',
    '2025-05-12',
    5,
    2025,
    'WiFi',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '495d0d1c-fece-417d-9718-fccf747eb6dd',
    '00000000-0000-0000-0000-000000000001',
    75.0,
    'expense',
    'Food',
    'upi',
    '2025-05-14',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '4e4fc388-134f-4011-9c81-59390e604397',
    '00000000-0000-0000-0000-000000000001',
    70.0,
    'expense',
    'Food',
    'upi',
    '2025-05-17',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '05928d81-a338-4f68-a383-6644b86767b9',
    '00000000-0000-0000-0000-000000000001',
    220.0,
    'expense',
    'Food',
    'upi',
    '2025-05-18',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a39785d7-9a1b-4c95-b553-174d024b5b38',
    '00000000-0000-0000-0000-000000000001',
    80.0,
    'expense',
    'Travel',
    'upi',
    '2025-05-18',
    5,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '9817738a-db0c-4f7f-a654-b5d5a351c655',
    '00000000-0000-0000-0000-000000000001',
    70.0,
    'expense',
    'Food',
    'upi',
    '2025-05-19',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '2770fe62-403d-437b-848f-5433dcdbd40b',
    '00000000-0000-0000-0000-000000000001',
    220.0,
    'expense',
    'Food',
    'upi',
    '2025-05-20',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '68371a3f-3594-4fd5-a31b-db6dfd0b3b44',
    '00000000-0000-0000-0000-000000000001',
    269.0,
    'expense',
    'Ride',
    'upi',
    '2025-05-19',
    5,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '6c01298e-4b6f-434e-b950-5408ffbd8c61',
    '00000000-0000-0000-0000-000000000001',
    50.0,
    'expense',
    'Travel',
    'upi',
    '2025-05-20',
    5,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '1c7ffa39-c3a4-4648-a29d-571427c41945',
    '00000000-0000-0000-0000-000000000001',
    1367.0,
    'expense',
    'Mayank email',
    'upi',
    '2025-05-20',
    5,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a56feae0-8455-4d4a-9628-204fb20e8256',
    '00000000-0000-0000-0000-000000000001',
    168.0,
    'expense',
    'Food',
    'upi',
    '2025-05-21',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'caec866c-7c3e-43ab-a44c-dfbe80c17244',
    '00000000-0000-0000-0000-000000000001',
    300.0,
    'expense',
    'Haircut',
    'upi',
    '2025-05-21',
    5,
    2025,
    'Haircut',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '28063689-95d1-466f-82b3-ea4c3828846c',
    '00000000-0000-0000-0000-000000000001',
    117.0,
    'expense',
    'Food',
    'upi',
    '2025-05-22',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'd234318a-3146-4c27-b674-8d7bd6ff051e',
    '00000000-0000-0000-0000-000000000001',
    175.0,
    'expense',
    'Food',
    'card',
    '2025-05-22',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a5e2a2bd-d31f-4497-9a01-ae918f49064e',
    '00000000-0000-0000-0000-000000000001',
    241.0,
    'expense',
    'Food',
    'upi',
    '2025-05-26',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '72194e00-93de-4788-88f8-80fb84aada3f',
    '00000000-0000-0000-0000-000000000001',
    200.0,
    'expense',
    'Ride',
    'cash',
    '2025-05-26',
    5,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b363e848-9204-4e76-969b-945076cbdb27',
    '00000000-0000-0000-0000-000000000001',
    165.0,
    'expense',
    'Food',
    'upi',
    '2025-05-27',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '0b31d4ea-c4d1-420d-8335-bf1fadb3b0e0',
    '00000000-0000-0000-0000-000000000001',
    494.0,
    'expense',
    'Alarm clock',
    'card',
    '2025-05-28',
    5,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a916e511-c3af-43fb-8a00-8d371036583f',
    '00000000-0000-0000-0000-000000000001',
    90.0,
    'expense',
    'Food',
    'upi',
    '2025-05-28',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8cac10e7-388d-476c-974b-63a0c10979cb',
    '00000000-0000-0000-0000-000000000001',
    80.0,
    'expense',
    'Food',
    'upi',
    '2025-05-29',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8c753d9b-80e4-4b30-b947-2e5235491e47',
    '00000000-0000-0000-0000-000000000001',
    155.0,
    'expense',
    'Food',
    'upi',
    '2025-05-30',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '3768ed7f-edaf-4deb-90cb-658c235fe081',
    '00000000-0000-0000-0000-000000000001',
    171.0,
    'expense',
    'Food',
    'upi',
    '2025-05-31',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8c6997c2-7117-492a-986d-825c5aa7ba06',
    '00000000-0000-0000-0000-000000000001',
    201.0,
    'expense',
    'Food',
    'upi',
    '2025-05-31',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'af2351c6-c4b1-4ca7-b407-d1b532007c13',
    '00000000-0000-0000-0000-000000000001',
    167.0,
    'expense',
    'Food',
    'card',
    '2025-05-31',
    5,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '9b547c12-edda-47f6-a2b6-d21fc1a94a5e',
    '00000000-0000-0000-0000-000000000001',
    185.0,
    'expense',
    'Food',
    'card',
    '2025-06-01',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '80c0ef23-3d02-4bdf-bb1d-0ad743a69165',
    '00000000-0000-0000-0000-000000000001',
    176.0,
    'expense',
    'Food',
    'card',
    '2025-06-01',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c36a9f95-adf3-4bbe-ae76-66e81f7e439f',
    '00000000-0000-0000-0000-000000000001',
    90.0,
    'expense',
    'Food',
    'upi',
    '2025-06-01',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '2baf165e-69d1-434b-882c-7dbfb7dfd736',
    '00000000-0000-0000-0000-000000000001',
    167.0,
    'expense',
    'Food',
    'card',
    '2025-06-02',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '23a644f6-f686-463f-a630-0bb5960be00a',
    '00000000-0000-0000-0000-000000000001',
    196.0,
    'expense',
    'Food',
    'card',
    '2025-06-02',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '647105cb-b28b-425c-a09d-a946211a2d21',
    '00000000-0000-0000-0000-000000000001',
    500.0,
    'expense',
    'Doctor Nupur',
    'upi',
    '2025-06-02',
    6,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '97963e61-42a1-487b-98f0-591f03940d4b',
    '00000000-0000-0000-0000-000000000001',
    1554.0,
    'expense',
    'Medicine',
    'card',
    '2025-06-02',
    6,
    2025,
    'Medicine',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'e60a62cc-a647-4ba3-ad18-caddc03c69a3',
    '00000000-0000-0000-0000-000000000001',
    50.0,
    'expense',
    'Food',
    'upi',
    '2025-06-02',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '828cd648-128a-4ec7-90c5-8b8f77e78c0e',
    '00000000-0000-0000-0000-000000000001',
    70.0,
    'expense',
    'Food',
    'card',
    '2025-06-02',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'e919b8b5-a94f-4f5a-9ea3-1bc1aa2002d2',
    '00000000-0000-0000-0000-000000000001',
    165.0,
    'expense',
    'Food',
    'card',
    '2025-06-06',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '36d95db6-1cc2-4431-89d8-fe8132a3f89e',
    '00000000-0000-0000-0000-000000000001',
    101.0,
    'expense',
    'Food',
    'card',
    '2025-06-09',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '994dca4e-2d1e-46c9-8bab-10032865471c',
    '00000000-0000-0000-0000-000000000001',
    120.0,
    'expense',
    'Ride',
    'upi',
    '2025-06-09',
    6,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '4ae0871a-136a-47be-bc91-9d64ab88ea1e',
    '00000000-0000-0000-0000-000000000001',
    1200.0,
    'expense',
    'Electrician',
    'upi',
    '2025-06-10',
    6,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c0eb4b7e-9a35-4bf9-b9aa-9e5e93eab264',
    '00000000-0000-0000-0000-000000000001',
    1180.0,
    'expense',
    'Wifi',
    'upi',
    '2025-06-10',
    6,
    2025,
    'WiFi',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'eb0bac4e-4139-4be3-adfe-568d7651963a',
    '00000000-0000-0000-0000-000000000001',
    101.0,
    'expense',
    'Food',
    'upi',
    '2025-06-12',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'f40ada1e-7c78-4cc1-8666-55c9a80c87b6',
    '00000000-0000-0000-0000-000000000001',
    155.0,
    'expense',
    'Food',
    'upi',
    '2025-06-13',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '466a2c3c-430e-4132-8510-685bc7f31063',
    '00000000-0000-0000-0000-000000000001',
    214.0,
    'expense',
    'Food',
    'upi',
    '2025-06-14',
    6,
    2025,
    NULL,
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '1036a8e3-d613-41df-a24c-133240ece843',
    '00000000-0000-0000-0000-000000000001',
    1000.0,
    'expense',
    'Credit card bill',
    'upi',
    '2025-06-16',
    6,
    2025,
    'HDFC Neu MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'b8363544-00e2-4009-a4e3-e268c1a8b7dc',
    '00000000-0000-0000-0000-000000000001',
    2265.0,
    'expense',
    'BPCL pay',
    'upi',
    '2025-06-16',
    6,
    2025,
    'SBI BPCL MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '1e98254e-079e-455c-af0e-3db731960923',
    '00000000-0000-0000-0000-000000000001',
    375.0,
    'expense',
    'Indusind bill pay',
    'upi',
    '2025-06-16',
    6,
    2025,
    'Indusind Platinum Aura Edge MP',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'a93cb8b1-c9fb-4831-81d1-f9302de9bba4',
    '00000000-0000-0000-0000-000000000001',
    100.0,
    'expense',
    'Ride',
    'upi',
    '2025-06-23',
    6,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'c3421abc-ab97-4cb3-922c-4312c005083c',
    '00000000-0000-0000-0000-000000000001',
    100.0,
    'expense',
    'Ride',
    'card',
    '2025-06-23',
    6,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '2fd273ff-739a-4ad6-9934-79a91f89ba12',
    '00000000-0000-0000-0000-000000000001',
    120.0,
    'expense',
    'Food',
    'upi',
    '2025-06-23',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'ca58e246-3e0c-4fa7-a1b7-8cb10f26577f',
    '00000000-0000-0000-0000-000000000001',
    200.0,
    'expense',
    'Food',
    'card',
    '2025-06-23',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '96ce9138-6515-4895-b44c-b8e84eab374f',
    '00000000-0000-0000-0000-000000000001',
    116.0,
    'expense',
    'Food',
    'card',
    '2025-06-24',
    6,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    'aace2818-60d9-4b52-be7a-ccaa5f247cd6',
    '00000000-0000-0000-0000-000000000001',
    200.0,
    'expense',
    'Bsnl',
    'upi',
    '2025-06-26',
    6,
    2025,
    'Airtel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '1282cb49-21e3-4741-a38e-a5bbc67dc4d9',
    '00000000-0000-0000-0000-000000000001',
    110.0,
    'expense',
    'Travel',
    'upi',
    '2025-06-27',
    6,
    2025,
    'Travel',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '6692f3c0-4ada-4592-a45e-a98d0794618b',
    '00000000-0000-0000-0000-000000000001',
    138.0,
    'expense',
    'Food',
    'card',
    '2025-07-01',
    7,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '8f7f121e-3798-42da-ab4b-97a9a6e0488d',
    '00000000-0000-0000-0000-000000000001',
    2100.0,
    'expense',
    'One drive',
    'card',
    '2025-07-01',
    7,
    2025,
    'Google One',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '58553867-76c9-42d1-8908-d7a35594bcfb',
    '00000000-0000-0000-0000-000000000001',
    211.0,
    'expense',
    'Food',
    'card',
    '2025-07-04',
    7,
    2025,
    'Eating out',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '88ca43c8-ae3f-4700-9b64-57a8c2ec1801',
    '00000000-0000-0000-0000-000000000001',
    700.0,
    'expense',
    'Grok premium',
    'card',
    '2025-07-06',
    7,
    2025,
    'Grok',
    false,
    NOW(),
    NOW()
);
INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '19543683-97e6-4f7d-a0ef-7bf3de70362f',
    '00000000-0000-0000-0000-000000000001',
    300.0,
    'expense',
    'Youtube',
    'card',
    '2025-07-06',
    7,
    2025,
    'Youtube',
    false,
    NOW(),
    NOW()
);

-- MIGRATION COMPLETE
-- Successfully processed 213 expense transactions
-- All real financial data from daily discipline tracking
-- Ready for Supabase execution
