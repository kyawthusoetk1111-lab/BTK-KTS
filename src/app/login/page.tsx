'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Mail, Lock, UserCircle, Key } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default က Student ပါ
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ရွေးလိုက်တဲ့ Role အလိုက် လမ်းကြောင်းခွဲပေးခြင်း
    if (role === 'teacher') {
        router.push('/quizzes'); // Teacher -> Dashboard
    } else if (role === 'admin') {
        router.push('/admin');   // Admin -> Admin Panel
    } else {
        router.push('/');        // Student -> Home Page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none bg-white">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <Activity size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">BTK Education</CardTitle>
          <CardDescription className="text-slate-500">
            သင့်ရာထူးနှင့် အကောင့်ကို အသုံးပြု၍ ဝင်ရောက်ပါ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Role Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role (ရာထူး)</label>
                <div className="relative">
                    <select 
                        className="w-full p-3 pl-10 border rounded-md bg-slate-50 text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="student">Student (ကျောင်းသား)</option>
                        <option value="teacher">Teacher (ဆရာ)</option>
                        <option value="admin">Admin (အက်ဒမင်)</option>
                    </select>
                    <UserCircle className="absolute left-3 top-3.5 text-slate-500" size={18} />
                </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <Input 
                  type="email" 
                  placeholder="Email လိပ်စာ" 
                  className="pl-10 h-11 bg-slate-50 border-slate-300 text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Key className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <Input 
                  type="password" 
                  placeholder="စကားဝှက်" 
                  className="pl-10 h-11 bg-slate-50 border-slate-300 text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-bold shadow-md transition-all mt-4">
              Login ဝင်မည်
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            အကောင့်မရှိသေးဘူးလား? <Link href="/register" className="text-emerald-600 font-bold hover:underline">အသစ်ဖွင့်မည်</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
