import React, { useState } from 'react';

const TcsIcon = ({ status, text }) => {
  // Standard TCS palette icon coordinate configuration from questions-sprite.png
  const config = {
    'answered': { pos: '-7px -56px', color: 'text-white' },
    'unanswered': { pos: '-42px -56px', color: 'text-white' },
    'marked-for-review': { pos: '-75px -56px', color: 'text-white' },
    'not-visited': { pos: '-107px -56px', color: 'text-[#333]' },
    'answered-and-marked': { pos: '-172px -56px', color: 'text-white' },
  };

  const icon = config[status] || config['not-visited'];

  return (
    <div className="flex shrink-0 items-center justify-center font-bold select-none overflow-hidden mr-4" style={{ width: '36px', height: '34px' }}>
      <div 
        className={`flex h-[28px] w-[30px] items-center justify-center bg-no-repeat text-[12px] font-bold leading-none ${icon.color}`}
        style={{
          backgroundImage: "url('/images/questions-sprite.png')",
          backgroundPosition: icon.pos,
        }}
      >
        <span className="pt-[1px] pl-[0.5px]">{text}</span>
      </div>
    </div>
  );
};

export default function TestEngineInstructions({ user, test, onReady }) {
  const [page, setPage] = useState(1);
  const [isChecked, setIsChecked] = useState(false);

  const handleNext = () => setPage(2);
  const handlePrev = () => setPage(1);

  const handleReady = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Fullscreen is best-effort; browsers can reject it depending on permissions.
    }
    onReady();
  };

  // Fallback name processing
  const fullName = user?.name || user?.username || 'John Smith';
  const generalInstructions = test?.instructions?.general?.length
    ? test.instructions.general
    : [
        `Total duration of examination is ${test?.durationMinutes || 0} minutes.`,
        'The countdown timer displays the remaining time available to complete the test.',
        'The test will automatically submit when the timer reaches zero.',
        'Use the question palette to navigate and review answer status.',
      ];
  const otherInstructions = test?.instructions?.other?.length
    ? test.instructions.other
    : ['No additional instructions are available for this test.'];
  const declarationText = test?.instructions?.declaration || 'I have read and understood the instructions and agree to follow the test rules.';

  return (
    <div className="flex flex-col h-screen text-slate-800 bg-[#E8EDF2] font-sans selection:bg-blue-200">
      
      {/* Top Main Header */}
      <div className="bg-[#3A5C8E] h-14 w-full" />
      
      {/* Blue Sub-header */}
      <div className="bg-[#C4E2ED] py-2 px-4 shadow-sm border-b border-slate-300">
        <h1 className="text-[#3A5C8E] font-bold text-lg">
          {page === 1 ? 'Instructions' : 'Other Important Instructions'}
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden m-2 bg-white border border-slate-400">
        
        {/* Left Instruction Panel */}
        <div className="flex-1 flex flex-col relative border-r border-slate-400">
          <div className="flex-1 overflow-y-auto px-10 py-6 pb-24 text-[15px] font-serif leading-relaxed">
            
            {page === 1 && (
              <>
                <h2 className="text-center text-lg mb-8">Please read the instructions carefully</h2>
                
                <p className="font-bold underline mb-4">General Instructions:</p>
                <ol className="list-decimal pl-5 space-y-3">
                  {generalInstructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                  <li>
                    The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                    
                    <ul className="list-none pl-2 mt-6 space-y-5 font-sans">
                      <li className="flex items-center">
                        <TcsIcon status="not-visited" text="1" />
                        <span>You have not visited the question yet.</span>
                      </li>
                      <li className="flex items-center">
                        <TcsIcon status="unanswered" text="2" />
                        <span>You have not answered the question.</span>
                      </li>
                      <li className="flex items-center">
                        <TcsIcon status="answered" text="3" />
                        <span>You have answered the question.</span>
                      </li>
                      <li className="flex items-center">
                        <TcsIcon status="marked-for-review" text="4" />
                        <span>You have NOT answered the question, but have marked the question for review.</span>
                      </li>
                      <li className="flex items-center">
                        <TcsIcon status="answered-and-marked" text="5" />
                        <span>The question(s) "Answered and Marked for Review" will be considered for evaluation.</span>
                      </li>
                    </ul>
                    <p className="mt-4 font-sans text-sm">
                      The Marked for Review status for a question simply indicates that you would like to look at that question again.
                    </p>
                  </li>
                  <li>
                    You can click on the "&gt;" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "&lt;" which appears on the right side of question window.
                  </li>
                  <li>
                    You can click on your "Profile" image on top right corner of your screen to change the language during the exam for entire question paper. On clicking of Profile image you will get a drop-down to change the question content to the desired language.
                  </li>
                  <li>
                    You can click on <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full mx-1 font-bold text-xs">↓</span> to navigate to the bottom and <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full mx-1 font-bold text-xs">↑</span> to navigate to the top of the question area, without scrolling.
                  </li>
                </ol>
              </>
            )}

            {page === 2 && (
              <>
                <ol className="list-decimal pl-5 space-y-3">
                  {otherInstructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </>
            )}

          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-300 bg-white">
            {page === 1 ? (
              <div className="flex justify-end p-4">
                <button
                  onClick={handleNext}
                  className="px-6 py-1.5 border border-slate-400 bg-white/50 hover:bg-slate-50 transition-colors shadow-sm text-slate-700 font-sans text-sm flex items-center"
                >
                  Next <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="p-3 border-b border-slate-200 bg-slate-50">
                  <label className="flex items-start cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 mr-3 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    <span className="text-[11px] leading-tight text-slate-700 font-sans">
                      {declarationText}
                    </span>
                  </label>
                </div>
                <div className="flex justify-between items-center p-4">
                  <button
                    onClick={handlePrev}
                    className="px-5 py-1.5 border border-slate-400 bg-white hover:bg-slate-50 transition-colors shadow-sm text-slate-700 font-sans text-sm flex items-center"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">chevron_left</span> Previous
                  </button>
                  
                  <button
                    onClick={handleReady}
                    disabled={!isChecked}
                    className={`px-8 py-1.5 font-sans text-sm shadow-sm transition-colors border ${
                      isChecked 
                        ? 'bg-[#5BB9E7] hover:bg-[#4AA8D6] text-white border-[#4AA8D6]' 
                        : 'bg-[#8CD3F5] text-white border-[#8CD3F5] cursor-not-allowed opacity-80'
                    }`}
                  >
                    I am ready to begin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Candidate Panel */}
        <div className="w-64 bg-white hidden md:flex flex-col items-center pt-8 px-4 font-sans border-l border-slate-300">
          {/* Mock NTA User Icon */}
          <div className="w-24 h-28 mb-4 relative drop-shadow-md overflow-hidden border border-slate-300">
            <img src="/images/NewCandidateImage.jpg" alt="Candidate" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-[#3A5C8E] font-bold text-center">{fullName}</h3>
        </div>
      </div>

    </div>
  );
}
