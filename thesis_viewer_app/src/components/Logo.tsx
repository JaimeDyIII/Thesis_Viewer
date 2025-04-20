import React from 'react';
import logoImage from '../styles/New_Era_University.svg.png'; // Adjust the path based on your project structure

type LogoSize = 'small' | 'medium' | 'large';

interface LogoProps {
  size?: LogoSize; 
  className?: string; 
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {

  const sizeStyles = {
    small: {
      width: '50px',
      height: '50px',
    },
    medium: {
      width: '100px',
      height: '100px',
    },
    large: {
      width: '200px',
      height: '200px',
    },
  };

  return (
    <img
      src={logoImage}
      alt="New Era University Logo"
      style={{
        ...sizeStyles[size], 
        objectFit: 'contain', 
      }}
      className={className}
    />
  );
};

export default Logo;