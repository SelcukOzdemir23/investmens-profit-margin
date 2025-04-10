import React, { useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      toast({
        title: 'Success',
        description: `Welcome ${user.displayName}!`,
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        variant: 'destructive',
        title: 'Error signing in',
        description: 'There was an error signing in. Please try again.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Sign In / Sign Up
        </h2>
        <button
          onClick={handleGoogleSignIn}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          style={{
            backgroundColor: '#4285F4', 
          }}
        >          
          Sign In with Google
        </button>
      </div>
      <footer className="mt-4 text-gray-500 text-center">
        <p>
          This app only allows sign-in/sign-up with Google for a streamlined
          experience.
        </p>
      </footer>
    </div>
  );
};

export default Auth;
