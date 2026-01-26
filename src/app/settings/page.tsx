'use client';
import { useState } from 'react';
import { TeacherSidebar } from '@/components/teacher-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { toast } = useToast();
    const [schoolName, setSchoolName] = useState('BTK & KTS Education');
    const [address, setAddress] = useState('123 Education Lane, Yangon, Myanmar');
    const [contactNumber, setContactNumber] = useState('09-123-456-789');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
        <SidebarProvider defaultOpen={true}>
            <TeacherSidebar />
            <SidebarInset className="bg-gradient-to-br from-emerald-950 via-slate-950 to-blue-950 text-white">
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
            </SidebarInset>
        </SidebarProvider>
    );
}
