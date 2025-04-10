import React, { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isHovering, setIsHovering] = useState(false);

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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background to-secondary/20">
      {/* Easter Egg */}
      <div 
        className="fixed bottom-0 left-0 p-4 opacity-0 hover:opacity-100 transition-opacity duration-500"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovering ? 1 : 0 }}
          className="text-sm font-mono text-primary/40"
        >
          MAS-AY
        </motion.span>
      </div>

      {/* Ana İçerik */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 space-y-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-2 text-center"
            >
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Profit Margin Calculator
              </h1>
              <p className="text-muted-foreground">
                Yatırımlarınızı akıllıca yönetin ve takip edin
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              Google ile Devam Et
            </motion.button>

            <div className="text-xs text-center text-muted-foreground">
              Giriş yaparak{' '}
              <a href="#" className="underline hover:text-primary">
                Kullanım Koşullarını
              </a>{' '}
              kabul etmiş olursunuz
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            <p>
              Basit ve güvenli giriş için sadece Google hesabınızı kullanıyoruz.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
