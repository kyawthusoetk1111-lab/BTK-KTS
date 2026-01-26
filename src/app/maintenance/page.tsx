'use client';

import { HardHat, Activity } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-4">
        <div className="mb-4">
            <Activity className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-headline text-slate-800 mb-2">
            BTK & KTS Education
        </h1>
        <div className="max-w-md mx-auto">
            <HardHat className="h-16 w-16 text-amber-500 mx-auto my-8" />
            <h2 className="text-2xl font-bold text-slate-900">
                Coming Back Soon
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
                ကျွန်ုပ်တို့၏ Website ကို အဆင့်မြှင့်တင်နေပါသည်။ ခေတ္တစောင့်ဆိုင်းပေးပါရန်။
            </p>
            <p className="text-slate-500 mt-2 text-sm">
                We are currently performing scheduled maintenance. We should be back online shortly. Thank you for your patience.
            </p>
            <div className="mt-8">
                <Link href="/login" className="text-sm text-slate-600 hover:underline">
                    Admin Login
                </Link>
            </div>
        </div>
    </div>
  );
}
