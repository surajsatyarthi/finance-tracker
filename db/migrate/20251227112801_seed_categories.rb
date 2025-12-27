# Migration file for seeding income and expense categories

# Seed default income categories (e.g., Salary, Business)
# Seed default expense categories (e.g., Rent, Utilities)

def seed_categories
  income_categories = %w(Salary Business Investment)
  expense_categories = %w(Rent Utilities Groceries)

  income_categories.each { |name| Category.find_or_create_by(name: name, category_type: :income) }
  expense_categories.each { |name| Category.find_or_create_by(name: name, category_type: :expense) }
end