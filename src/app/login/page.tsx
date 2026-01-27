'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Activity } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Login နှိပ်လိုက်ရင် Dashboard ကို တိုက်ရိုက် ပို့ပေးပါမယ်
        router.push('/quizzes'); 
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-2xl border-none p-4">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2 text-blue-600"><Activity size={40}/></div>
                    <CardTitle className="text-2xl font-bold text-slate-900">အကောင့်ဝင်ပါ</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18}/>
                            <Input 
                                type="email" placeholder="Email" className="pl-10 text-slate-900"
                                value={email} onChange={(e) => setEmail(e.target.value)} required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18}/>
                            <Input 
                                type="password" placeholder="Password" className="pl-10 text-slate-900"
                                value={password} onChange={(e) => setPassword(e.target.value)} required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg">
                            Login ဝင်မည်
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-500">
                        အကောင့်မရှိသေးပါက <Link href="/login" className="text-blue-600 font-bold">Sign Up</Link> လုပ်ပါ
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
