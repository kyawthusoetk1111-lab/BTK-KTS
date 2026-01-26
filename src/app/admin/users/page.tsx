'use client';

import { UserDirectory } from "@/components/admin/user-directory";

export default function UserControlCenterPage() {

    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ကျောင်းသားစီမံခန့်ခွဲမှု</h2>
                    <p className="text-muted-foreground">
                        View, edit, and manage all users on the platform.
                    </p>
                </div>
            </div>

            <UserDirectory />
        </main>
    );
}

    