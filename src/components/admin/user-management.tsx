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


const studentSchema = z.object({
  name: z.string().min(3, 'Full name must be at least 3 characters.'),
  studentId: z.string().min(3, 'Student ID must be at least 3 characters.'),
  grade: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const auth = useAuth();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      studentId: '',
      grade: '',
      gender: 'male',
      phone: '',
      password: 'password123',
    },
  });

  const onSubmit = async (data: StudentFormValues) => {
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
        const newUserProfile: Omit<UserProfile, 'badges' | 'adminNotes'> = {
            id: user.uid,
            name: data.name,
            studentId: data.studentId,
            email: email,
            userType: 'student',
            isFirstLogin: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            grade: data.grade,
            gender: data.gender,
            phone: data.phone,
        };

        await setDoc(userDocRef, newUserProfile);

        toast({
            title: "Student Created Successfully!",
            description: `The profile for ${data.name} has been created.`,
        });

        onClose();
        form.reset();

    } catch (error: any) {
        console.error("Error creating student:", error);
        let description = "Could not create the student profile. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
            description = `A user with the Student ID '${data.studentId}' already exists.`;
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
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the details for the new student. They will be prompted to change their password on first login.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., STU-001" {...field} />
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
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => { form.reset(); onClose(); }}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Save Student
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
