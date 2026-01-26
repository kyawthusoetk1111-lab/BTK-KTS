'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Building, AlertTriangle, CloudDownload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, getDocs, collection } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { SystemStatus } from '@/lib/types';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


export default function SettingsPage() {
    const { toast } = useToast();
    const [schoolName, setSchoolName] = useState('BTK & KTS Education');
    const [address, setAddress] = useState('123 Education Lane, Yangon, Myanmar');
    const [contactNumber, setContactNumber] = useState('09-123-456-789');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const firestore = useFirestore();
    const statusRef = useMemoFirebase(() => firestore ? doc(firestore, 'system', 'status') : null, [firestore]);
    const { data: systemStatus, isLoading: isStatusLoading } = useDoc<SystemStatus>(statusRef);

    const [isExportingStudents, setIsExportingStudents] = useState(false);
    const [isExportingFinancials, setIsExportingFinancials] = useState(false);
    const [isExportingJson, setIsExportingJson] = useState(false);
    const [lastBackup, setLastBackup] = useState<string | null>(null);

    useEffect(() => {
        const savedBackupDate = localStorage.getItem('lastBackupDate');
        if (savedBackupDate) {
        setLastBackup(savedBackupDate);
        }
    }, []);

    const updateLastBackup = () => {
        const now = new Date().toISOString();
        setLastBackup(now);
        localStorage.setItem('lastBackupDate', now);
    };

    const handleExportStudents = async () => {
        if (!firestore) return;
        setIsExportingStudents(true);
        try {
            const usersQuery = collection(firestore, 'users');
            const querySnapshot = await getDocs(usersQuery);
            const allUsers = querySnapshot.docs.map(doc => doc.data());
            
            const students = allUsers.filter(user => user.userType === 'student' || user.userType === 'teacher');
            
            const worksheet = XLSX.utils.json_to_sheet(students);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
            
            const date = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `BTK_Users_Backup_${date}.xlsx`);
            
            updateLastBackup();
            toast({ title: "Success", description: "User data exported." });
        } catch (error) {
            console.error("Export error:", error);
            toast({ title: "Export Failed", variant: "destructive" });
        }
        setIsExportingStudents(false);
    };

    const handleExportFinancials = async () => {
        if (!firestore) return;
        setIsExportingFinancials(true);
        try {
            const paymentsQuery = collection(firestore, 'payments');
            const querySnapshot = await getDocs(paymentsQuery);
            const allPayments = querySnapshot.docs.map(doc => doc.data());
            
            const worksheet = XLSX.utils.json_to_sheet(allPayments);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Financials");
            
            const date = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `BTK_Financials_Backup_${date}.xlsx`);
            
            updateLastBackup();
            toast({ title: "Success", description: "Financial records exported." });
        } catch (error) {
            console.error("Export error:", error);
            toast({ title: "Export Failed", variant: "destructive" });
        }
        setIsExportingFinancials(false);
    };

    const handleFullBackup = async () => {
        if (!firestore) return;
        setIsExportingJson(true);
        try {
            const collectionsToBackup = ['users', 'quizzes', 'payments', 'system', 'quizBank'];
            const backupData: Record<string, any[]> = {};

            for (const collectionName of collectionsToBackup) {
                const querySnapshot = await getDocs(collection(firestore, collectionName));
                backupData[collectionName] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
            
            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const href = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = href;
            link.download = `BTK_Full_Backup_${new Date().toISOString()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
            
            updateLastBackup();
            toast({ title: "Backup Complete", description: "Full system backup downloaded." });
        } catch (error) {
            console.error("Backup error:", error);
            toast({ title: "Backup Failed", variant: "destructive" });
        }
        setIsExportingJson(false);
    };

    const isBackupOld = () => {
        if (!lastBackup) return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(lastBackup) < sevenDaysAgo;
    };


    const handleMaintenanceModeChange = (isMaintenance: boolean) => {
        if (statusRef) {
            // Create the document if it doesn't exist, or merge the field if it does.
            setDocumentNonBlocking(statusRef, { isMaintenanceMode: isMaintenance, id: 'status' }, { merge: true });
            toast({
                title: 'Settings Updated',
                description: `Maintenance mode has been ${isMaintenance ? 'enabled' : 'disabled'}.`
            });
        }
    };

    const handleSaveChanges = () => {
        toast({
            title: 'Settings Saved (Demo)',
            description: 'In a real app, this would save the school profile.',
        });
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                toast({
                    title: 'Logo Preview Updated',
                    description: 'Click "Save Changes" to apply.',
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-4xl font-bold font-headline tracking-tight">ဆက်တင်များ</h1>
                <p className="text-gray-300">
                    Manage your school's profile, academic settings, and more.
                </p>
            </div>

            <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-6 w-6"/>
                        School Profile
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                        This information will appear on receipts and reports.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="space-y-2">
                            <Label>School Logo</Label>
                            <Avatar className="h-24 w-24 border-2 border-emerald-500/30">
                                <AvatarImage src={logoPreview || undefined} alt="School Logo" />
                                <AvatarFallback className="bg-transparent text-gray-400">BTK</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <input 
                                type="file" 
                                id="logo-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />
                            <Button asChild variant="outline" className="bg-transparent border-sky-400/40 text-sky-300 hover:bg-sky-400/20 hover:text-sky-200">
                               <label htmlFor="logo-upload">
                                 <Upload className="mr-2 h-4 w-4" />
                                  Upload Logo
                               </label>
                            </Button>
                            <p className="text-xs text-gray-400 mt-2">Recommended: 200x200px PNG</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="school-name">School Name</Label>
                            <Input 
                                id="school-name"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                className="bg-emerald-900/20 border-emerald-500/30 placeholder:text-gray-400 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact-number">Contact Number</Label>
                            <Input 
                                id="contact-number"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                className="bg-emerald-900/20 border-emerald-500/30 placeholder:text-gray-400 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea 
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="bg-emerald-900/20 border-emerald-500/30 placeholder:text-gray-400 focus:ring-emerald-500"
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-black/20 p-4 flex justify-end">
                    <Button onClick={handleSaveChanges} className="bg-emerald-500 text-slate-950 hover:bg-emerald-600">
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CloudDownload className="h-6 w-6"/>
                        ဒေတာအရန်သိမ်းဆည်းရန် (Data Backup)
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                        Export your platform data for safekeeping.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={handleExportStudents} disabled={isExportingStudents} className="bg-emerald-500 text-slate-950 hover:bg-emerald-600">
                        {isExportingStudents ? <Loader2 className="animate-spin mr-2" /> : <CloudDownload className="mr-2" />}
                        Download All Users
                    </Button>
                    <Button onClick={handleExportFinancials} disabled={isExportingFinancials} className="bg-emerald-500 text-slate-950 hover:bg-emerald-600">
                        {isExportingFinancials ? <Loader2 className="animate-spin mr-2" /> : <CloudDownload className="mr-2" />}
                        Download Financials
                    </Button>
                    <Button onClick={handleFullBackup} disabled={isExportingJson} className="bg-sky-500 text-white hover:bg-sky-600">
                        {isExportingJson ? <Loader2 className="animate-spin mr-2" /> : <CloudDownload className="mr-2" />}
                        Download Full Backup (JSON)
                    </Button>
                </CardContent>
                <CardFooter className="bg-black/20 p-4">
                    {lastBackup ? (
                        <p className={cn("text-sm", isBackupOld() ? "text-amber-300 font-semibold" : "text-gray-400")}>
                            Last backup taken: {format(new Date(lastBackup), "PPP p")}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400">No backup has been taken yet.</p>
                    )}
                </CardFooter>
            </Card>


            <Card className="bg-amber-800/20 backdrop-blur-md border border-amber-500/30 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6"/>
                        System Controls
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-black/20 p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="maintenance-mode" className="text-base font-medium">ကျောင်းသားများ ဝင်ရောက်မှုကို ခေတ္တပိတ်ထားရန် (Maintenance Mode)</Label>
                            <p className="text-sm text-gray-300">Enabling this will redirect all students to a maintenance page.</p>
                        </div>
                        {isStatusLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <Switch
                                id="maintenance-mode"
                                checked={systemStatus?.isMaintenanceMode || false}
                                onCheckedChange={handleMaintenanceModeChange}
                                className="data-[state=checked]:bg-amber-500"
                            />
                        )}
                    </div>
                </CardContent>
            </Card>


            {/* Placeholder for other sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white opacity-50">
                     <CardHeader>
                        <CardTitle>Academic Configuration</CardTitle>
                        <CardDescription className="text-gray-400">Coming Soon</CardDescription>
                    </CardHeader>
                </Card>
                 <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white opacity-50">
                     <CardHeader>
                        <CardTitle>Financial Settings</CardTitle>
                        <CardDescription className="text-gray-400">Coming Soon</CardDescription>
                    </CardHeader>
                </Card>
            </div>

        </main>
    );
}
