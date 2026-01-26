'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Search, UserCog, ShieldOff, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

export function StudentDirectory() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingActions, setLoadingActions] = useState<string[]>([]);
    const [userToConfirm, setUserToConfirm] = useState<{user: UserProfile, action: 'delete' | 'suspend'} | null>(null);


    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Query for all users, then filter client-side.
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: allUsers, isLoading } = useCollection<UserProfile>(usersQuery);

    const users = allUsers?.filter(user => user.userType === 'student' || user.userType === 'teacher') || [];
    
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleActionStart = (action: string, userId: string) => {
        setLoadingActions(prev => [...prev, `${action}-${userId}`]);
    };

    const handleActionEnd = (action: string, userId: string) => {
        setLoadingActions(prev => prev.filter(id => id !== `${action}-${userId}`));
    };
    
    const handleRoleChange = (user: UserProfile) => {
        if (!firestore) return;
        
        const newRole = user.userType === 'student' ? 'teacher' : 'student';
        handleActionStart('role', user.id);

        const userRef = doc(firestore, 'users', user.id);
        updateDocumentNonBlocking(userRef, { userType: newRole })
            .then(() => {
                toast({
                    title: 'Role Updated',
                    description: `${user.name}'s role has been changed to ${newRole}.`
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
                handleActionEnd('role', user.id);
            });
    };

    const handleSuspend = (user: UserProfile) => {
        if (!firestore) return;

        const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
        handleActionStart('suspend', user.id);
        
        const userRef = doc(firestore, 'users', user.id);
        updateDocumentNonBlocking(userRef, { status: newStatus })
            .then(() => {
                toast({
                    title: `User ${newStatus === 'active' ? 'Reactivated' : 'Suspended'}`,
                    description: `${user.name}'s account has been set to ${newStatus}.`,
                });
            })
            .catch(error => {
                console.error("Error updating status:", error);
                 toast({
                    title: 'Update Failed',
                    description: 'Could not update user status.',
                    variant: 'destructive'
                });
            })
            .finally(() => {
                handleActionEnd('suspend', user.id);
                setUserToConfirm(null);
            });
    }

    const handleDelete = (userId: string) => {
        if(!firestore) return;

        handleActionStart('delete', userId);

        const userRef = doc(firestore, 'users', userId);
        deleteDocumentNonBlocking(userRef)
            .then(() => {
                 toast({
                    title: 'User Deleted',
                    description: `User has been deleted successfully.`,
                 });
            })
            .catch(error => {
                console.error("Error deleting user:", error);
                toast({
                    title: 'Delete Failed',
                    description: 'Could not delete user.',
                    variant: 'destructive'
                });
            })
            .finally(() => {
                handleActionEnd('delete', userId);
                setUserToConfirm(null);
            });
    };

    const handleConfirmAction = () => {
        if (!userToConfirm) return;
        const { user, action } = userToConfirm;
        if (action === 'delete') {
            handleDelete(user.id);
        } else if (action === 'suspend') {
            handleSuspend(user);
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
                    <CardTitle>All Students & Teachers</CardTitle>
                    <CardDescription>Browse and manage all students and teachers on the platform.</CardDescription>
                     <div className="relative pt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full max-w-sm"
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
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {user.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{user.userType}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(user.status === 'suspended' ? 'text-orange-600 border-orange-300' : 'text-emerald-600 border-emerald-300')}>{user.status || 'active'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                           <div className="flex justify-end items-center gap-1">
                                                <Button variant="ghost" size="icon" className="hover:scale-110 cursor-pointer" onClick={() => handleRoleChange(user)} disabled={loadingActions.includes(`role-${user.id}`)}>
                                                    {loadingActions.includes(`role-${user.id}`) ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserCog className="h-4 w-4 text-sky-600" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="hover:scale-110 cursor-pointer" onClick={() => setUserToConfirm({user, action: 'suspend'})} disabled={loadingActions.includes(`suspend-${user.id}`)}>
                                                     {loadingActions.includes(`suspend-${user.id}`) ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldOff className="h-4 w-4 text-orange-600" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="hover:scale-110 cursor-pointer" onClick={() => setUserToConfirm({user, action: 'delete'})} disabled={loadingActions.includes(`delete-${user.id}`)}>
                                                     {loadingActions.includes(`delete-${user.id}`) ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-red-600" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!userToConfirm} onOpenChange={(isOpen) => !isOpen && setUserToConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           {userToConfirm?.action === 'delete' && `This will permanently delete the user '${userToConfirm.user.name}'. This action cannot be undone.`}
                           {userToConfirm?.action === 'suspend' && `This will ${userToConfirm.user.status === 'suspended' ? 'reactivate' : 'suspend'} the account for '${userToConfirm.user.name}'.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAction}
                            className={cn(buttonVariants({ variant: userToConfirm?.action === 'delete' ? 'destructive' : 'default' }))}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
