-- ===============================================
-- SEED CATEGORIES - EXPENSE ONLY
-- ===============================================
-- This migration populates the empty categories table
-- Based on budget categories in budgetData.ts

DO $$
DECLARE
    target_user_id UUID;
    
    -- Parent category IDs
    food_id UUID;
    transport_id UUID;
    data_id UUID;
    self_growth_id UUID;
    health_id UUID;
    grooming_id UUID;
    clothing_id UUID;
    insurance_id UUID;
    subscriptions_id UUID;
    cc_charges_id UUID;
    shopping_id UUID;
    donations_id UUID;
    misc_id UUID;
    loan_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'surajstoic@gmail.com';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found!';
    END IF;

    -- Delete existing categories for this user
    DELETE FROM categories WHERE user_id = target_user_id;

    -- ============ PARENT CATEGORIES ============
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Food', 'expense', NULL, '#FF6B6B')
    RETURNING id INTO food_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Transport', 'expense', NULL, '#4ECDC4')
    RETURNING id INTO transport_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Data & WiFi', 'expense', NULL, '#95E1D3')
    RETURNING id INTO data_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Self Growth', 'expense', NULL, '#F38181')
    RETURNING id INTO self_growth_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Health', 'expense', NULL, '#AA96DA')
    RETURNING id INTO health_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Grooming', 'expense', NULL, '#FCBAD3')
    RETURNING id INTO grooming_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Clothing', 'expense', NULL, '#FFFFD2')
    RETURNING id INTO clothing_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Insurance', 'expense', NULL, '#A8D8EA')
    RETURNING id INTO insurance_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Subscriptions', 'expense', NULL, '#AA96DA')
    RETURNING id INTO subscriptions_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Credit Card Charges', 'expense', NULL, '#FF6B6B')
    RETURNING id INTO cc_charges_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Shopping', 'expense', NULL, '#4ECDC4')
    RETURNING id INTO shopping_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Donations', 'expense', NULL, '#95E1D3')
    RETURNING id INTO donations_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Miscellaneous', 'expense', NULL, '#F38181')
    RETURNING id INTO misc_id;
    
    INSERT INTO categories (user_id, name, type, parent_category_id, color)
    VALUES (target_user_id, 'Loan', 'expense', NULL, '#FFB6B9')
    RETURNING id INTO loan_id;

    -- ============ SUBCATEGORIES ============
    
    -- Food subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Eating out', 'expense', food_id),
    (target_user_id, 'Swiggy', 'expense', food_id),
    (target_user_id, 'Groceries', 'expense', food_id),
    (target_user_id, 'Dry fruits', 'expense', food_id),
    (target_user_id, 'Vegetables', 'expense', food_id),
    (target_user_id, 'Fruits', 'expense', food_id),
    (target_user_id, 'Snacks', 'expense', food_id);
    
    -- Transport subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Travel', 'expense', transport_id),
    (target_user_id, 'Petrol', 'expense', transport_id),
    (target_user_id, 'Bike Insurance', 'expense', transport_id),
    (target_user_id, 'Bike Pollution Certificate', 'expense', transport_id),
    (target_user_id, 'Car Insurance', 'expense', transport_id),
    (target_user_id, 'Car Pollution Certificate', 'expense', transport_id);
    
    -- Data & WiFi subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Jio', 'expense', data_id),
    (target_user_id, 'Airtel', 'expense', data_id),
    (target_user_id, 'WiFi', 'expense', data_id);
    
    -- Self Growth subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Books', 'expense', self_growth_id);
    
    -- Health subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Fitness Bootcamp', 'expense', health_id),
    (target_user_id, 'Chef', 'expense', health_id),
    (target_user_id, 'Yoga Instructor', 'expense', health_id),
    (target_user_id, 'Supplements', 'expense', health_id),
    (target_user_id, 'Medicine', 'expense', health_id);
    
    -- Grooming subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Haircut', 'expense', grooming_id),
    (target_user_id, 'Toiletries', 'expense', grooming_id);
    
    -- Subscriptions subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Youtube', 'expense', subscriptions_id),
    (target_user_id, 'Google One', 'expense', subscriptions_id),
    (target_user_id, 'Grok', 'expense', subscriptions_id),
    (target_user_id, 'LinkedIn Premium', 'expense', subscriptions_id);
    
    -- Credit Card Charges subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Credit Card Monthly', 'expense', cc_charges_id),
    (target_user_id, 'Credit Card EMI', 'expense', cc_charges_id);
    
    -- Loan subcategories
    INSERT INTO categories (user_id, name, type, parent_category_id) VALUES
    (target_user_id, 'Education Loan', 'expense', loan_id);

    RAISE NOTICE '✅ Seeded 14 parent categories + 40 subcategories';
END $$;

-- Verify
SELECT 
    CASE WHEN parent_category_id IS NULL THEN '📁 PARENT' ELSE '  ↳ Sub' END as type,
    name 
FROM categories 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com')
ORDER BY 
    COALESCE(parent_category_id, id),
    parent_category_id NULLS FIRST,
    name;
