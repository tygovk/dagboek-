import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Delete } from 'lucide-react';

interface PinLockModalProps {
  correctPin: string;
  onUnlock: () => void;
  userName: string;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  correctPin,
  onUnlock,
  userName,
}) => {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        setHasError(false);
        onUnlock();
      } else {
        setHasError(true);
        setTimeout(() => {
          setPin('');
          setHasError(false);
        }, 700);
      }
    }
  }, [pin, correctPin, onUnlock]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  return (
    <div
      id="pin-lock-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8F9FE] p-4"
    >
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(99,102,241,0.12)] border border-slate-100 flex flex-col items-center text-center">
        {/* Lock Icon Badge */}
        <div className="w-16 h-16 bg-[#EEF2FF] text-[#6366F1] rounded-3xl flex items-center justify-center mb-4 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Dagboek Vergrendeld
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1 mb-6">
          Welkom terug, {userName}. Voer je 4-cijferige pincode in.
        </p>

        {/* PIN Dots display */}
        <div
          className={`flex items-center gap-4 mb-8 transition-transform ${
            hasError ? 'animate-shake' : ''
          }`}
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all ${
                  hasError
                    ? 'bg-rose-500 scale-110'
                    : isFilled
                    ? 'bg-[#6366F1] scale-110'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {hasError && (
          <p className="text-xs font-bold text-rose-500 -mt-4 mb-4 animate-in fade-in">
            Onjuiste pincode. Probeer opnieuw.
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="w-16 h-16 rounded-2xl bg-slate-50 hover:bg-[#EEF2FF] hover:text-[#6366F1] text-slate-800 font-black text-xl flex items-center justify-center transition-all mx-auto active:scale-95 shadow-sm cursor-pointer"
            >
              {num}
            </button>
          ))}
          <div className="w-16 h-16" />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-2xl bg-slate-50 hover:bg-[#EEF2FF] hover:text-[#6366F1] text-slate-800 font-black text-xl flex items-center justify-center transition-all mx-auto active:scale-95 shadow-sm cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            title="Wissen"
            className="w-16 h-16 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 font-bold text-xl flex items-center justify-center transition-all mx-auto active:scale-95 shadow-sm cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Standaard pincode bij eerste gebruik: <strong>1234</strong>
        </p>
      </div>
    </div>
  );
};
