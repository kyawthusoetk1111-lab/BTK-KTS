'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Database,
  Users,
  BarChart3,
  Wallet,
  Settings,
  Activity,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { AuthButton } from './auth-button';
import { cn } from '@/lib/utils';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';

const allMenuItems = [
  { href: '/', label: 'ပင်မစာမျက်နှာ', icon: LayoutDashboard, adminOnly: false },
  { href: '/question-bank', label: 'မေးခွန်းဘဏ်', icon: Database, adminOnly: false },
  { href: '/students', label: 'ကျောင်းသားစီမံခန့်ခွဲမှု', icon: Users, adminOnly: false },
  { href: '/results', label: 'ရလဒ်နှင့် အစီရင်ခံစာ', icon: BarChart3, adminOnly: false },
  { href: '/rankings', label: 'ထိပ်တန်းစာရင်း', icon: Trophy, adminOnly: false },
  { href: '/billing', label: 'ငွေစာရင်း', icon: Wallet, adminOnly: false },
  { href: '/settings', label: 'ဆက်တင်များ', icon: Settings, adminOnly: false },
  { href: '/admin', label: 'အက်ဒမင် စီမံခန့်ခွဲမှု', icon: ShieldCheck, adminOnly: true },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { profile } = useUserWithProfile();

  const menuItems = allMenuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && profile?.userType === 'admin')
  );

  return (
    <Sidebar
      className="border-r bg-card shadow-sm"
      collapsible="icon"
    >
      <SidebarHeader>
        <div className="flex w-full items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
              <Activity />
              {state === 'expanded' && <span className="truncate">BTK Education</span>}
            </Link>
            <SidebarTrigger className="ml-auto text-muted-foreground hover:bg-accent hover:text-accent-foreground" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const href = item.href;
            let isActive;
            if (href === '/') {
                isActive = pathname === '/' || pathname.startsWith('/quizzes');
            } else if (href === '/results') {
                isActive = pathname.startsWith('/results') || pathname.startsWith('/grading');
            } else if (href === '/admin') {
                isActive = pathname.startsWith('/admin');
            } else if (href === '/rankings') {
                isActive = pathname.startsWith('/rankings');
            } else {
                isActive = pathname.startsWith(href);
            }
            
            return (
              <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{children: item.label, className: "bg-slate-800 text-white border-slate-700"}}
                    className={cn(
                      'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:font-semibold justify-start',
                      isActive &&
                        'bg-primary/10 text-primary font-semibold'
                    )}
                  >
                    <Link href={href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <div className={cn(state === 'collapsed' && 'w-full')}>
            <AuthButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
