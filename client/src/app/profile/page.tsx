import AuthedLayout from '@/components/authedLayout';
import ProfileContent from '@/components/profileContent';
import { FC } from 'react';

const ProfilePage: FC = () => {
  return (
    <AuthedLayout>
      <ProfileContent />
    </AuthedLayout>
  )
};

export default ProfilePage;