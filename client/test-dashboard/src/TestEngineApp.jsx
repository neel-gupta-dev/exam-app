import React, { useState } from 'react';
import TestEngineLogin from './pages/TestEngineLogin';
import TestEngineInstructions from './TestEngineInstructions';
import TestEngine from './pages/TestEngine';

export default function TestEngineApp({ user, test, attemptId, attemptToken }) {
  // steps: 'login' -> 'instructions' -> 'test'
  const [step, setStep] = useState('login');

  if (!test?._id) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-6 text-center">
        <div className="max-w-md">
          <h1 className="mb-3 text-xl font-bold text-slate-800">Test session not found</h1>
          <p className="mb-6 text-sm text-slate-600">
            Please return to the test dashboard and start the test again.
          </p>
          <button
            onClick={() => window.close()}
            className="rounded bg-[#337ab7] px-5 py-2 text-sm font-bold text-white"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  if (step === 'login') {
    return (
      <TestEngineLogin 
        user={user} 
        test={test} 
        onSignIn={() => setStep('instructions')} 
      />
    );
  }

  if (step === 'instructions') {
    return (
      <TestEngineInstructions 
        user={user} 
        test={test}
        onReady={() => setStep('test')}
      />
    );
  }

  if (step === 'test') {
    return (
      <TestEngine
        testId={test?._id}
        user={user}
        attemptId={attemptId}
        attemptToken={attemptToken}
        onSubmitted={() => {
          // Could redirect or show result — TestEngine handles result display internally
        }}
      />
    );
  }

  return null;
}
