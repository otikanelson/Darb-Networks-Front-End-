// src/components/ui/CustomLink.jsx
import React from 'react';
import { CustomNav } from '../../hooks/CustomNavigation';

const CustomLink = ({ to, children, className = '', ...props }) => {
  const navigate = CustomNav();

  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      href={to}
      className={`cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

export default CustomLink;