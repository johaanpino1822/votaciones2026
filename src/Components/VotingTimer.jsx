import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function VotingTimer({ initialHours = 24, initialMinutes = 0 }) {
  const [timeRemaining, setTimeRemaining] = useState(
    initialHours * 3600 + initialMinutes * 60
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const isCritical = hours === 0 && minutes < 5;
  const isWarning = hours === 0 && minutes < 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${
        isCritical 
          ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200' 
          : isWarning 
          ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200'
          : 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${
          isCritical ? 'bg-red-100' : isWarning ? 'bg-orange-100' : 'bg-green-100'
        }`}>
          <svg className={`w-6 h-6 ${
            isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-green-600'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div>
          <div className="font-mono font-bold text-2xl tracking-tight">
            {String(hours).padStart(2, '0')}:
            {String(minutes).padStart(2, '0')}:
            {String(seconds).padStart(2, '0')}
          </div>
          <div className={`text-sm font-medium mt-1 ${
            isCritical ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-green-700'
          }`}>
            {timeRemaining === 0 
              ? '⏰ Votación finalizada'
              : isCritical 
              ? '⏳ ¡Se acaba el tiempo!' 
              : isWarning 
              ? '⚠️ Menos de 30 minutos'
              : '🗳️ Votación en curso'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}