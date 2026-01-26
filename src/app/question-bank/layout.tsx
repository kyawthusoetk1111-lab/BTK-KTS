import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TeacherSidebar } from '@/components/teacher-sidebar';

export default function QuestionBankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <TeacherSidebar />
      <SidebarInset className="bg-slate-100 dark:bg-slate-900">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
