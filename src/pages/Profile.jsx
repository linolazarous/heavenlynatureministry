import React from 'react';
import { useAuth } from '../auth/useAuth';
import ProfileCard from '../components/ProfileCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!user) {
    return <div className="p-6">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-page p-6">
      <ProfileCard user={user} />
      {/* Add donation stats or events later */}
    </div>
  );
};

export default Profile;
