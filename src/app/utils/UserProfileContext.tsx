import React, { ReactNode, createContext, useContext, useState } from 'react';

export type UserProfile = 'AI Admin' | 'AI Engineer' | 'Data Scientist' | 'end-user';

interface UserProfileContextType {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FunctionComponent<UserProfileProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    // Load from localStorage if available, otherwise default to 'AI Engineer'
    const saved = localStorage.getItem('userProfile');
    // Migrate old "Cluster Administrator" and "cluster-admin" values to "AI Admin"
    if (saved === 'Cluster Administrator' || saved === 'cluster-admin') {
      localStorage.setItem('userProfile', 'AI Admin');
      return 'AI Admin';
    }
    return (saved as UserProfile) || 'AI Engineer';
  });

  // Runtime migration: check and update if old value exists
  React.useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved === 'Cluster Administrator' || saved === 'cluster-admin') {
      localStorage.setItem('userProfile', 'AI Admin');
      setUserProfile('AI Admin');
    }
  }, []);

  const handleSetUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', profile);
  };

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile: handleSetUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
