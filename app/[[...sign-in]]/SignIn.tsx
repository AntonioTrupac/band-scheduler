'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useSignIn } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  userType: z.enum(['admin', 'band']),
});

type FormSchema = z.infer<typeof formSchema>;

export const SignIn = () => {
  const [error, setError] = useState('');
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const form = useForm<FormSchema>({
    defaultValues: {
      email: '',
      password: '',
      userType: 'admin',
    },
  });

  if (!isLoaded) {
    return null;
  }

  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    setError('');

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      console.log('result', result);
      if (result.status === 'complete') {
        console.log('result.createdSessionId', result.createdSessionId);
        await setActive({ session: result.createdSessionId });

        // set user type
        const response = await fetch('/api/set-user-type', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userType: data.userType }),
        });
        console.log('response', response);
        if (response.ok) {
          console.log('User type updated');
          router.push(
            data.userType === 'admin' ? '/studio/create' : '/band/settings',
          );
        } else {
          console.error('Error updating user type');
          setError('Error updating user type');
        }
      } else {
        setError('Sign in failed. Please check your email and password.');
      }
    } catch (err) {
      console.error('Error signing in', err);
      setError('Error signing in');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="admin" />
                    </FormControl>
                    <FormLabel className="font-normal">Studio Owner</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="bandMember" />
                    </FormControl>
                    <FormLabel className="font-normal">Band Member</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-6 w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
};
