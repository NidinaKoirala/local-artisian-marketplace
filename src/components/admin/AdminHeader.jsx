import React from 'react';

const AdminHeader = ({ title }) => (
  <header className="bg-white shadow p-4 flex justify-between items-center">
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

export default AdminHeader;
