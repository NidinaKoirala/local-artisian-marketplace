import React from 'react';

const AdminHeader = ({ title }) => (
  <header className="bg-white shadow p-4 flex justify-between items-center">
    <h1 className="text-xl font-bold">{title}</h1>
    <input type="text" placeholder="Search..." className="border p-2 rounded" />
  </header>
);

export default AdminHeader;
