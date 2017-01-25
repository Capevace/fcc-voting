import React from 'react';

function AlertBox({ type = 'info', children }) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      {children}
    </div>
  );
}

export default AlertBox;
