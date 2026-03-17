"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, ShoppingCart, Activity, LogOut, Leaf } from 'lucide-react';
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if user is admin
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else if (currentUser.email === 'mateusalvesbassanelli@gmail.com') {
            setIsAdmin(true);
            // Automatically create/update the admin document so the admin system is independent
            if (!userDoc.exists()) {
              import('firebase/firestore').then(({ setDoc, serverTimestamp }) => {
                setDoc(userRef, {
                  uid: currentUser.uid,
                  name: currentUser.displayName || 'Admin User',
                  email: currentUser.email,
                  role: 'admin',
                  createdAt: serverTimestamp()
                }, { merge: true }).catch(console.error);
              });
            }
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <Leaf className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Access</h1>
          <p className="text-slate-500 mb-8">Please sign in to access the Endonutri admin dashboard.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-8">You do not have administrator privileges.</p>
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Meal Plans', href: '/admin/meal-plans', icon: FileText },
    { name: 'Grocery Lists', href: '/admin/grocery-lists', icon: ShoppingCart },
    { name: 'Logs', href: '/admin/logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">Endonutri</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-500',
                      'flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-slate-900 truncate">{user.displayName || user.email}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors group"
          >
            <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500 transition-colors" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
