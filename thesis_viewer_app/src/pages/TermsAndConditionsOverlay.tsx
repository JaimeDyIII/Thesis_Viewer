import React, { useRef, useEffect, useState } from 'react';
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo"; // Import the Logo component

interface TermsAndConditionsOverlayProps {
  userId: string;
  onAgree: () => void; // Callback to notify Dashboard when terms are accepted
}

const TermsAndConditionsOverlay: React.FC<TermsAndConditionsOverlayProps> = ({ userId, onAgree }) => {
  const [hasRead, setHasRead] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position to enable the agree button when user has scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        // Consider content read when scrolled to 90% of content
        if (scrollTop + clientHeight >= scrollHeight * 0.9) {
          setHasRead(true);
        }
      }
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

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
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div className="terms-container" style={{
        backgroundColor: '#f7f2ff',
        borderRadius: '10px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 6px 24px rgba(103, 58, 183, 0.3)',
      }}>
        <div className="terms-header" style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e0d8f0',
          backgroundColor: '#9370DB',
          color: 'white',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
        }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>
            Terms and Conditions
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.9 }}>
            Please read carefully and accept to continue
          </p>
        </div>
        
        <div 
          ref={contentRef}
          className="terms-content" 
          style={{
            padding: '24px',
            overflowY: 'auto',
            flexGrow: 1,
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#333',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Logo centered at the top */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '20px' 
          }}>
            <Logo size="medium" />
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '16px', color: '#673AB7' }}>
            Terms and Conditions for the Thesis Repository of New Era University
          </h2>
          
          <p style={{ fontStyle: 'italic', textAlign: 'center', marginBottom: '24px', color: '#666' }}>
            Effective Date: April 20, 2025
          </p>

          <p>
            Welcome to the Thesis Repository of New Era University (NEU). By accessing or using this website, 
            you agree to abide by the following Terms and Conditions. These terms govern your use of the site, 
            your data, and how New Era University manages, stores, and protects information and intellectual property.
          </p>
          
          <h3 style={{ color: '#673AB7' }}>1. Data Collection and Privacy</h3>
          <h4 style={{ color: '#9370DB' }}>1.1. User Data We Collect</h4>
          <p>We collect personal data necessary to provide access to our services, including:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Full Name</li>
            <li>Student or Faculty ID Number</li>
            <li>NEU Email Address</li>
            <li>Program/Department</li>
            <li>IP Address and Device Information (when accessing the repository)</li>
            <li>Uploaded Thesis Files and Metadata (title, abstract, keywords, adviser, etc.)</li>
          </ul>

          <h4 style={{ color: '#9370DB' }}>1.2. Use of Collected Data</h4>
          <p>Data collected will be used for:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Verifying user identity</li>
            <li>Managing and archiving academic work</li>
            <li>Access monitoring and usage analytics</li>
            <li>Enhancing system performance and security</li>
          </ul>

          <h4 style={{ color: '#9370DB' }}>1.3. Data Privacy Compliance</h4>
          <p>NEU upholds the Republic Act No. 10173 or the Data Privacy Act of 2012. We:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Ensure all collected personal data is processed fairly and lawfully</li>
            <li>Secure user data against unauthorized access</li>
            <li>Limit access to information only to authorized personnel</li>
            <li>Use data solely for academic, institutional, and legal purposes</li>
          </ul>

          <h3 style={{ color: '#673AB7' }}>2. Thesis and Academic Material Ownership</h3>
          <h4 style={{ color: '#9370DB' }}>2.1. Copyright Protection</h4>
          <p>
            All theses and academic materials uploaded in this repository are protected by 
            Republic Act No. 8293, otherwise known as the Intellectual Property Code of the Philippines. 
            Authors retain ownership of their work.
          </p>
          <p>Users are prohibited from:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Reproducing, distributing, or modifying materials without proper citation or written consent</li>
            <li>Using content for commercial purposes without explicit approval from the authors and NEU</li>
          </ul>

          <h4 style={{ color: '#9370DB' }}>2.2. Repository License</h4>
          <p>By submitting your thesis to the NEU Repository, you grant NEU a non-exclusive, royalty-free license to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Store, archive, and display your work digitally</li>
            <li>Allow access for research and academic purposes</li>
            <li>Preserve your work in accordance with academic best practices</li>
          </ul>

          <h3 style={{ color: '#673AB7' }}>3. Data Security and Storage</h3>
          <p>NEU implements industry-standard security measures to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Prevent data breaches and cyberattacks</li>
            <li>Safeguard sensitive and personal user data</li>
            <li>Regularly audit systems for compliance and integrity</li>
          </ul>
          <p>
            User data and submitted theses are stored in secure institutional servers with 
            access controls and encryption technologies.
          </p>

          <h3 style={{ color: '#673AB7' }}>4. User Conduct and Responsibilities</h3>
          <p>Users agree to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Provide accurate personal information</li>
            <li>Use the repository only for lawful and academic purposes</li>
            <li>Respect the privacy and intellectual property of others</li>
          </ul>
          <p>NEU reserves the right to restrict or revoke access to users who violate these terms.</p>

          <h3 style={{ color: '#673AB7' }}>5. Access to Materials</h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Theses are accessible to NEU students, faculty, and authorized researchers.</li>
            <li>Some works may be restricted or embargoed based on the author's request or institutional policies.</li>
            <li>Materials are made available for academic and non-commercial use only.</li>
          </ul>

          <h3 style={{ color: '#673AB7' }}>6. Privacy Within University Premises</h3>
          <p>NEU ensures that:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>
              Data collected within university premises, including physical interactions with the repository 
              (e.g., through library terminals), are governed by the same privacy standards
            </li>
            <li>
              CCTV or access logs used within premises are solely for security and monitoring purposes 
              in accordance with the Data Privacy Act
            </li>
          </ul>

          <h3 style={{ color: '#673AB7' }}>7. Modifications to Terms</h3>
          <p>
            NEU reserves the right to update or modify these Terms and Conditions at any time. 
            Changes will be communicated through the website. Continued use of the site after updates 
            constitutes acceptance of the new terms.
          </p>

          <h3 style={{ color: '#673AB7' }}>8. Contact and Inquiries</h3>
          <p>For questions or concerns regarding these Terms and Conditions or your data, please contact:</p>
          <p style={{ marginLeft: '20px' }}>
            <strong>NEU Data Protection Officer</strong><br />
            New Era University, #9 Central Avenue, Quezon City<br />
            Email: dpo@neu.edu.ph<br />
            Phone: (02) 8981-4221
          </p>

          <p style={{ marginTop: '24px', fontWeight: '500' }}>
            By using the NEU Thesis Repository, you acknowledge that you have read, understood, 
            and agreed to these Terms and Conditions.
          </p>
        </div>
        
        <div className="terms-footer" style={{
          padding: '16px 24px',
          borderTop: '1px solid #e0d8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f7f2ff',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
        }}>
          {!hasRead && (
            <div style={{ color: '#9c27b0', fontSize: '14px', fontWeight: '500' }}>
              Please scroll through the entire document to continue
            </div>
          )}
          
          <button
            onClick={handleAgree}
            disabled={!hasRead}
            className="agree-button"
            style={{
              padding: '12px 28px',
              backgroundColor: hasRead ? '#673AB7' : '#d8d0e8',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: hasRead ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '500',
              marginLeft: 'auto',
              transition: 'all 0.2s ease',
              boxShadow: hasRead ? '0 2px 4px rgba(103, 58, 183, 0.3)' : 'none',
            }}
          >
            I Agree to the Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsOverlay;