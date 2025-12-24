import React from 'react';
import { motion } from 'framer-motion';

export default function Mascot({ mood = 'idle', message, position = 'top-right' }) {
    // Mascot expressions based on mood
    const expressions = {
        idle: '😊',
        happy: '😊',
        thinking: '😊',
        excited: '😊',
        celebrating: '😊',
        sad: '😢'
    };

    // Animation variants
    const bounceAnimation = {
        idle: {
            y: [0, -10, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        happy: {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
            transition: {
                duration: 0.6,
                repeat: 2
            }
        },
        thinking: {
            rotate: [-5, 5, -5],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        excited: {
            y: [0, -20, 0],
            scale: [1, 1.3, 1],
            transition: {
                duration: 0.5,
                repeat: Infinity
            }
        },
        celebrating: {
            rotate: [0, 360],
            scale: [1, 1.5, 1],
            transition: {
                duration: 1,
                repeat: 3
            }
        },
        sad: {
            y: [0, 5, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // Position styles
    const positionStyles = {
        'top-right': 'fixed top-4 right-4 z-50',
        'top-left': 'fixed top-4 left-4 z-50',
        'bottom-right': 'fixed bottom-4 right-4 z-50',
        'inline': 'relative'
    };

    return (
        <div className={positionStyles[position]}>
            <motion.div
                className="flex flex-col items-end gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Speech Bubble */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg px-4 py-3 max-w-xs relative"
                        style={{
                            border: '3px solid #FFD700',
                        }}
                    >
                        <p className="text-sm font-medium text-gray-800 leading-relaxed">
                            {message}
                        </p>
                        {/* Speech bubble tail */}
                        <div
                            className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45"
                            style={{ borderRight: '3px solid #FFD700', borderBottom: '3px solid #FFD700' }}
                        />
                    </motion.div>
                )}

                {/* Mascot Character */}
                <motion.div
                    variants={bounceAnimation}
                    animate={mood}
                    className="text-6xl cursor-pointer select-none"
                    style={{
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                    }}
                >
                    {expressions[mood] || expressions.idle}
                </motion.div>
            </motion.div>
        </div>
    );
}
