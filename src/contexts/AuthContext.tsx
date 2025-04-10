import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut, getAuth } from 'firebase/auth';
import { app, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const initialAuthState: AuthContextProps = {
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext<AuthContextProps>(initialAuthState);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const auth = getAuth(app);
  
  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
        if (result.user) {
          setUser(result.user);

          // Add user to the database
          const userDocRef = doc(db, 'users', result.user.uid);
          await setDoc(userDocRef, {
            email: result.user.email,
            displayName: result.user.displayName,
          });
        }
      } catch (error) {
      console.error('Error during Google sign-in', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error during sign-out', error);
    }
  };

  useEffect(() => {    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};