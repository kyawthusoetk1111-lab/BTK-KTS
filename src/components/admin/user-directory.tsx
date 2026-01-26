'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Trash2, ShieldOff, Search, Loader2, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { UserDetailView } from './user-detail-view';
import { cn } from '@/lib/utils';


export function UserDirectory() {
    const firestore = useFirestore();
    const { user: currentUser } = useUser();
    const { toast } = useToast();
    const [userToManage, setUserToManage] = useState<{user: UserProfile, action: 'delete' | 'suspend'} | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailedUser, setDetailedUser] = useState<UserProfile | null>(null);
    const [loadingActions, setLoadingActions] = useState<string[]>([]);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

    const filteredUsers = users?.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleRoleChange = (userId: string, newRole: 'admin' | 'teacher' | 'student') => {
        if (!firestore) return;
        const actionKey = `role-${userId}`;
        setLoadingActions(prev => [...prev, actionKey]);

        const userRef = doc(firestore, 'users', userId);
        updateDocumentNonBlocking(userRef, { userType: newRole })
            .then(() => {
                toast({
                    title: 'Role Updated',
                    description: `User role has been changed to ${newRole}.`
                });
            })
            .catch((error) => {
                console.error("Error updating role:", error);
                toast({
                    title: 'Update Failed',
                    description: 'Could not update user role.',
                    variant: 'destructive'
                });
            })
            .finally(() => {
                setLoadingActions(prev => prev.filter(id => id !== actionKey));
            });
    };

    const handleConfirmAction = () => {
        if (!firestore || !userToManage) return;
        const { user, action } = userToManage;
        const actionKey = `${action}-${user.id}`;
        
        setLoadingActions(prev => [...prev, actionKey]);
        setUserToManage(null);

        if (action === 'delete') {
            const userRef = doc(firestore, 'users', user.id);
            deleteDocumentNonBlocking(userRef)
                .then(() => {
                     toast({
                        title: 'User Deleted',
                        description: `${user.name} has been deleted.`,
                        variant: 'destructive'
                    });
                })
                .catch(error => console.error("Error deleting user:", error))
                .finally(() => {
                    setLoadingActions(prev => prev.filter(id => id !== actionKey));
                });
        } else if (action === 'suspend') {
            const userRef = doc(firestore, 'users', user.id);
            const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
            updateDocumentNonBlocking(userRef, { status: newStatus })
                .then(() => {
                    toast({
                        title: `User ${newStatus === 'active' ? 'Reactivated' : 'Suspended'}`,
                        description: `${user.name}'s account has been ${newStatus}.`,
                    });
                })
                .catch(error => console.error("Error suspending user:", error))
                .finally(() => {
                    setLoadingActions(prev => prev.filter(id => id !== actionKey));
                });
        }
    };
    
    const getRoleBadgeVariant = (role: 'admin' | 'teacher' | 'student') => {
        switch (role) {
            case 'admin': return 'admin';
            case 'teacher': return 'secondary';
            default: return 'outline';
        }
    }


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage all user accounts on the platform.</CardDescription>
                     <div className="relative pt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white w-full max-w-sm"
                        />
                   </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Enrolled</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                                    const isCurrentUser = user.id === currentUser?.uid;
                                    return (
                                    <TableRow key={user.id} onClick={() => setDetailedUser(user)} className="cursor-pointer">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {user.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(user.userType)} className="capitalize">{user.userType}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'suspended' ? 'destructive' : 'default'} className={cn(user.status !== 'suspended' && 'bg-emerald-100 text-emerald-800')}>{user.status || 'active'}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                           <div className="flex justify-end items-center space-x-1">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={isCurrentUser || loadingActions.includes(`role-${user.id}`)}>
                                                            {loadingActions.includes(`role-${user.id}`) ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserPlus className="h-4 w-4" />}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                                        <DropdownMenuRadioGroup value={user.userType} onValueChange={(newRole: 'admin' | 'teacher' | 'student') => handleRoleChange(user.id, newRole)}>
                                                            <DropdownMenuRadioItem value="student">Student</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="teacher">Teacher</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Button variant="ghost" size="icon" disabled={isCurrentUser || loadingActions.includes(`suspend-${user.id}`)} onClick={() => setUserToManage({user, action: 'suspend'})}>
                                                    {loadingActions.includes(`suspend-${user.id}`) ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldOff className="h-4 w-4 text-orange-600" />}
                                                </Button>

                                                <Button variant="ghost" size="icon" disabled={isCurrentUser || loadingActions.includes(`delete-${user.id}`)} onClick={() => setUserToManage({user, action: 'delete'})}>
                                                    {loadingActions.includes(`delete-${user.id}`) ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No users found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!userToManage} onOpenChange={(isOpen) => !isOpen && setUserToManage(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           {userToManage?.action === 'delete' && `This will permanently delete the user profile for '${userToManage.user.name}'. This action cannot be undone.`}
                           {userToManage?.action === 'suspend' && `This will ${userToManage.user.status === 'suspended' ? 'reactivate' : 'suspend'} the account for '${userToManage.user.name}'. Suspended users cannot log in.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAction}
                            className={buttonVariants({ variant: userToManage?.action === 'delete' ? 'destructive' : 'default' })}
                        >
                            {userToManage?.action === 'delete' ? 'Delete User' : userToManage?.user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Sheet open={!!detailedUser} onOpenChange={(isOpen) => !isOpen && setDetailedUser(null)}>
                <SheetContent className="w-full max-w-2xl sm:max-w-2xl p-0">
                   {detailedUser && <UserDetailView user={detailedUser} />}
                </SheetContent>
            </Sheet>
        </>
    );
}
