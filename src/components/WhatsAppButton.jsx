import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '+971522405566';
  const agentName = 'Muhammad';

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Hi ${agentName}, I'd like to get in touch!`);
    window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="relative">
          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
            aria-label="WhatsApp Chat"
          >
            {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </button>
        </div>
      </motion.div>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-green-500 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-500 font-bold text-lg">
                  {agentName[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{agentName}</h3>
                  <p className="text-xs text-green-100">Typically replies instantly</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-slate-50">
              <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
                <p className="text-sm text-slate-700">
                  👋 Hi there! I'm {agentName}. How can I help you today?
                </p>
              </div>
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-5 h-5" />
                Start Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}