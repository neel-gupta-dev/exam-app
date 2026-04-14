import React, { useState } from 'react';

export default function TestEngineInstructions({ user, onReady }) {
  const [page, setPage] = useState(1);
  const [isChecked, setIsChecked] = useState(false);

  const handleNext = () => setPage(2);
  const handlePrev = () => setPage(1);

  // Fallback name processing
  const fullName = user?.name || user?.username || 'John Smith';

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
                  <li>Total duration of examination is 120 minutes.</li>
                  <li>
                    The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
                  </li>
                  <li>
                    The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                    
                    <ul className="list-none pl-2 mt-6 space-y-5 font-sans">
                      <li className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center bg-white border-2 border-slate-400 bg-gradient-to-b from-white to-slate-200 rounded-sm font-bold shadow-sm mr-4 flex-shrink-0">1</div>
                        <span>You have not visited the question yet.</span>
                      </li>
                      <li className="flex items-center">
                        <div className="relative w-8 h-8 rounded-full rounded-b-none rounded-t-full bg-gradient-to-b from-[#EA4335] to-[#C1272D] text-white flex items-center justify-center font-bold shadow-sm mr-4 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 100%, 0% 100%, 0% 25%)', borderRadius: '4px' }}>
                           <span className="relative z-10 text-[14px]">2</span>
                           {/* NTA Red shield shape approximation */}
                           <div className="absolute inset-0 bg-[#E33B31]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' }}></div>
                           <span className="absolute z-20 top-1 text-white text-[13px]">2</span>
                        </div>
                        <span>You have not answered the question.</span>
                      </li>
                      <li className="flex items-center">
                        <div className="relative w-8 h-8 rounded-full rounded-b-none rounded-t-full bg-gradient-to-b from-[#34A853] to-[#257A3E] text-white flex items-center justify-center font-bold shadow-sm mr-4 flex-shrink-0" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' }}>
                          <span className="relative z-10 text-[14px]">3</span>
                        </div>
                        <span>You have answered the question.</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#9A62DB] to-[#7116C7] text-white flex items-center justify-center font-bold shadow-sm mr-4 flex-shrink-0">4</div>
                        <span>You have NOT answered the question, but have marked the question for review.</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#9A62DB] to-[#7116C7] text-white flex items-center justify-center font-bold shadow-sm mr-4 flex-shrink-0 relative">
                          5
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#34A853] rounded-full border border-white flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">✓</span>
                          </div>
                        </div>
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
                <p className="mb-4">The instructions are not available in the chosen language.</p>
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
                      I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall.I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations
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
                    onClick={onReady}
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
          <div className="w-24 h-24 mb-4 relative drop-shadow-md">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 85C65 85 75 75 75 60C75 45 65 35 50 35C35 35 25 45 25 60C25 75 35 85 50 85Z" fill="url(#paint0_linear)"/>
              <path d="M50 45C60 45 68 37 68 25C68 13 60 5 50 5C40 5 32 13 32 25C32 37 40 45 50 45Z" fill="url(#paint1_linear)"/>
              <path d="M75 58C85 58 92 65 92 75C92 88 80 95 50 95C20 95 8 88 8 75C8 65 15 58 25 58" stroke="#3A5C8E" strokeWidth="4" strokeLinecap="round"/>
              <defs>
                <linearGradient id="paint0_linear" x1="50" y1="35" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E2EEF5"/>
                  <stop offset="1" stopColor="#B3CDE0"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="50" y1="5" x2="50" y2="45" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3A5C8E"/>
                  <stop offset="1" stopColor="#1A3A6E"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3 className="text-[#3A5C8E] font-bold text-center">{fullName}</h3>
        </div>
      </div>

      {/* Very Bottom Footer */}
      <div className="bg-[#5C7DA3] text-white text-center py-0.5 text-[10px]">
        Version : 17.07.00
      </div>

    </div>
  );
}
