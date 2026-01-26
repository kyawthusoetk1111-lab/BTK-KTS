import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TeacherSidebar } from '@/components/teacher-sidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <TeacherSidebar />
      <SidebarInset className="bg-gradient-to-br from-emerald-950 via-slate-950 to-blue-950 text-white">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
