import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    { id: 1, name: 'Upload Data' },
    { id: 2, name: 'Preprocessing' },
    { id: 3, name: 'Train/Test Split' },
    { id: 4, name: 'Model Selection' },
    { id: 5, name: 'Results' },
];

export default function Stepper({ currentStep, maxStep, onStepClick }) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-center space-x-4">
                {steps.map((step, index) => {
                    // A step is completed if we have moved past it (maxStep > step.id)
                    // But we also want to show future completed steps if we go back.
                    // So any step < maxStep is technically "completed" in the past.
                    const isCompleted = step.id < maxStep;
                    const isCurrent = currentStep === step.id;
                    const isClickable = step.id <= maxStep;

                    return (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`relative flex flex-col items-center group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                onClick={() => isClickable && onStepClick(step.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : isCurrent
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-300'
                                            : 'bg-white border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircle size={20} /> : <span>{step.id}</span>}
                                </div>
                                <span
                                    className={`absolute top-12 text-xs font-semibold whitespace-nowrap ${isCurrent ? 'text-blue-600' : 'text-gray-500'
                                        }`}
                                >
                                    {step.name}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-12 h-1 mx-2 ${maxStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
