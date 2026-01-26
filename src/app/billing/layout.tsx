import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TeacherSidebar } from '@/components/teacher-sidebar';

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <TeacherSidebar />
      <SidebarInset className="bg-slate-50">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
