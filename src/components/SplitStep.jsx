import React, { useState } from 'react';
import { Split, ArrowRight, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import Mascot from './Mascot';

export default function SplitStep({ fileMetadata, onComplete }) {
    // Initialize from metadata if available
    const [splitRatio, setSplitRatio] = useState(
        fileMetadata?.test_size ? (100 - (fileMetadata.test_size * 100)) : 80
    );
    const [targetColumn, setTargetColumn] = useState(fileMetadata?.target_column || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Default target column to the last available column (excluding selected features) if not already set
    React.useEffect(() => {
        if (fileMetadata?.columns && !targetColumn) {
            const availableColumns = fileMetadata.columns.filter(
                col => !fileMetadata?.selected_columns?.includes(col)
            );
            if (availableColumns.length > 0) {
                setTargetColumn(availableColumns[availableColumns.length - 1]);
            }
        }
    }, [fileMetadata, targetColumn]);

    const handleSplit = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const testSize = (100 - splitRatio) / 100;
            const res = await api.post('/split', {
                file_id: fileMetadata.file_id,
                target_column: targetColumn,
                test_size: testSize,
                selected_columns: fileMetadata.selected_columns // Pass user selections to filter features
            });
            // Pass the split info forward
            onComplete({
                ...fileMetadata,
                split: res.data,
                target_column: targetColumn,
                test_size: testSize
            });
        } catch (error) {
            console.error("Split failed", error);
            setError(error.response?.data?.detail || "Failed to split data. Ensure target column is valid.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Mascot
                mood={isProcessing ? 'thinking' : (error ? 'sad' : 'idle')}
                message={isProcessing ? "Splitting data..." : (error ? error : "Pick what to guess, move the slider and click on Split Data!")}
            />
            <div className="max-w-2xl mx-auto space-y-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Training vs Testing</h2>
                    </div>

                    {/* Target Column Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Column</label>
                        <p className="text-xs text-gray-400 mb-2">Select the column you want to predict (Target Variable).</p>
                        <select
                            value={targetColumn}
                            onChange={(e) => setTargetColumn(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                        >
                            {fileMetadata?.columns
                                ?.filter(col => !fileMetadata?.selected_columns?.includes(col))
                                .map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                        </select>
                    </div>

                    {/* Slider */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                            <span>Training Data: {splitRatio}%</span>
                            <span>Testing Data: {100 - splitRatio}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="90"
                            step="5"
                            value={splitRatio}
                            onChange={(e) => setSplitRatio(Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                        </div>
                    </div>

                    {/* Visual Representation */}
                    <div className="flex h-4 rounded-full overflow-hidden mb-8">
                        <div
                            className="bg-blue-600 h-full transition-all duration-500"
                            style={{ width: `${splitRatio}%` }}
                        />
                        <div
                            className="bg-gray-300 h-full transition-all duration-500"
                            style={{ width: `${100 - splitRatio}%` }}
                        />
                    </div>

                    <button
                        onClick={handleSplit}
                        disabled={isProcessing}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Splitting...' : (
                            <>
                                Split Data
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </>
    );
}
