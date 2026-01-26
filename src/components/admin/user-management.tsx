'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { subjects } from '@/lib/subjects';


const userManagementSchema = z.object({
  userType: z.enum(['student', 'teacher']).default('student'),
  name: z.string().min(3, 'Full name must be at least 3 characters.'),
  studentId: z.string().min(3, 'User ID must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  // student fields
  grade: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  // teacher fields
  subject: z.string().optional(),
}).refine(data => {
    if (data.userType === 'teacher') {
        return !!data.subject;
    }
    return true;
}, {
    message: "Subject is required for teachers.",
    path: ["subject"],
});


type UserFormValues = z.infer<typeof userManagementSchema>;

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const auth = useAuth();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userManagementSchema),
    defaultValues: {
      userType: 'student',
      name: '',
      studentId: '',
      grade: '',
      gender: 'male',
      phone: '',
      password: 'password123',
      subject: '',
    },
  });

  const userType = form.watch('userType');

  const onSubmit = async (data: UserFormValues) => {
    setIsSaving(true);
    if (!firestore || !auth) {
        toast({ title: "Error", description: "Services not available.", variant: "destructive" });
        setIsSaving(false);
        return;
    }
    
    try {
        const email = `${data.studentId.trim()}@btk-exam.com`;
        
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
        const user = userCredential.user;

        // 2. Create user profile in Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        
        const newUserProfile: Omit<UserProfile, 'badges' | 'adminNotes' | 'accountTier'> = {
            id: user.uid,
            name: data.name,
            studentId: data.studentId,
            email: email,
            userType: data.userType,
            isFirstLogin: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            phone: data.phone,
            ...(data.userType === 'student' && { grade: data.grade, gender: data.gender }),
            ...(data.userType === 'teacher' && { subject: data.subject }),
        };

        await setDoc(userDocRef, newUserProfile);

        toast({
            title: "User Created Successfully!",
            description: `The profile for ${data.name} has been created.`,
        });

        onClose();
        form.reset();

    } catch (error: any) {
        console.error("Error creating user:", error);
        let description = "Could not create the user profile. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
            description = `A user with the ID '${data.studentId}' already exists.`;
        } else if (error.code === 'auth/weak-password') {
            description = 'The password is too weak. It must be at least 6 characters long.';
        }
        toast({
            title: "Save Failed",
            description: description,
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset();
      }
      onClose();
    }}>
      <DialogContent className="sm:max-w-md transition-all">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the details for the new user. They will be prompted to change their password on first login.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Aung Aung" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{userType === 'teacher' ? 'Teacher ID' : 'Student ID'}</FormLabel>
                  <FormControl>
                    <Input placeholder={userType === 'teacher' ? 'e.g., TCH-001' : 'e.g., STU-001'} {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Password</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />

            {userType === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade/Class</FormLabel>
                        <Input placeholder="e.g., Grade 10" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <Input placeholder="e.g., 09xxxxxxxxx" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </>
            )}

            {userType === 'teacher' && (
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                       </FormControl>
                       <SelectContent>
                          {subjects.filter(s => s !== 'Global').map(subject => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => { form.reset(); onClose(); }}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Save User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
