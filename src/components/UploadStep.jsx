import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import Mascot from './Mascot';

export default function UploadStep({ onComplete }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = async (file) => {
        setIsLoading(true);
        setError(null);

        if (!file) return;

        const validTypes = ['.csv', '.xls', '.xlsx'];
        const extension = '.' + file.name.split('.').pop().toLowerCase();

        if (!validTypes.includes(extension)) {
            setError('Invalid file format. Please upload a CSV or Excel file.');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onComplete(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to upload file');
            console.error("Upload error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    return (
        <>
            <Mascot
                mood={isLoading ? 'thinking' : (error ? 'sad' : 'idle')}
                message={isLoading ? "Reading your file..." : (error ? error : "Hi! Upload a file to start!")}
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto mt-10"
            >
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                        } bg-white shadow-sm`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-100 p-4 rounded-full mb-4">
                            {isLoading ? (
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            ) : (
                                <UploadCloud className="w-8 h-8 text-blue-600" />
                            )}
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {isLoading ? 'Uploading...' : 'Upload your dataset'}
                        </h3>

                        <p className="text-gray-500 mb-2">
                            Drag & drop your CSV or Excel file here, or click to browse
                        </p>


                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".csv, .xls, .xlsx"
                            onChange={handleFileSelect}
                            disabled={isLoading}
                        />

                        <label
                            htmlFor="file-upload"
                            className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer shadow-lg shadow-blue-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Browse Files
                        </label>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100"
                    >
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </motion.div>
                )}

                <div className="mt-8 text-center text-sm text-gray-400">
                    Supported formats: CSV, Excel (.xls, .xlsx)
                </div>
            </motion.div>
        </>
    );
}
