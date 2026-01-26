'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
    Activity,
    Search,
    Calendar as CalendarIcon,
    LogIn,
    LogOut,
    UserPlus,
    UserCog,
    UserX,
    Wallet,
    ClipboardCheck
} from "lucide-react";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


type SystemLogModule = 'Authentication' | 'Students' | 'Billing' | 'Exams';

interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  module: SystemLogModule;
  details: string;
}

// Mock data to build the UI. In a real app, this would come from Firestore.
const mockSystemLogs: SystemLog[] = [
    { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: 'Admin', avatar: 'A', module: 'Exams', action: 'Updated Score', details: 'Changed score for Alice on "GK Quiz" from 12 to 15.' },
    { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user: 'Admin', avatar: 'A', module: 'Billing', action: 'Approved Payment', details: 'Approved payment of 5,000 MMK for Bob.' },
    { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: 'Alice', avatar: 'A', module: 'Authentication', action: 'Logged In', details: 'User successfully logged in.' },
    { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), user: 'Admin', avatar: 'A', module: 'Students', action: 'Added Student', details: 'Created a new student profile for Charlie.' },
    { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), user: 'Admin', avatar: 'A', module: 'Students', action: 'Suspended User', details: 'Account for "David" has been suspended.' },
    { id: '6', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), user: 'Bob', avatar: 'B', module: 'Authentication', action: 'Logged Out', details: 'User successfully logged out.' },
    { id: '7', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), user: 'Admin', avatar: 'A', module: 'Billing', action: 'Recorded Expense', details: 'Added new expense: "Office Supplies" for 25,000 MMK.' },
];

const moduleFilters: (SystemLogModule | 'All')[] = ['All', 'Authentication', 'Students', 'Billing', 'Exams'];

const getIconForLog = (log: SystemLog) => {
    switch (log.module) {
        case 'Authentication':
            return log.action === 'Logged In' ? <LogIn className="h-5 w-5 text-emerald-500" /> : <LogOut className="h-5 w-5 text-red-500" />;
        case 'Students':
            if (log.action.includes('Added')) return <UserPlus className="h-5 w-5 text-emerald-500" />;
            if (log.action.includes('Suspended')) return <UserCog className="h-5 w-5 text-amber-500" />;
            if (log.action.includes('Deleted')) return <UserX className="h-5 w-5 text-red-500" />;
            return <UserCog className="h-5 w-5 text-sky-500" />;
        case 'Billing':
            return <Wallet className="h-5 w-5 text-indigo-500" />;
        case 'Exams':
            return <ClipboardCheck className="h-5 w-5 text-fuchsia-500" />;
        default:
            return <Activity className="h-5 w-5 text-slate-500" />;
    }
}


export default function LogsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState<SystemLogModule | 'All'>('All');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const filteredLogs = useMemo(() => {
        return mockSystemLogs
            .filter(log => {
                const searchMatch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    log.details.toLowerCase().includes(searchTerm.toLowerCase());
                return searchMatch;
            })
            .filter(log => {
                return selectedModule === 'All' || log.module === selectedModule;
            })
            .filter(log => {
                if (!dateRange || (!dateRange.from && !dateRange.to)) return true;
                const logDate = new Date(log.timestamp);
                if (dateRange.from && logDate < dateRange.from) return false;
                // Set the 'to' date to the end of the day for inclusive filtering
                if (dateRange.to) {
                    const toDate = new Date(dateRange.to);
                    toDate.setHours(23, 59, 59, 999);
                    if (logDate > toDate) return false;
                }
                return true;
            });
    }, [searchTerm, selectedModule, dateRange]);

    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Activity Logs</h2>
                    <p className="text-muted-foreground">
                        An immutable record of all significant events in the system.
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search by user or action..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedModule} onValueChange={(val: SystemLogModule | 'All') => setSelectedModule(val)}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by module" />
                                </SelectTrigger>
                                <SelectContent>
                                    {moduleFilters.map(mod => (
                                        <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>Pick a date range</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {filteredLogs.length > 0 ? filteredLogs.map(log => (
                             <li key={log.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    {getIconForLog(log)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">
                                            {log.user}
                                            <span className="text-muted-foreground font-normal"> performed action: </span> 
                                            {log.action}
                                        </p>
                                        <span className="text-xs text-muted-foreground">{format(new Date(log.timestamp), 'PP p')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{log.details}</p>
                                    <Badge variant="outline" className="mt-1">{log.module}</Badge>
                                </div>
                            </li>
                        )) : (
                             <li className="text-center text-muted-foreground py-16">
                                <Activity className="mx-auto h-12 w-12 mb-4" />
                                <p>No system logs found for the selected filters.</p>
                            </li>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </main>
    );
}
