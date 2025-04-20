import React from 'react';
import { supabase } from "../lib/supabase";

interface TermsAndConditionsOverlayProps {
  userId: string;
  onAgree: () => void; // Callback to notify Dashboard when terms are accepted
}

const TermsAndConditionsOverlay: React.FC<TermsAndConditionsOverlayProps> = ({ userId, onAgree }) => {
  const handleAgree = async () => {
    // Update the terms_and_condition to true in the database
    const { error } = await supabase
      .from('users')
      .update({ terms_and_condition: true })
      .eq('id', userId);

    if (error) {
      console.error('Error updating terms and conditions:', error);
      return;
    }

    onAgree(); // Notify Dashboard to hide the overlay
  };

  return (
    <div className="terms-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div className="terms-content" style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}>
        <h2 style={{ marginBottom: '16px' }}>Terms and Conditions</h2>
        <p style={{ marginBottom: '20px' }}>
          Please read and agree to our terms and conditions to proceed. By using this application,
          you agree to comply with and be bound by the following terms...
          {/* Add your full terms and conditions text here */}
        </p>
        <button
          onClick={handleAgree}
          className="agree-button"
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          I Agree
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditionsOverlay;