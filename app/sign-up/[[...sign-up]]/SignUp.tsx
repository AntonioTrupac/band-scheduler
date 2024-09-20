'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignUp } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useRouter } from 'next/navigation';
import React from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  userType: z.enum(['admin', 'band'], {
    required_error: 'Please select a user type',
  }),
  verificationCode: z
    .string()
    .length(6, { message: 'Verification code must be 6 digits' })
    .optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export const SignUp = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { isLoaded, signUp, setActive } = useSignUp();
  const form = useForm<FormSchema>({
    defaultValues: {
      email: '',
      password: '',
      userType: undefined,
      verificationCode: '',
    },
    resolver: zodResolver(formSchema),
  });

  if (!isLoaded) {
    return null;
  }

  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    setError('');
    setIsLoading(true);

    try {
      if (step === 1) {
        const result = await signUp.create({
          emailAddress: data.email,
          password: data.password,
        });

        if (result.status === 'complete') {
          await completeSignUp(data.userType);
        } else {
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          });

          setStep(2);
        }
      } else if (step === 2) {
        if (!data.verificationCode && data.verificationCode !== '') {
          setError('Please enter your verification code');
          console.error('Verification code is required');
        }

        const verificationResult = await signUp.attemptEmailAddressVerification(
          {
            code: data.verificationCode ?? '',
          },
        );

        if (verificationResult.status === 'complete') {
          await completeSignUp(data.userType);
        } else {
          setError('Verification failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error during sign-up:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignUp = async (userType: string) => {
    try {
      await setActive({ session: signUp.createdSessionId });

      const response = await fetch('/api/set-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType }),
      });

      if (response.ok) {
        console.log('User type updated');
        router.push(userType === 'admin' ? '/studio/create' : '/band/settings');
      } else {
        console.error('Error updating user type');
        setError('Error updating user type');
      }
    } catch (err) {
      console.error('Error completing sign-up:', err);
      setError('An error occurred while completing sign-up. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {step === 1 && (
          <>
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
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="admin" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Studio Owner
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="band" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Band Member
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {step === 2 && (
          <FormField
            control={form.control}
            name="verificationCode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} className="w-full" {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {error && <p className="text-red-500">{error}</p>}

        <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
          {isLoading
            ? 'Processing...'
            : step === 1
              ? 'Continue'
              : 'Verify and Sign Up'}
        </Button>
      </form>
    </Form>
  );
};
