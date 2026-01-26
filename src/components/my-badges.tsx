'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Badge } from '@/lib/types';
import { mockUserBadges } from '@/lib/data';

export function MyBadges() {
    const badges: Badge[] = mockUserBadges;

    if (!badges || badges.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>ရရှိထားသော ဆုတံဆိပ်များ</CardTitle>
                <CardDescription>Your achievements and accolades.</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="flex flex-wrap gap-6">
                        {badges.map(badge => (
                             <Tooltip key={badge.id}>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-110">
                                        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 shadow-inner">
                                            <badge.icon className="h-10 w-10 text-primary" />
                                        </div>
                                        <span className="text-xs font-medium text-center">{badge.name}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{badge.name}</p>
                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
