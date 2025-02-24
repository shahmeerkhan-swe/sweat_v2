import React from 'react';

const FeedbackButton = () => {
  const handleClick = () => {
    window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=MVElUymxEECG4UdL_X6AdsRH2fDbL2JBuaTS3CL94f9URUozTjhSRURFVVhRV0tZN04wRFk5SjBKTi4u', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '4px',
        left: '4px',
        padding: '8px 16px',
        backgroundColor: '#0a0a94',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        transition: 'all 0.2s',
        zIndex: 999,
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.backgroundColor = '#1a1a99'; // Darker blue on hover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = '#0a0a94';
      }}
    >
      Give Feedback
    </button>
  );
};

export default FeedbackButton;
