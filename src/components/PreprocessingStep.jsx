import React, { useState } from 'react';
import { Settings, BarChart3, Check, CheckSquare, Square, ListFilter } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import Mascot from './Mascot';

export default function PreprocessingStep({ fileMetadata, onComplete }) {
    const [selectedMethod, setSelectedMethod] = useState(fileMetadata?.scaler_type || 'standard');
    const [encodingMethod, setEncodingMethod] = useState(fileMetadata?.encoding_type || 'none');
    const [selectedColumns, setSelectedColumns] = useState(fileMetadata?.selected_columns || []);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    // Local state for preview interactions
    const [previewData, setPreviewData] = useState(fileMetadata?.preview || []);
    const [lastResult, setLastResult] = useState(null);

    // Initialize selected columns with all columns if not set
    React.useEffect(() => {
        if (fileMetadata?.columns && selectedColumns.length === 0 && !fileMetadata?.selected_columns) {
            setSelectedColumns(fileMetadata.columns);
        }
    }, [fileMetadata]);

    // Update previewData if fileMetadata changes (initial load or step navigation)
    React.useEffect(() => {
        if (fileMetadata?.preview) {
            setPreviewData(fileMetadata.preview);
        }
    }, [fileMetadata?.preview]);

    const toggleColumn = (col) => {
        setSelectedColumns(prev =>
            prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
        );
        setError(null);
    };

    const selectAll = () => {
        if (fileMetadata?.columns) {
            setSelectedColumns(fileMetadata.columns);
            setError(null);
        }
    };

    const deselectAll = () => {
        setSelectedColumns([]);
    };

    // Auto-process on changes
    React.useEffect(() => {
        let isMounted = true;

        const runPreprocessing = async () => {
            // Even if no columns are selected, we should run to ensure we get the "original" data state
            // (effectively "scaling nothing" = original data)
            // This fixes the issue where clearing selection left stale preview data.

            setIsProcessing(true);
            setError(null);
            try {
                const res = await api.post('/preprocess', {
                    file_id: fileMetadata.file_id,
                    numeric_columns: selectedColumns,
                    scaler_type: selectedMethod,
                    encoding_type: encodingMethod
                });

                if (isMounted) {
                    setPreviewData(res.data.preview);
                    setLastResult(res.data);
                }
            } catch (error) {
                console.error("Preprocessing failed", error);
                if (isMounted) {
                    setError(error.response?.data?.detail || "Failed to process data");
                }
            } finally {
                if (isMounted) {
                    setIsProcessing(false);
                }
            }
        };

        const debounceTimer = setTimeout(() => {
            runPreprocessing();
        }, 300); // Debounce to allow rapid clicking

        return () => {
            isMounted = false;
            clearTimeout(debounceTimer);
        };
    }, [selectedMethod, encodingMethod, selectedColumns, fileMetadata.file_id]);

    const handleContinue = () => {
        // Use the last result if available, or just existing metadata if we didn't change anything?
        // Actually, since we auto-run, lastResult should be populated if logic ran.
        // If logic hasn't ran (e.g. no columns selected), we can't proceed or just pass current.
        if (lastResult) {
            onComplete({
                ...fileMetadata,
                preprocessing: lastResult,
                scaler_type: selectedMethod,
                encoding_type: encodingMethod,
                selected_columns: selectedColumns,
                preview: previewData,
                numeric_columns: lastResult.numeric_columns || fileMetadata.numeric_columns // Update globally if changed
            });
        } else {
            // Fallback if user clicked Next really fast or no changes needed (but 'standard' is default)
            // We can trigger one final process or just assume it's done. 
            // With the effect running on mount, lastResult should exist or be processing.
            if (isProcessing) return; // Wait
            // If manual continue without result, maybe force existing
            onComplete({
                ...fileMetadata,
                scaler_type: selectedMethod,
                encoding_type: encodingMethod,
                selected_columns: selectedColumns
            });
        }
    };

    return (
        <>
            <Mascot
                mood={isProcessing ? 'thinking' : (error ? 'sad' : 'happy')}
                message={isProcessing ? "Cleaning up numbers..." : (error ? error : "I caught the changes! Data is transformed on the spot!")}
            />
            <div className="max-w-6xl mx-auto h-[650px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex h-full">

                    {/* Left Sidebar: Controls */}
                    <div className="w-80 bg-white border-r border-gray-300 flex flex-col flex-shrink-0">
                        <div className="p-4 border-b border-gray-300">
                            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                Configuration
                            </h2>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-6">

                            {/* Encoding Section */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Data Encoding</label>
                                <div className="space-y-2">
                                    <div className="flex items-start">
                                        <input
                                            id="enc_label"
                                            type="radio"
                                            name="encoding"
                                            value="label"
                                            checked={encodingMethod === 'label'}
                                            onChange={(e) => setEncodingMethod(e.target.value)}
                                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                        />
                                        <div className="ml-2">
                                            <label htmlFor="enc_label" className="block text-sm font-medium text-gray-900 cursor-pointer">
                                                Convert Words to Numbers
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Turns categories like "Cat" and "Dog" into 0 and 1.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <input
                                            id="enc_none"
                                            type="radio"
                                            name="encoding"
                                            value="none"
                                            checked={encodingMethod === 'none'}
                                            onChange={(e) => setEncodingMethod(e.target.value)}
                                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                        />
                                        <div className="ml-2">
                                            <label htmlFor="enc_none" className="block text-sm font-medium text-gray-900 cursor-pointer">
                                                Keep Words as Words
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Don't change any text columns.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scaling Method Section */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Scaling Method</label>
                                <div className="space-y-2">
                                    <div className="flex items-start">
                                        <input
                                            id="standard"
                                            type="radio"
                                            name="method"
                                            value="standard"
                                            checked={selectedMethod === 'standard'}
                                            onChange={(e) => setSelectedMethod(e.target.value)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-2">
                                            <label htmlFor="standard" className="block text-sm font-medium text-gray-900 cursor-pointer">
                                                Standardization
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Makes values centered around zero. Great for bell-curve data!
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <input
                                            id="minmax"
                                            type="radio"
                                            name="method"
                                            value="minmax"
                                            checked={selectedMethod === 'minmax'}
                                            onChange={(e) => setSelectedMethod(e.target.value)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-2">
                                            <label htmlFor="minmax" className="block text-sm font-medium text-gray-900 cursor-pointer">
                                                Normalization
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Squishes all numbers between 0 and 1. Simple and easy!
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <input
                                            id="none"
                                            type="radio"
                                            name="method"
                                            value="none"
                                            checked={selectedMethod === 'none'}
                                            onChange={(e) => setSelectedMethod(e.target.value)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-2">
                                            <label htmlFor="none" className="block text-sm font-medium text-gray-900 cursor-pointer">
                                                None
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Keep the data as is. No changes!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columns Section */}
                            <div className="flex flex-col h-full min-h-[200px]">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Feature Selection</label>
                                    <div className="flex gap-2 text-xs">
                                        <button onClick={selectAll} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">All</button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={deselectAll} className="text-gray-500 hover:text-gray-700 font-medium hover:underline">None</button>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-md flex-1 overflow-y-auto max-h-60">
                                    {fileMetadata?.columns?.map(col => {
                                        const isSelected = selectedColumns.includes(col);
                                        return (
                                            <div
                                                key={col}
                                                onClick={() => toggleColumn(col)}
                                                className={`flex items-center px-3 py-2 border-b last:border-b-0 border-gray-50 cursor-pointer hover:bg-gray-50 text-sm ${isSelected ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                                    {isSelected && <Check size={10} className="text-white" />}
                                                </div>
                                                <span className={`truncate ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>{col}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-2 text-xs text-gray-400 text-right">
                                    {selectedColumns.length} selected
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Area: Preview & Action */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                Data Preview
                            </h3>
                        </div>

                        <div className="flex-1 overflow-auto bg-gray-50 relative">
                            {/* Keeping the table exactly as it was, just removing extra wrappers if possible or keeping simplified */}
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-full divide-y divide-gray-200 text-sm border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-gray-100 sticky top-0 z-10">
                                            {fileMetadata?.columns?.map(col => (
                                                <th
                                                    key={col}
                                                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap border-b border-gray-200 ${selectedColumns.includes(col) ? 'text-blue-700 bg-blue-50' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                {fileMetadata?.columns?.map(col => (
                                                    <td
                                                        key={`${i}-${col}`}
                                                        className={`px-4 py-2 whitespace-nowrap text-sm border-r last:border-r-0 border-gray-50 ${selectedColumns.includes(col) ? 'font-medium text-gray-900 bg-blue-50/20' : 'text-gray-600'
                                                            }`}
                                                    >
                                                        {typeof row[col] === 'number' ? row[col].toFixed(4) : row[col]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <button
                                onClick={handleContinue}
                                disabled={isProcessing || (selectedMethod !== 'none' && selectedColumns.length === 0)}
                                className={`w-full py-2.5 rounded-md font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${isProcessing || (selectedMethod !== 'none' && selectedColumns.length === 0)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent'
                                    }`}
                            >
                                {isProcessing ? 'Thinking...' : 'Looks Good! Go Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
