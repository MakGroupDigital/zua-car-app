'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { AdminUser, UserRole, PermissionType } from '@/types/admin';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: PermissionType) => boolean;
  checkRole: (role: UserRole) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminUser = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const adminDocRef = doc(firestore, 'admins', user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
          const data = adminDoc.data();
          setAdminUser({
            ...data,
            id: adminDoc.id,
            uid: user.uid,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as AdminUser);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminUser();
  }, [user, firestore]);

  const hasPermission = (permission: PermissionType): boolean => {
    if (!adminUser) return false;
    return adminUser.permissions?.some((p) => p.type === permission && p.granted) || false;
  };

  const checkRole = (role: UserRole): boolean => {
    if (!adminUser) return false;
    if (adminUser.role === UserRole.SUPER_ADMIN) return true;

    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.SUPER_ADMIN]: 5,
      [UserRole.ADMIN]: 4,
      [UserRole.MODERATOR]: 3,
      [UserRole.SUPPORT]: 2,
      [UserRole.SELLER]: 1,
      [UserRole.USER]: 0,
    };

    return (roleHierarchy[adminUser.role] || 0) >= (roleHierarchy[role] || 0);
  };

  const value: AdminContextType = {
    adminUser,
    isAdmin: !!adminUser,
    isLoading,
    error,
    hasPermission,
    checkRole,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
