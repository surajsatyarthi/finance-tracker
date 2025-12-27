# Add constraints for credit card limits (positive only) and valid dates

class AddCreditCardConstraints < ActiveRecord::Migration[6.0]
  def change
    change_table :credit_cards do |t|
      t.check_constraint 'credit_limit > 0', name: 'positive_credit_limit_check'
      t.check_constraint 'valid_from <= valid_till', name: 'valid_date_range_check'
    end
  end
end