'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { AdminUser, UserRole, UserStatus, PermissionType } from '@/types/admin';
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
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

function buildAdminUserFromAuth(user: NonNullable<ReturnType<typeof useUser>['user']>): Omit<AdminUser, 'createdAt' | 'updatedAt'> {
  const [firstName = 'Admin', ...lastNameParts] = (user.displayName || '').split(' ').filter(Boolean);

  return {
    id: user.uid,
    uid: user.uid,
    email: user.email || '',
    firstName,
    lastName: lastNameParts.join(' '),
    avatar: user.photoURL || undefined,
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    permissions: Object.values(PermissionType).map((type) => ({
      type,
      granted: true,
    })),
    activityLog: [],
  };
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminUser = async () => {
      if (isUserLoading) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        setAdminUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

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
          return;
        }

        if (user.email) {
          const adminByEmailQuery = query(
            collection(firestore, 'admins'),
            where('email', '==', user.email),
            limit(1)
          );
          const adminByEmailSnapshot = await getDocs(adminByEmailQuery);
          const adminByEmailDoc = adminByEmailSnapshot.docs[0];

          if (adminByEmailDoc) {
            const data = adminByEmailDoc.data();
            setAdminUser({
              ...data,
              id: adminByEmailDoc.id,
              uid: user.uid,
              email: data.email || user.email,
              firstName: data.firstName || user.displayName?.split(' ')[0] || 'Admin',
              lastName: data.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as AdminUser);
            return;
          }
        }

        const anyAdminQuery = query(collection(firestore, 'admins'), limit(1));
        const anyAdminSnapshot = await getDocs(anyAdminQuery);

        if (anyAdminSnapshot.empty) {
          const bootstrapAdmin = buildAdminUserFromAuth(user);

          await setDoc(adminDocRef, {
            ...bootstrapAdmin,
            bootstrap: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          setAdminUser({
            ...bootstrapAdmin,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          return;
        }

        setAdminUser(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
        setAdminUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminUser();
  }, [user, isUserLoading, firestore]);

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
      [UserRole.BUSINESS_VEHICLE]: 1,
      [UserRole.BUSINESS_INSURANCE]: 1,
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
