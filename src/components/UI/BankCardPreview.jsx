import React from 'react';

const BankCardPreview = ({ cardNumber, cardHolder, expiryDate, cvc }) => {
  return (
    <div className="w-full max-w-sm mx-auto h-48 rounded-2xl p-6 text-white shadow-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-800 relative flex flex-col justify-between overflow-hidden transition-all duration-300 transform hover:scale-[1.02]">
      {/* Background Subtle Shapes */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-lg pointer-events-none" />

      {/* Top Header: Chip & Card Type */}
      <div className="flex justify-between items-center z-10">
        <div className="w-12 h-9 bg-amber-400/80 rounded-md flex items-center justify-center shadow-inner">
          <div className="w-8 h-6 border border-amber-600/60 rounded-[3px] grid grid-cols-2 gap-0.5 p-0.5">
            <div className="bg-amber-600/30 rounded-[1px]" />
            <div className="bg-amber-600/30 rounded-[1px]" />
          </div>
        </div>
        <span className="text-sm font-bold tracking-widest uppercase italic opacity-80">
          VISA / Mastercard
        </span>
      </div>

      {/* Card Number */}
      <div className="z-10 my-2">
        <p className="text-xs text-blue-200/70 uppercase tracking-wider mb-1">Card Number</p>
        <p className="font-mono text-xl tracking-[0.2em] font-medium text-shadow">
          {cardNumber || '•••• •••• •••• ••••'}
        </p>
      </div>

      {/* Bottom Footer: Holder & Expiry */}
      <div className="flex justify-between items-end z-10">
        <div>
          <p className="text-[10px] text-blue-200/70 uppercase tracking-wider">Card Holder</p>
          <p className="font-medium tracking-wide truncate max-w-[180px] text-sm">
            {cardHolder ? cardHolder.toUpperCase() : 'YOUR NAME'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-blue-200/70 uppercase tracking-wider">Expires</p>
          <p className="font-mono font-medium text-sm">{expiryDate || 'MM/YY'}</p>
        </div>
      </div>
    </div>
  );
};

export default BankCardPreview;
