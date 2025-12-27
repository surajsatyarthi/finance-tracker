# Add validations to disallow negative transaction amounts
# Ensure fields account_id and amount are mandatory in transactions

class AddTransactionValidations < ActiveRecord::Migration[6.0]
  def change
    change_table :transactions do |t|
      t.check_constraint 'amount > 0', name: 'positive_amount_check'
      t.check_constraint 'account_id IS NOT NULL AND amount IS NOT NULL', name: 'mandatory_fields_check'
    end
  end
end