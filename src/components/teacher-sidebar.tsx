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
} from 'lucide-react';
import { AuthButton } from './auth-button';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const menuItems = [
  { href: '/', label: 'ပင်မစာမျက်နှာ', icon: LayoutDashboard },
  { href: '/quizzes', label: 'စာမေးပွဲများ', icon: FileText },
  { href: '/question-bank', label: 'မေးခွန်းဘဏ်', icon: Database },
  { href: '/students', label: 'ကျောင်းသားစီမံခန့်ခွဲမှု', icon: Users },
  { href: '/results', label: 'ရလဒ်နှင့် အစီရင်ခံစာ', icon: BarChart3 },
  { href: '/billing', label: 'ငွေစာရင်း', icon: Wallet },
  { href: '/settings', label: 'ဆက်တင်များ', icon: Settings },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const getHref = (item: typeof menuItems[0]) => {
      // The dashboard at '/' is where quizzes are managed.
      if (item.href === '/quizzes') {
          return '/';
      }
      return item.href;
  }

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
            <SidebarTrigger className="ml-auto text-white hover:bg-white/10 hover:text-white" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const href = getHref(item);
            const isActive = href !== '#' && (pathname === href || (href === '/' && item.href === '/quizzes'));
            
            return (
              <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{children: item.label, className: "bg-slate-800 text-white border-slate-700"}}
                    className={cn(
                      'text-gray-300 hover:bg-white/10 hover:text-white justify-start',
                      isActive &&
                        'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]'
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
