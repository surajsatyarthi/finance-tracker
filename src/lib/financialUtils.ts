
import { Loan } from '@/types/finance'

// Temporary types until proper definitions exist
type LoanRecord = any
type LoanPayment = any

// Types for Calculations
export interface AmortizationEntry {
    month: number
    emiAmount: number
    principalComponent: number
    interestComponent: number
    outstandingBalance: number
    isPaid: boolean
    paymentDate?: string
}

export interface PrepaymentAnalysis {
    originalTenure: number
    newTenure: number
    tenureReduction: number
    originalTotalInterest: number
    newTotalInterest: number
    interestSaved: number
    newMonthlyEmi: number
    newCompletionDate: string
}

export const calculateEMI = (principal: number, annualRate: number, tenureMonths: number) => {
    const monthlyRate = annualRate / (12 * 100)
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    const totalAmount = emi * tenureMonths

    return {
        monthlyAmount: Math.round(emi * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
    }
}

export const generateAmortizationSchedule = (loan: Loan | LoanRecord, payments: LoanPayment[]): AmortizationEntry[] => {
    // Default to 0 if undefined
    const interestRate = loan.interest_rate ?? 0
    const monthlyRate = interestRate / 12 / 100
    const schedule: AmortizationEntry[] = []
    let outstandingBalance = loan.principal_amount

    // Fallback for soft loans: if no tenure/emi, assume single bullet payment or manual tracking
    const tenure = loan.total_emis ?? 0
    const monthlyAmount = loan.emi_amount ?? 0
    const startDate = new Date(loan.start_date)

    if (tenure === 0 || monthlyAmount === 0) {
        // Return empty schedule for soft loans
        return []
    }

    for (let month = 1; month <= tenure; month++) {
        const interestComponent = outstandingBalance * monthlyRate
        const principalComponent = monthlyAmount - interestComponent
        outstandingBalance = Math.max(0, outstandingBalance - principalComponent)

        const isPaid = month <= loan.emis_paid
        const payment = payments.find(p => {
            const paymentMonth = new Date(p.payment_date || p.paymentDate).getMonth() + 1
            const loanStartMonth = startDate.getMonth() + 1
            return paymentMonth - loanStartMonth + 1 === month
        })

        schedule.push({
            month,
            emiAmount: monthlyAmount,
            principalComponent,
            interestComponent,
            outstandingBalance,
            isPaid,
            paymentDate: payment?.payment_date || payment?.paymentDate
        })
    }

    return schedule
}

export const getLoanOutstandingBalance = (loan: Loan, payments: LoanPayment[]): number => {
    const schedule = generateAmortizationSchedule(loan, payments)
    if (schedule.length === 0) return 0

    // Find the last paid EMI and return its outstanding balance
    const lastPaidEntry = schedule.find(entry => entry.month === loan.emis_paid)
    return lastPaidEntry ? lastPaidEntry.outstandingBalance : loan.principal_amount
}

export const getLoanTotalInterestPaid = (loan: Loan, payments: LoanPayment[]): number => {
    const schedule = generateAmortizationSchedule(loan, payments)
    return schedule
        .filter(entry => entry.isPaid)
        .reduce((sum, entry) => sum + entry.interestComponent, 0)
}

export const getLoanTotalPrincipalPaid = (loan: Loan, payments: LoanPayment[]): number => {
    const schedule = generateAmortizationSchedule(loan, payments)
    return schedule
        .filter(entry => entry.isPaid)
        .reduce((sum, entry) => sum + entry.principalComponent, 0)
}

export const calculatePrepaymentImpact = (
    loan: Loan,
    payments: LoanPayment[],
    prepaymentAmount: number
): PrepaymentAnalysis | null => {
    const currentOutstanding = getLoanOutstandingBalance(loan, payments)
    const newPrincipal = Math.max(0, currentOutstanding - prepaymentAmount)
    const monthlyRate = (loan.interest_rate || 0) / 12 / 100
    const remainingMonths = (loan.total_emis || 0) - loan.emis_paid
    const emiAmount = loan.emi_amount || 0

    // Calculate new tenure with same EMI
    let newTenure = 0
    if (newPrincipal > 0 && emiAmount > 0) {
        newTenure = Math.ceil(
            Math.log(emiAmount / (emiAmount - newPrincipal * monthlyRate)) /
            Math.log(1 + monthlyRate)
        )
    }

    // Calculate interest saved
    const originalTotalInterest = (emiAmount * remainingMonths) - currentOutstanding
    const newTotalInterest = (emiAmount * newTenure) - newPrincipal
    const interestSaved = originalTotalInterest - newTotalInterest

    // Calculate new completion date
    const startDate = new Date(loan.start_date)
    const newCompletionDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + loan.emis_paid + newTenure,
        startDate.getDate()
    )

    return {
        originalTenure: remainingMonths,
        newTenure,
        tenureReduction: remainingMonths - newTenure,
        originalTotalInterest,
        newTotalInterest,
        interestSaved,
        newMonthlyEmi: emiAmount,
        newCompletionDate: newCompletionDate.toISOString().split('T')[0]
    }
}

export const calculateCreditCardDueDate = (
    transactionDate: string,
    statementDay: number,
    dueDay: number
): string => {
    const txDate = new Date(transactionDate)
    const txDay = txDate.getDate()
    const txMonth = txDate.getMonth()
    const txYear = txDate.getFullYear()

    // Determine the Statement Date for this transaction
    // If transaction day is AFTER statement day, it belongs to NEXT month's statement
    // If transaction day is ON or BEFORE statement day, it belongs to THIS month's statement
    let statementDate: Date
    if (txDay > statementDay) {
        // Next month's statement
        statementDate = new Date(txYear, txMonth + 1, statementDay)
    } else {
        // This month's statement
        statementDate = new Date(txYear, txMonth, statementDay)
    }

    // Determine Due Date relative to the Statement Date
    // Usually due date is 20-25 days after statement date.
    // We rely on the `dueDay` (e.g., 5th).
    // If Due Day (5) is less than Statement Day (15), it must be the FOLLOWING month
    // If Due Day (25) is greater than Statement Day (15), it might be SAME month (unusual but possible)

    let dueDate: Date
    if (dueDay < statementDay) {
        // Due next month relative to statement
        dueDate = new Date(statementDate.getFullYear(), statementDate.getMonth() + 1, dueDay)
    } else {
        // Due same month as statement (rare, short grace period)
        dueDate = new Date(statementDate.getFullYear(), statementDate.getMonth(), dueDay)
    }

    return dueDate.toISOString().split('T')[0]
}
