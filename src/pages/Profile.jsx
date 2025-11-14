import React from 'react';
import { useAuth } from '../auth/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div className="p-6">Please login to access your profile.</div>;
  }

  if (!user) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div className="profile-page p-6">
      <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

export default Profile;
