import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface PincodeVerificationData {
  pincode: string;
  city: string;
  state: string;
  locality: string;
  localities: string[];
  isVerified: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

interface PincodeFieldProps {
  pincode: string;
  city: string;
  stateName: string;
  locality: string;
  onPincodeChange: (pincode: string) => void;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  onLocalityChange: (locality: string) => void;
  onVerificationStatusChange?: (isVerified: boolean) => void;
  showRequiredError?: boolean;
}

export const PincodeField: React.FC<PincodeFieldProps> = ({
  pincode,
  city,
  stateName,
  locality,
  onPincodeChange,
  onCityChange,
  onStateChange,
  onLocalityChange,
  onVerificationStatusChange,
  showRequiredError = false,
}) => {
  const [localities, setLocalities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touchedBlur, setTouchedBlur] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedPincodeRef = useRef<string>('');

  // Auto-fetch Postal Pincode API with 400ms debounce
  useEffect(() => {
    // Reset status if pincode changes
    if (pincode !== lastFetchedPincodeRef.current) {
      setIsVerified(false);
      if (onVerificationStatusChange) onVerificationStatusChange(false);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (pincode.length < 6) {
      setIsLoading(false);
      setLocalities([]);
      setErrorMessage(null);
      return;
    }

    if (pincode.length === 6) {
      setIsLoading(true);
      setErrorMessage(null);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await res.json();

          if (Array.isArray(data) && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice)) {
            const postOffices = data[0].PostOffice;
            const officeNames: string[] = postOffices.map((po: any) => po.Name).filter(Boolean);

            const derivedCity = postOffices[0]?.District || postOffices[0]?.Division || '';
            const derivedState = postOffices[0]?.State || '';

            setLocalities(officeNames);
            onCityChange(derivedCity);
            onStateChange(derivedState);

            // Auto select locality if 1 option or if current locality is in list
            if (officeNames.length === 1) {
              onLocalityChange(officeNames[0]);
            } else if (locality && officeNames.includes(locality)) {
              onLocalityChange(locality);
            } else {
              onLocalityChange(officeNames[0] || '');
            }

            setIsVerified(true);
            lastFetchedPincodeRef.current = pincode;
            if (onVerificationStatusChange) onVerificationStatusChange(true);
            setErrorMessage(null);
          } else {
            setIsVerified(false);
            setLocalities([]);
            onCityChange('');
            onStateChange('');
            onLocalityChange('');
            if (onVerificationStatusChange) onVerificationStatusChange(false);
            setErrorMessage("We couldn't find this pincode. Please check and try again.");
          }
        } catch (error) {
          console.error('Error fetching postal pincode data:', error);
          setIsVerified(false);
          setLocalities([]);
          if (onVerificationStatusChange) onVerificationStatusChange(false);
          setErrorMessage('Unable to verify pincode due to a network issue. Please re-try.');
        } finally {
          setIsLoading(false);
        }
      }, 400);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [pincode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits, max 6
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
    onPincodeChange(cleanDigits);
  };

  const handleBlur = () => {
    setTouchedBlur(true);
  };

  return (
    <div className="space-y-4 text-xs font-sans text-left">
      {/* 1. PINCODE INPUT WITH INLINE SPINNER & VERIFIED STATUS */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-bold text-stone-800 flex items-center gap-1">
            <span>Pincode</span>
            <span className="text-red-500 font-bold">*</span>
          </label>
          
          {/* Status Labels */}
          {isLoading && (
            <span className="flex items-center gap-1 text-[11px] text-[#C0654B] font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C0654B]" />
              <span>Verifying Area...</span>
            </span>
          )}

          {!isLoading && isVerified && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified</span>
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={pincode}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="e.g. 700091"
            className={`w-full border rounded-xl p-3 text-xs tracking-wider font-mono font-bold transition-all focus:outline-none ${
              errorMessage || (showRequiredError && !pincode) || (touchedBlur && pincode.length > 0 && pincode.length < 6)
                ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-600'
                : isVerified
                ? 'border-emerald-500 bg-emerald-50/10 focus:border-emerald-600 text-stone-900'
                : 'border-stone-300 bg-white focus:border-[#C0654B] text-stone-900'
            }`}
          />
          <MapPin className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
        </div>

        {/* Error Messages */}
        {showRequiredError && !pincode && (
          <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Pincode is required.</span>
          </p>
        )}

        {touchedBlur && pincode.length > 0 && pincode.length < 6 && (
          <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Enter a valid 6-digit pincode.</span>
          </p>
        )}

        {errorMessage && (
          <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>

      {/* 2. AREA / LOCALITY DROPDOWN (ANIMATED WITH FRAMER MOTION) */}
      <AnimatePresence>
        {isVerified && localities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
          >
            <label className="block font-bold text-stone-800">
              Area / Locality <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              value={locality}
              onChange={(e) => onLocalityChange(e.target.value)}
              disabled={isLoading}
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#C0654B] transition-colors"
            >
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CITY & STATE FIELDS (DERIVED & READ-ONLY ONCE VERIFIED) */}
      <AnimatePresence>
        {(city || stateName || isVerified) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                City / District {isVerified && <span className="text-[10px] text-emerald-600 font-mono">(Auto)</span>}
              </label>
              <input
                type="text"
                readOnly={isVerified}
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="City"
                className={`w-full border rounded-xl p-3 text-xs font-semibold ${
                  isVerified
                    ? 'bg-stone-100 text-stone-700 border-stone-200 cursor-not-allowed select-none'
                    : 'bg-white text-stone-900 border-stone-300 focus:border-[#C0654B]'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                State {isVerified && <span className="text-[10px] text-emerald-600 font-mono">(Auto)</span>}
              </label>
              <input
                type="text"
                readOnly={isVerified}
                value={stateName}
                onChange={(e) => onStateChange(e.target.value)}
                placeholder="State"
                className={`w-full border rounded-xl p-3 text-xs font-semibold ${
                  isVerified
                    ? 'bg-stone-100 text-stone-700 border-stone-200 cursor-not-allowed select-none'
                    : 'bg-white text-stone-900 border-stone-300 focus:border-[#C0654B]'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
