import React, { useState } from 'react';
import { Trophy, RefreshCw, BarChart2, CheckCircle, Sparkles, Wand2, Zap, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import Mascot from './Mascot';

export default function ResultsStep({ fileMetadata, onReset }) {
    const results = fileMetadata?.results || {};
    const { accuracy, classification_report, confusion_matrix, model_type, features } = results;

    const [predictionInputs, setPredictionInputs] = useState({});
    const [predictionResult, setPredictionResult] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [error, setError] = useState(null);

    const handleInputChange = (feature, value) => {
        setValidationError(null);
        setError(null);
        setPredictionInputs(prev => ({
            ...prev,
            [feature]: value
        }));
    };

    const handlePredict = async () => {
        // Validation: Check if all features have values and are valid
        const missingFeatures = features.filter(f => !predictionInputs[f] || predictionInputs[f].trim() === '');
        if (missingFeatures.length > 0) {
            setValidationError('Please fill in all the magic boxes first!');
            return;
        }

        // Validate values against metadata (ranges, binary)
        if (results.feature_metadata) {
            for (const feature of features) {
                const val = parseFloat(predictionInputs[feature]);
                const meta = results.feature_metadata[feature];
                if (!meta) continue;

                if (meta.is_binary) {
                    if (val !== 0 && val !== 1) {
                        setValidationError(`${feature} must be 0 or 1!`);
                        return;
                    }
                }
            }
        }

        setIsPredicting(true);
        setPredictionResult(null);
        setError(null);
        try {
            const res = await api.post('/predict', {
                file_id: fileMetadata.file_id,
                inputs: predictionInputs
            });
            setPredictionResult(res.data.prediction);
        } catch (error) {
            console.error("Prediction failed", error);
            setError(error.response?.data?.detail || "Prediction failed. Make sure all inputs are numbers!");
        } finally {
            setIsPredicting(false);
        }
    };

    const clearInputs = () => {
        setPredictionInputs({});
        setPredictionResult(null);
        setValidationError(null);
    };


    return (
        <>
            <Mascot
                mood={error ? "sad" : (validationError ? "thinking" : (predictionResult !== null ? "celebrating" : (isPredicting ? "thinking" : "happy")))}
                message={error ? error : (validationError
                    ? validationError
                    : (predictionResult !== null
                        ? `I predict the result is: ${predictionResult}! ✨`
                        : (isPredicting ? "Let me think... calculations in progress!" : "Wow! Look what I learned! Want to try a magic prediction?")))}
            />
            <div className="max-w-4xl mx-auto space-y-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">

                        <h2 className="text-3xl font-bold mb-2">Training Complete</h2>
                        <p className="text-green-100 opacity-90">Model successfully trained and evaluated.</p>
                    </div>

                    <div className="p-8">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="group relative bg-green-50 p-6 rounded-xl border border-green-100 text-center hover:shadow-md transition-shadow cursor-help">
                                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider border-b-2 border-dotted border-green-300">My Score (Accuracy)</span>
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-48 bg-green-600 text-white text-xs font-bold rounded-xl p-3 text-center pointer-events-none transition-all duration-300 shadow-xl z-10 translate-y-2 group-hover:translate-y-0">
                                    🎯 How often I get the answer exactly right!
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-green-600"></div>
                                </div>
                                <div className="text-4xl font-bold text-green-600 mt-2">
                                    {accuracy ? (accuracy * 100).toFixed(2) : '0.00'}%
                                </div>
                            </div>

                            <div className="group relative bg-blue-50 p-6 rounded-xl border border-blue-100 text-center hover:shadow-md transition-shadow cursor-help">
                                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider border-b-2 border-dotted border-blue-300">Trust Factor (Precision)</span>
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-48 bg-blue-600 text-white text-xs font-bold rounded-xl p-3 text-center pointer-events-none transition-all duration-300 shadow-xl z-10 translate-y-2 group-hover:translate-y-0">
                                    🤔 When I say "YES", can you really trust me?
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-blue-600"></div>
                                </div>
                                <div className="text-4xl font-bold text-blue-600 mt-2">
                                    {/* Provide a safe fallback access */}
                                    {classification_report?.['weighted avg']?.precision
                                        ? (classification_report['weighted avg'].precision * 100).toFixed(2)
                                        : '0.00'}%
                                </div>
                            </div>

                            <div className="group relative bg-purple-50 p-6 rounded-xl border border-purple-100 text-center hover:shadow-md transition-shadow cursor-help">
                                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider border-b-2 border-dotted border-purple-300">Detective Skill (Recall)</span>
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-48 bg-purple-600 text-white text-xs font-bold rounded-xl p-3 text-center pointer-events-none transition-all duration-300 shadow-xl z-10 translate-y-2 group-hover:translate-y-0">
                                    🔍 Did I manage to find ALL the hidden answers?
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-purple-600"></div>
                                </div>
                                <div className="text-4xl font-bold text-purple-600 mt-2">
                                    {classification_report?.['weighted avg']?.recall
                                        ? (classification_report['weighted avg'].recall * 100).toFixed(2)
                                        : '0.00'}%
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Confusion Matrix */}
                            {/* Class Performance Visualization */}
                            <div className="border border-gray-200 rounded-xl p-6">
                                <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
                                    How well I know each group
                                </h3>
                                <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-lg">
                                    This shows how good I am at guessing specific answers. For example, if I'm guessing "Cats" vs "Dogs", this tells you if I'm better at spotting Cats!
                                </p>
                                <div className="space-y-6">
                                    {(classification_report ? Object.keys(classification_report) : [])
                                        .filter(key => !['accuracy', 'macro avg', 'weighted avg'].includes(key))
                                        .map((classLabel) => {
                                            const metrics = classification_report[classLabel];
                                            const precision = metrics.precision * 100;
                                            const recall = metrics.recall * 100;

                                            return (
                                                <div key={classLabel} className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-gray-700 capitalize">Class: {classLabel}</span>
                                                    </div>

                                                    {/* Precision Bar */}
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-blue-600 font-medium">Precision (Correctness)</span>
                                                            <span className="text-gray-500">{precision.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                                                style={{ width: `${precision}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Recall Bar */}
                                                    <div>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-purple-600 font-medium">Recall (Coverage)</span>
                                                            <span className="text-gray-500">{recall.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                                                style={{ width: `${recall}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                <p className="text-xs text-gray-400 mt-4 text-center">Charts show how well the model predicts each specific category.</p>
                            </div>

                            {/* Magic Prediction Section */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-100 shadow-inner">
                                <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 text-xl">
                                    Let's Make a Prediction!
                                </h3>
                                <p className="text-sm text-indigo-600 mb-6">Type in the details below, and I'll predict the answer!</p>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                    {features && features.map((feature) => {
                                        const meta = results.feature_metadata?.[feature];
                                        const isBinary = meta?.is_binary;
                                        const min = meta?.min;
                                        const max = meta?.max;

                                        return (
                                            <div key={feature} className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{feature}</label>
                                                    {meta && isBinary && (
                                                        <span className="text-[10px] text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                            0 or 1
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="number"
                                                    value={predictionInputs[feature] || ''}
                                                    step={isBinary ? "1" : "any"}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        // Explicit validation for strict compliance if needed
                                                        if (isBinary && val !== '' && val !== '0' && val !== '1') {
                                                            return; // Prevent invalid input for binary
                                                        }
                                                        handleInputChange(feature, val);
                                                    }}
                                                    placeholder={`Enter ${feature}...`}
                                                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-sm"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-3">
                                    {validationError && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-500 text-sm font-bold text-center mb-2"
                                        >
                                            ⚠️ {validationError}
                                        </motion.p>
                                    )}
                                    <button
                                        onClick={handlePredict}
                                        disabled={isPredicting || !features}
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isPredicting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1'
                                            }`}
                                    >
                                        {isPredicting ? 'Thinking...' : <><Wand2 size={20} /> Predict Now!</>}
                                    </button>

                                    <AnimatePresence>
                                        {predictionResult !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-white p-4 rounded-xl border-2 border-green-400 text-center shadow-md relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 left-0 w-full h-1 bg-green-400" />
                                                <span className="text-xs font-bold text-green-600 uppercase">My Prediction</span>
                                                <div className="text-3xl font-black text-gray-800 mt-1">
                                                    {predictionResult}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        onClick={clearInputs}
                                        className="w-full py-2 text-indigo-400 text-sm font-medium hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Trash2 size={14} /> Clear Inputs
                                    </button>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="flex flex-col gap-3 justify-center">
                                {error && !validationError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 border border-red-200 rounded-lg p-3 text-center"
                                    >
                                        <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
                                    </motion.div>
                                )}

                                <button
                                    onClick={onReset}
                                    className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                                >
                                    Build Another Pipeline
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
