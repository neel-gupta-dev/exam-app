import React from 'react';

export default function TestEngineLogin({ user, test, onSignIn }) {
  // Use name if available, else username
  const candidateName = user?.name || user?.username || user?.email || 'John Smith';
  
  // Real TCS iON styling colors extracted from official screenshots
  const primaryBlue = '#337ab7';
  const headerGray = '#666666';
  const highlightYellow = '#ffff00'; // Deeper industrial yellow

  // Helper SVG for the exact grid keyboard icon seen in official TCS login
  const KeyboardGridIcon = () => (
    <svg width="22" height="13" viewBox="0 0 22 13" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
      <rect width="22" height="13" rx="1" fill="#666" />
      {/* Keys grid row 1 */}
      <rect x="1.5" y="1.5" width="2.5" height="2" fill="#fff" />
      <rect x="4.5" y="1.5" width="2.5" height="2" fill="#fff" />
      <rect x="7.5" y="1.5" width="2.5" height="2" fill="#fff" />
      <rect x="10.5" y="1.5" width="2.5" height="2" fill="#fff" />
      <rect x="13.5" y="1.5" width="2.5" height="2" fill="#fff" />
      <rect x="16.5" y="1.5" width="4" height="2" fill="#fff" />
      {/* Keys grid row 2 */}
      <rect x="1.5" y="4.5" width="3.5" height="2" fill="#fff" />
      <rect x="5.5" y="4.5" width="2.5" height="2" fill="#fff" />
      <rect x="8.5" y="4.5" width="2.5" height="2" fill="#fff" />
      <rect x="11.5" y="4.5" width="2.5" height="2" fill="#fff" />
      <rect x="14.5" y="4.5" width="6" height="2" fill="#fff" />
      {/* Keys grid row 3 */}
      <rect x="1.5" y="7.5" width="2.5" height="2" fill="#fff" />
      <rect x="4.5" y="7.5" width="13" height="2" fill="#fff" /> {/* Spacebar */}
      <rect x="18" y="7.5" width="2.5" height="2" fill="#fff" />
    </svg>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', userSelect: 'none' }}>
      {/* Top Blue Bar */}
      <div style={{ backgroundColor: primaryBlue, height: '45px', width: '100%' }}></div>

      {/* Header Gray Bar Container */}
      <div style={{ 
        backgroundColor: headerGray, 
        padding: '12px 20px 8px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        color: '#ffffff',
        height: '100px',
        boxSizing: 'border-box'
      }}>
        
        {/* Left Panel: System Identifier */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', minWidth: '0', flex: 1 }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'normal', color: '#ffffff', opacity: 0.95, marginBottom: '2px' }}>System Name :</div>
            <div style={{ fontSize: '32px', color: highlightYellow, fontWeight: '400', lineHeight: '1.1', fontFamily: 'Arial, sans-serif' }}>C001</div>
          </div>
          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '4px' }}>
            Kindly contact the invigilator if there are any discrepancies in the Name and Photograph displayed on the screen or if the photograph is not yours
          </div>
        </div>

        {/* Right Panel: Candidate Meta & Photo */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginLeft: '20px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.95, marginBottom: '2px' }}>Candidate Name :</div>
            <div style={{ fontSize: '28px', color: highlightYellow, fontWeight: '400', lineHeight: '1.1', marginBottom: '5px', fontFamily: 'Arial, sans-serif' }}>
              {candidateName}
            </div>
            <div style={{ fontSize: '13px', color: highlightYellow, fontWeight: 'normal' }}>
              Subject : <span style={{ fontWeight: 'normal' }}>{test?.title || 'Mock Exam'}</span>
            </div>
          </div>
          {/* Image Box (Natively matches Image 1 container block spanning the bar) */}
          <div style={{ 
            width: '85px', 
            height: '85px', 
            backgroundColor: '#fff', 
            border: '1px solid #b0b0b0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxSizing: 'border-box',
            marginTop: '-2px'
          }}>
            <img src="/images/NewCandidateImage.jpg" alt="Candidate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Main Login Body Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', paddingBottom: '100px' }}>
        
        {/* Login Box chassis */}
        <div style={{ 
          width: '350px', 
          border: '1px solid #dcdcdc', 
          borderRadius: '2px', 
          backgroundColor: '#fcfcfc', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden' 
        }}>
          {/* Light Gray Header */}
          <div style={{ 
            backgroundColor: '#dfdfdf', 
            padding: '8px 15px', 
            fontWeight: 'bold', 
            fontSize: '14px',
            color: '#333333', 
            borderBottom: '1px solid #d0d0d0' 
          }}>
            Login
          </div>
          
          <div style={{ padding: '22px 20px' }}>
            {/* User Name Field Container */}
            <div style={{ 
              display: 'flex', 
              border: '1px solid #cccccc', 
              backgroundColor: '#f4f4f4', 
              marginBottom: '14px',
              height: '34px',
              boxSizing: 'border-box'
            }}>
              <div style={{ 
                width: '38px', 
                borderRight: '1px solid #cccccc', 
                backgroundColor: '#eeeeee', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img src="/images/user.png" alt="" style={{ width: '18px', height: '18px', objectFit: 'contain', opacity: 0.75 }} />
              </div>
              <input 
                type="text" 
                value={user?.username || user?.email || '11111'} 
                disabled 
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  padding: '0 10px', 
                  fontSize: '13px', 
                  color: '#666666', 
                  backgroundColor: '#f4f4f4',
                  outline: 'none'
                }}
              />
              <div style={{ 
                width: '38px', 
                borderLeft: '1px solid #cccccc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f4f4f4',
                flexShrink: 0
              }}>
                <KeyboardGridIcon />
              </div>
            </div>

            {/* Password Field Container */}
            <div style={{ 
              display: 'flex', 
              border: '1px solid #cccccc', 
              backgroundColor: '#f4f4f4', 
              marginBottom: '22px',
              height: '34px',
              boxSizing: 'border-box'
            }}>
              <div style={{ 
                width: '38px', 
                borderRight: '1px solid #cccccc', 
                backgroundColor: '#eeeeee', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img src="/images/Lock-26.png" alt="" style={{ width: '18px', height: '18px', objectFit: 'contain', opacity: 0.75 }} />
              </div>
              <input 
                type="password" 
                value="•••••" 
                disabled 
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  padding: '0 10px', 
                  fontSize: '13px', 
                  color: '#666666', 
                  backgroundColor: '#f4f4f4', 
                  letterSpacing: '1.5px',
                  outline: 'none'
                }}
              />
              <div style={{ 
                width: '38px', 
                borderLeft: '1px solid #cccccc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f4f4f4',
                flexShrink: 0
              }}>
                <KeyboardGridIcon />
              </div>
            </div>

            {/* Flat Cyan Sign In Button */}
            <button 
              onClick={onSignIn}
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: '#25aae1', // Perfect flat cyan from Image 1
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 'normal',
                cursor: 'pointer',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.1s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2097c9'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#25aae1'}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div style={{ backgroundColor: '#666666', height: '5px', width: '100%' }} />
    </div>
  );
}
