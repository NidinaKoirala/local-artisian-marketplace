import React from 'react';

const StatsCard = ({ title, value, color }) => {
  return (
    <div className={`bg-${color}-500 text-white rounded-lg p-4 shadow`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatsCard;
