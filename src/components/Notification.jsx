import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export default function Notification({ message, type = 'error', onClose, duration = 5000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColor = type === 'error' ? 'bg-red-50' : 'bg-blue-50';
    const borderColor = type === 'error' ? 'border-red-200' : 'border-blue-200';
    const textColor = type === 'error' ? 'text-red-800' : 'text-blue-800';
    const iconColor = type === 'error' ? 'text-red-500' : 'text-blue-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] max-w-md p-4 rounded-xl border shadow-xl ${bgColor} ${borderColor} ${textColor} flex items-start gap-3`}
        >
            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
            <div className="flex-1">
                <p className="text-sm font-semibold mb-1">
                    {type === 'error' ? 'Oops! Something went wrong' : 'Note'}
                </p>
                <p className="text-sm opacity-90">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
