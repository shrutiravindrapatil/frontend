import React, { useState } from 'react';
import { Cpu, Network, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import Mascot from './Mascot';

export default function ModelStep({ fileMetadata, onComplete }) {
    const [selectedModel, setSelectedModel] = useState(fileMetadata?.model_type || null);
    const [isTraining, setIsTraining] = useState(false);
    const [error, setError] = useState(null);

    const handleTrain = async () => {
        if (!selectedModel) return;

        // Validation: Logistic Regression strictly needs numbers
        if (selectedModel === 'logistic') {
            const nonNumericFeatures = fileMetadata.selected_columns.filter(col => !fileMetadata.numeric_columns.includes(col));
            if (nonNumericFeatures.length > 0) {
                setError(`Oops! Logistic Regression can't understand words in: ${nonNumericFeatures.join(', ')}. Please choose Decision Tree or go back and encode them to numbers!`);
                return;
            }
        }

        setIsTraining(true);
        setError(null);
        try {
            const res = await api.post('/train', {
                file_id: fileMetadata.file_id,
                model_type: selectedModel,
                target_column: fileMetadata.target_column,
                test_size: fileMetadata.test_size,
                selected_columns: fileMetadata.selected_columns // Pass selected features
            });
            onComplete({
                ...fileMetadata,
                results: res.data,
                model_type: selectedModel
            });
        } catch (error) {
            console.error("Training failed", error);
            setError(error.response?.data?.detail || "Training failed. Is the data correct?");
        } finally {
            setIsTraining(false);
        }
    };

    const models = [
        {
            id: 'logistic',
            name: 'Logistic Regression',
            desc: 'Like drawing a line to separate two groups. Great for Yes/No questions!',
            typeDesc: 'Only for Numerical Data!',
            typeColor: 'text-pink-500',
            icon: <Network className="w-10 h-10 text-cyan-500" />,
            color: 'border-cyan-500 bg-cyan-50'
        },
        {
            id: 'decision_tree',
            name: 'Decision Tree',
            desc: 'Like playing 20 Questions to find the answer. Good for complex patterns!',
            typeDesc: 'Good for Numbers & Word Data!',
            typeColor: 'text-violet-600',
            icon: <Cpu className="w-10 h-10 text-emerald-500" />,
            color: 'border-emerald-500 bg-emerald-50'
        }
    ];

    return (
        <>
            <Mascot
                mood={isTraining ? 'thinking' : (error ? 'sad' : (selectedModel ? 'happy' : 'idle'))}
                message={isTraining ? "Learning now..." : (error ? error : (selectedModel ? "Click the button to start training!" : "Choose how I should learn!"))}
            />
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Select a Model</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {models.map((model) => (
                        <motion.div
                            key={model.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedModel(model.id)}
                            className={`cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 ${selectedModel === model.id
                                ? `${model.color} shadow-xl`
                                : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                {model.icon}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedModel === model.id ? 'border-blue-500' : 'border-gray-300'
                                    }`}>
                                    {selectedModel === model.id && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{model.name}</h3>
                            <p className="text-gray-500 mb-2">{model.desc}</p>
                            <p className={`text-sm font-bold ${model.typeColor}`}>{model.typeDesc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <button
                        onClick={handleTrain}
                        disabled={!selectedModel || isTraining}
                        className={`px-12 py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 mx-auto ${!selectedModel || isTraining
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/40 transform hover:-translate-y-1'
                            }`}
                    >
                        {isTraining ? 'Training Model...' : (
                            <>
                                Start Training <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
