import React from 'react';
import PropTypes from 'prop-types';

export default function Container({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        maxWidth: '1600px',
        margin: '0 auto',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        width: '100%',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
}; 