import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Stepper from './components/Stepper';
import UploadStep from './components/UploadStep';
import PreprocessingStep from './components/PreprocessingStep';
import SplitStep from './components/SplitStep';
import ModelStep from './components/ModelStep';
import ResultsStep from './components/ResultsStep';
import Notification from './components/Notification';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleNotify = (event) => {
      setNotification(event.detail);
    };
    window.addEventListener('app-notify', handleNotify);
    return () => window.removeEventListener('app-notify', handleNotify);
  }, []);

  const nextStep = () => {
    setCurrentStep(prev => {
      const next = prev + 1;
      setMaxStep(m => Math.max(m, next));
      return next;
    });
  };

  const handleReset = () => {
    setFileMetadata(null);
    setCurrentStep(1);
    setMaxStep(1);
  };

  const handleUploadComplete = (data) => {
    setFileMetadata(data);
    nextStep();
  };

  const handlePreprocessingComplete = (data) => {
    setFileMetadata(data); // Updated with preprocessing info if needed
    nextStep();
  };

  const handleSplitComplete = (data) => {
    setFileMetadata(data);
    nextStep();
  };

  const handleModelComplete = (data) => {
    setFileMetadata(data);
    nextStep();
  };

  const handleStepClick = (stepId) => {
    // Allow navigating to any step that has been reached (maxStep)
    if (stepId <= maxStep) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
              Pick-n-Predict
            </h1>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Stepper currentStep={currentStep} maxStep={maxStep} onStepClick={handleStepClick} />

        <div className="mt-12">
          {currentStep === 1 && (
            <UploadStep onComplete={handleUploadComplete} />
          )}

          {currentStep === 2 && (
            <PreprocessingStep
              fileMetadata={fileMetadata}
              onComplete={handlePreprocessingComplete}
            />
          )}

          {currentStep === 3 && (
            <SplitStep
              fileMetadata={fileMetadata}
              onComplete={handleSplitComplete}
            />
          )}

          {currentStep === 4 && (
            <ModelStep
              fileMetadata={fileMetadata}
              onComplete={handleModelComplete}
            />
          )}

          {currentStep === 5 && (
            <ResultsStep
              fileMetadata={fileMetadata}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
