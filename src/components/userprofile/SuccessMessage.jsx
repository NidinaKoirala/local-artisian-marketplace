import React from 'react';

const SuccessMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
      {message}
    </div>
  );
};

export default SuccessMessage;
