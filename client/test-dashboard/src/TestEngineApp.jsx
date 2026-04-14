import React, { useState } from 'react';
import TestEngineLogin from './TestEngineLogin';
import TestEngineInstructions from './TestEngineInstructions';

export default function TestEngineApp({ user, test }) {
  // steps: 'login' -> 'instructions' -> 'test'
  const [step, setStep] = useState('login');

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
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <h1 className="text-3xl font-bold">Main Exam Interface Loading...</h1>
      </div>
    );
  }

  return null;
}
