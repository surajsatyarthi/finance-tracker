# Testing logic for account transfers to avoid balance errors

def test_account_transfers
  # Sample Test
  sender = Account.create(name: 'Sender', balance: 1000)
  receiver = Account.create(name: 'Receiver', balance: 500)

  transfer_amount = 300
  Transaction.create(account_id: sender.id, amount: -transfer_amount) # Debit sender
  Transaction.create(account_id: receiver.id, amount: transfer_amount)  # Credit receiver

  raise 'Transfer balance error' unless sender.reload.balance == 700 && receiver.reload.balance == 800
end