import React, { useState } from 'react';
import TestEngineLogin from './pages/TestEngineLogin';
import TestEngineInstructions from './TestEngineInstructions';
import TestEngine from './pages/TestEngine';

export default function TestEngineApp({ user, test }) {
  // steps: 'login' -> 'instructions' -> 'test'
  const [step, setStep] = useState(() => {
    return (test && test.state === 'in-progress') ? 'test' : 'login';
  });

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
        onSubmitted={() => {
          // Could redirect or show result — TestEngine handles result display internally
        }}
      />
    );
  }

  return null;
}
