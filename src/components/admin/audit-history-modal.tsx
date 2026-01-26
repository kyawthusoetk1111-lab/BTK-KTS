'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockAuditLogs } from '@/lib/data';
import { format } from 'date-fns';
import { GitCommitVertical, ArrowRight } from 'lucide-react';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  submissionId: string;
}

export function AuditHistoryModal({ isOpen, onClose, studentName, submissionId }: AuditHistoryModalProps) {
  // In a real app, you'd fetch this data from Firestore based on submissionId
  // The user prompt mentioned fetching from a collection named 'auditLogs'
  const auditLogs = mockAuditLogs[submissionId] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Audit History: {studentName}</DialogTitle>
          <DialogDescription>
            Showing all grade changes and updates for this submission.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-4 px-4">
          <div className="relative pl-6 py-4">
            {/* Timeline Line */}
            {auditLogs.length > 0 && <div className="absolute left-[31px] top-4 h-[calc(100%-2rem)] w-0.5 bg-border -translate-x-1/2" />}

            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="relative mb-8 last:mb-0">
                  <div className="absolute left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background -translate-x-1/2" />
                  <div className="pl-8">
                    <p className="text-sm text-muted-foreground">{format(new Date(log.timestamp), 'PPP p')}</p>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                        <span className="font-mono">{log.oldScore}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-primary">{log.newScore}</span>
                        <span className="text-sm font-normal text-muted-foreground">by {log.updatedBy}</span>
                    </p>
                    {log.reason && <p className="text-sm text-muted-foreground mt-1">Reason: {log.reason}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <GitCommitVertical className="mx-auto h-8 w-8 mb-2" />
                No history found for this submission.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
