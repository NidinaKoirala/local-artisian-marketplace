import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    middleName: user.middleName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    addressLine1: user.addressLine1 || '',
    addressLine2: user.addressLine2 || '',
    city: user.city || '',
    state: user.state || '',
    postalCode: user.postalCode || '',
    country: user.country || '',
  });

  const [changedFields, setChangedFields] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setChangedFields((prevFields) => ({ ...prevFields, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedFields = Object.keys(changedFields).reduce((acc, key) => {
      if (changedFields[key]) {
        acc[key] = formData[key];
      }
      return acc;
    }, {});
    console.log('Updated fields:', updatedFields);
    onUpdate(updatedFields);
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="block w-full p-2 border rounded-md"/>
          <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Middle Name (optional)" className="block w-full p-2 border rounded-md"/>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="block w-full p-2 border rounded-md"/>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" disabled className="block w-full p-2 border rounded-md bg-gray-100"/>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" className="block w-full p-2 border rounded-md"/>
          <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="Address Line 1" className="block w-full p-2 border rounded-md"/>
          <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Address Line 2 (optional)" className="block w-full p-2 border rounded-md"/>
          <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="block w-full p-2 border rounded-md"/>
          <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="block w-full p-2 border rounded-md"/>
          <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="Postal Code" className="block w-full p-2 border rounded-md"/>
          <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" className="block w-full p-2 border rounded-md"/>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white mt-4 p-2 rounded-md hover:bg-indigo-500">Save Changes</button>
      </form>
    </div>
  );
};

EditProfileForm.propTypes = {
  user: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default EditProfileForm;