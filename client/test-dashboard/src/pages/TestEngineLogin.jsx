import React from 'react';

export default function TestEngineLogin({ user, test, onSignIn }) {
  // Use name if available, else username
  const candidateName = user?.name || user?.username || user?.email || 'Student';
  
  // NTA standard colors
  const primaryBlue = '#337ab7';
  const headerGray = '#666666';
  const footerGray = '#666666';
  const highlightYellow = '#FFFF00';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
      {/* Top Thin Blue Bar */}
      <div style={{ backgroundColor: primaryBlue, height: '40px', width: '100%' }}></div>

      {/* Main Header Info Bar */}
      <div style={{ backgroundColor: headerGray, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', color: '#ffffff' }}>
        
        {/* Left Side: System Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '18px' }}>System Name :</div>
          <div style={{ fontSize: '36px', color: highlightYellow, fontWeight: 'bold' }}>C001</div>
          <div style={{ fontSize: '14px', marginTop: '10px' }}>
            Kindly contact the invigilator if there are any discrepancies in the Name and Photograph displayed on the screen or if the photograph is not yours
          </div>
        </div>

        {/* Right Side: Candidate Info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px' }}>Candidate Name :</div>
            <div style={{ fontSize: '28px', color: highlightYellow, fontWeight: 'bold', marginBottom: '8px' }}>
              {candidateName}
            </div>
            <div style={{ fontSize: '16px', color: highlightYellow }}>
              {test?.title || 'Mock Exam'}
            </div>
          </div>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            backgroundColor: '#fff', 
            border: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img src="/NewCandidateImage.jpg" alt="Candidate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Main Content Area (Login Box) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '40px' }}>
        <div style={{ width: '400px', border: '1px solid #d3d3d3', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
          <div style={{ backgroundColor: '#e2e2e2', padding: '12px 15px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #d3d3d3' }}>
            Login
          </div>
          
          <div style={{ padding: '20px' }}>
            {/* Username Input */}
            <div style={{ display: 'flex', border: '1px solid #ccc', backgroundColor: '#fff', marginBottom: '15px' }}>
              <div style={{ padding: '10px 15px', borderRight: '1px solid #ccc', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#555' }}>person</span>
              </div>
              <input 
                type="text" 
                value={user?.username || user?.email || ''} 
                disabled 
                style={{ flex: 1, border: 'none', padding: '10px', fontSize: '16px', color: '#999', backgroundColor: '#fff' }}
              />
              <div style={{ padding: '10px', borderLeft: '1px solid #ccc', display: 'flex', alignItems: 'center', color: '#555' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>keyboard</span>
              </div>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', border: '1px solid #ccc', backgroundColor: '#fff', marginBottom: '20px' }}>
              <div style={{ padding: '10px 15px', borderRight: '1px solid #ccc', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#555' }}>lock</span>
              </div>
              <input 
                type="password" 
                value="********" 
                disabled 
                style={{ flex: 1, border: 'none', padding: '10px', fontSize: '16px', color: '#999', backgroundColor: '#fff', letterSpacing: '2px' }}
              />
              <div style={{ padding: '10px', borderLeft: '1px solid #ccc', display: 'flex', alignItems: 'center', color: '#555' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>keyboard</span>
              </div>
            </div>

            {/* Sign In Button */}
            <button 
              onClick={onSignIn}
              style={{
                width: '100%',
                backgroundColor: '#35baf6',
                color: '#fff',
                border: '1px solid #2a9cd2',
                padding: '12px',
                fontSize: '16px',
                cursor: 'pointer',
                borderRadius: '3px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2a9cd2'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#35baf6'}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: footerGray, color: '#fff', textAlign: 'center', padding: '5px', fontSize: '12px' }} />
    </div>
  );
}
