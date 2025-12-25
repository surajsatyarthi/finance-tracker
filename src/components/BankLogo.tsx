// Bank logo mapping - returns logo emoji/icon for each bank
export const getBankLogo = (bankName: string): string => {
    const name = bankName.toLowerCase();

    // Bank name to logo/color mapping
    const bankStyles: Record<string, { bg: string; text: string; initials: string }> = {
        'sbi': { bg: 'bg-blue-600', text: 'text-white', initials: 'SBI' },
        'icici': { bg: 'bg-orange-500', text: 'text-white', initials: 'IC' },
        'hdfc': { bg: 'bg-red-600', text: 'text-white', initials: 'HD' },
        'kotak': { bg: 'bg-red-700', text: 'text-white', initials: 'K' },
        'axis': { bg: 'bg-purple-600', text: 'text-white', initials: 'AX' },
        'yes': { bg: 'bg-blue-500', text: 'text-white', initials: 'YES' },
        'jupiter': { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', text: 'text-white', initials: 'J' },
        'slice': { bg: 'bg-gradient-to-br from-orange-400 to-yellow-400', text: 'text-white', initials: 'SL' },
        'dcb': { bg: 'bg-indigo-600', text: 'text-white', initials: 'DCB' },
        'cbi': { bg: 'bg-blue-700', text: 'text-white', initials: 'CBI' },
        'sbm': { bg: 'bg-teal-600', text: 'text-white', initials: 'SBM' },
        'tide': { bg: 'bg-slate-800', text: 'text-white', initials: 'TD' },
        'post office': { bg: 'bg-red-600', text: 'text-white', initials: 'PO' },
        'indusind': { bg: 'bg-green-600', text: 'text-white', initials: 'IN' },
        'rbl': { bg: 'bg-orange-600', text: 'text-white', initials: 'RBL' },
        'sc ': { bg: 'bg-cyan-600', text: 'text-white', initials: 'SC' },
        'standard chartered': { bg: 'bg-cyan-600', text: 'text-white', initials: 'SC' },
        'cash': { bg: 'bg-green-600', text: 'text-white', initials: '₹' },
    };

    // Find matching bank
    const match = Object.keys(bankStyles).find(key => name.includes(key));
    if (match) {
        return JSON.stringify(bankStyles[match]);
    }

    // Default fallback
    return JSON.stringify({ bg: 'bg-gray-500', text: 'text-white', initials: name.slice(0, 2).toUpperCase() });
};

// React component for bank logo
type BankLogoProps = {
    bankName: string;
    size?: 'sm' | 'md' | 'lg';
};

export function BankLogo({ bankName, size = 'md' }: BankLogoProps) {
    const logoData = JSON.parse(getBankLogo(bankName));

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };

    return (
        <div className={`${sizeClasses[size]} ${logoData.bg} ${logoData.text} rounded-full flex items-center justify-center font-bold shadow-md relative overflow-hidden`}>
            {/* Gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
            {/* Initials */}
            <span className="relative z-10">{logoData.initials}</span>
        </div>
    );
}
