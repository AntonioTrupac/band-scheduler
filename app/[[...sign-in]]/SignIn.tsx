'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

type FormSchema = z.infer<typeof formSchema>;

export const SignIn = () => {
  const [error, setError] = useState('');
  const { isLoaded, signIn, setActive } = useSignIn();
  const form = useForm<FormSchema>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    setError('');

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
        actionCompleteRedirectUrl: '/studio',
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/studio');
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

        <Button type="submit" className="mt-6 w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
};
