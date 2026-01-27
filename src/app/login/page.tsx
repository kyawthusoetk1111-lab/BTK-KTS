'use client';

import { auth, firestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const ADMIN_EMAIL = "kyawthusoetk1111@gmail.com";

  // --- ပုံမှန် Email/Password Login (For Students) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/student');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။" });
    } finally {
      setLoading(false);
    }
  };

  // --- Admin သီးသန့် Google Login ---
  const handleAdminGoogleLogin = async () => {
    setAdminLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "ဤနေရာသည် Admin သီးသန့်ဖြစ်ပါသည်။"
        });
        return;
      }

      // Admin ဖြစ်ကြောင်း သေချာပါက Firestore တွင် Role update လုပ်ပြီး Admin Dashboard သို့လွှတ်မည်
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        userType: 'admin',
        lastLogin: new Date().toISOString()
      }, { merge: true });

      router.push('/admin');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-emerald-600">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>ကျောင်းသားများအတွက် ဝင်ရောက်ရန်နေရာ</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Main Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Email လိပ်စာ" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="စကားဝှက် (Password)" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Login ဝင်မည်'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">သို့မဟုတ်</span></div>
          </div>

          {/* Admin Google Login Button */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleAdminGoogleLogin} 
              disabled={adminLoading}
              className="w-full border-slate-200 hover:bg-slate-50 hover:border-emerald-500 group"
            >
              {adminLoading ? <Loader2 className="animate-spin mr-2" /> : (
                <div className="flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" viewBox="0 0 24 24">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   <span className="font-bold group-hover:text-emerald-700">Admin Login with Google</span>
                </div>
              )}
            </Button>
            <p className="text-[10px] text-center text-slate-400">Admin များသာ ဤခလုတ်ဖြင့် ဝင်ရောက်နိုင်ပါသည်။</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-4">
          <p className="text-sm text-center">
            အကောင့်မရှိသေးဘူးလား? <Link href="/signup" className="text-emerald-600 font-bold">Register လုပ်ရန်</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
