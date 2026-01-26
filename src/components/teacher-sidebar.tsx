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
} from 'lucide-react';
import { AuthButton } from './auth-button';
import { cn } from '@/lib/utils';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';

const allMenuItems = [
  { href: '/', label: 'ပင်မစာမျက်နှာ', icon: LayoutDashboard, adminOnly: false },
  { href: '/quizzes', label: 'စာမေးပွဲများ', icon: FileText, adminOnly: false },
  { href: '/question-bank', label: 'မေးခွန်းဘဏ်', icon: Database, adminOnly: false },
  { href: '/students', label: 'ကျောင်းသားစီမံခန့်ခွဲမှု', icon: Users, adminOnly: false },
  { href: '/results', label: 'ရလဒ်နှင့် အစီရင်ခံစာ', icon: BarChart3, adminOnly: false },
  { href: '/billing', label: 'ငွေစာရင်း', icon: Wallet, adminOnly: false },
  { href: '/settings', label: 'ဆက်တင်များ', icon: Settings, adminOnly: false },
  { href: '/admin', label: 'အက်ဒမင် စီမံခန့်ခွဲမှု', icon: ShieldCheck, adminOnly: true },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { profile } = useUserWithProfile();

  const getHref = (item: typeof allMenuItems[0]) => {
      // The dashboard at '/' is where quizzes are managed.
      if (item.href === '/quizzes') {
          return '/';
      }
      return item.href;
  }
  
  const menuItems = allMenuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && profile?.userType === 'admin')
  );

  return (
    <Sidebar
      className="border-r border-emerald-500/30 bg-emerald-950/20 backdrop-blur-lg"
      collapsible="icon"
    >
      <SidebarHeader>
        <div className="flex w-full items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-white">
              <Activity />
              {state === 'expanded' && <span className="truncate">BTK Education</span>}
            </Link>
            <SidebarTrigger className="ml-auto text-emerald-100/80 hover:bg-emerald-400/20 hover:text-white" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const href = getHref(item);
            let isActive;
            if (href === '/') {
                // This handles 'ပင်မစာမျက်နှာ' and 'စာမေးပွဲများ'
                isActive = pathname === '/' || pathname.startsWith('/quizzes');
            } else if (href === '/results') {
                // This handles both the main results page and the specific grading pages
                isActive = pathname.startsWith('/results') || pathname.startsWith('/grading');
            } else if (href === '/admin') {
                isActive = pathname.startsWith('/admin');
            } else {
                // This handles all other pages like /question-bank etc.
                isActive = pathname.startsWith(href);
            }
            
            return (
              <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{children: item.label, className: "bg-slate-800 text-white border-slate-700"}}
                    className={cn(
                      'text-emerald-200/80 hover:bg-primary hover:text-primary-foreground hover:font-semibold justify-start',
                      isActive &&
                        'bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30'
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
