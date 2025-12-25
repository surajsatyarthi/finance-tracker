// Card network logo component
export function CardNetworkLogo({ cardNumber }: { cardNumber: string }) {
    // Detect card network by first digit(s)
    const firstDigit = cardNumber[0];
    const firstTwo = cardNumber.slice(0, 2);

    let network = 'Generic';
    let bgColor = 'bg-gray-500';

    if (firstDigit === '4') {
        network = 'VISA';
        bgColor = 'bg-blue-600';
    } else if (['51', '52', '53', '54', '55'].includes(firstTwo)) {
        network = 'MC'; // Mastercard
        bgColor = 'bg-red-600';
    } else if (firstDigit === '6' && cardNumber.startsWith('60') || cardNumber.startsWith('65') || cardNumber.startsWith('81') || cardNumber.startsWith('82')) {
        network = 'RuPay';
        bgColor = 'bg-green-600';
    } else if (firstTwo === '35') {
        network = 'JCB';
        bgColor = 'bg-indigo-600';
    } else if (['34', '37'].includes(firstTwo)) {
        network = 'AMEX';
        bgColor = 'bg-cyan-600';
    }

    return (
        <div className={`w-12 h-8 ${bgColor} rounded-md flex items-center justify-center relative overflow-hidden shadow-sm`}>
            {/* Gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            {/* Network name */}
            <span className="relative z-10 text-white text-[10px] font-bold">{network}</span>
        </div>
    );
}
