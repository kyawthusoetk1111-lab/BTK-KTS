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
  LayoutPanelTop,
  Users,
  ShieldCheck,
  PieChart,
  Activity,
  LogOut
} from 'lucide-react';
import { AuthButton } from '../auth-button';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';

const menuItems = [
  { href: '/admin', label: 'Admin Overview', icon: LayoutPanelTop, matchExact: true },
  { href: '/admin/users', label: 'အသုံးပြုသူများ စီမံရန်', icon: Users },
  { href: '/admin/audit', label: 'Exam Audit', icon: ShieldCheck },
  { href: '/admin/financials', label: 'Financial Insights', icon: PieChart },
  { href: '/admin/logs', label: 'စနစ်မှတ်တမ်း', icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const auth = useAuth();
  const { profile, user } = useUserWithProfile();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };
  
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <Sidebar
      className="border-r bg-card shadow-sm"
      collapsible="icon"
    >
      <SidebarHeader>
        <div className="flex w-full items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
              <Activity />
              {state === 'expanded' && <span className="truncate">BTK Admin</span>}
            </Link>
            <SidebarTrigger className="ml-auto text-muted-foreground hover:bg-accent hover:text-accent-foreground" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
            
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
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <div className={cn("flex w-full items-center", state === 'collapsed' ? 'justify-center' : 'justify-between')}>
            {profile && user && state === 'expanded' && (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        {user.photoURL && <AvatarImage src={user.photoURL} alt={profile.name} />}
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight">{profile.name}</span>
                        <span className="text-xs text-muted-foreground leading-tight">{profile.email}</span>
                    </div>
                </div>
            )}
             <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground">
                <LogOut className="h-5 w-5" />
             </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
