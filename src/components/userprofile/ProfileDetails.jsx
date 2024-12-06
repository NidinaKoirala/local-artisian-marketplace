import React from 'react';

const ProfileDetails = ({ user }) => {
  if (!user) return null;

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Profile Details</h3>
      <p className="text-gray-500 mb-2"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p className="text-gray-500 mb-2"><strong>Email:</strong> {user.email}</p>
      <p className="text-gray-500 mb-2"><strong>Username:</strong> {user.username}</p>
      <p className="text-gray-500 mb-2"><strong>Role:</strong> {user.role}</p>
      <p className="text-gray-500 mb-2"><strong>Phone:</strong> {user.phoneNumber || 'Not provided'}</p>
      <p className="text-gray-500">
        <strong>Address:</strong> {user.addressLine1}, {user.addressLine2 || ''}, {user.city}, {user.state}, {user.postalCode}, {user.country}
      </p>
    </div>
  );
};

export default ProfileDetails;
