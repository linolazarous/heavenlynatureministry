import React from 'react';

const ProfileCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="profile-card p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-2">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
      <p className="text-gray-400 text-sm">Member since: {new Date(user.createdAt || Date.now()).getFullYear()}</p>
    </div>
  );
};

export default ProfileCard;
