'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';

const SignUpSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
    verificationCode: z
      .string()
      .refine((val) => val.length === 6 || val.length === 0, {
        message: 'Verification code must be 6 digits',
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof SignUpSchema>;

export const StudioInvitationForm = ({
  token,
  studioId,
}: {
  token: string;
  studioId: string;
}) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { isLoaded, signUp, setActive } = useSignUp();

  const form = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
    },
    resolver: zodResolver(SignUpSchema),
  });

  if (!isLoaded) {
    return null;
  }

  console.log(form.formState);
  const onSubmit = async (data: SignUpFormData) => {
    setError('');
    setIsLoading(true);
    console.log('data', data);
    try {
      if (step === 1) {
        const result = await signUp.create({
          emailAddress: data.email,
          password: data.password,
        });

        if (result.status === 'complete') {
          await completeSignUp();
        } else {
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          });

          setStep(2);
        }
      } else if (step === 2) {
        if (!data.verificationCode && data.verificationCode !== '') {
          form.setError('verificationCode', {
            type: 'manual',
            message: 'Please enter your verification code',
          });
          console.error('Verification code is required');
          setIsLoading(false);
          return;
        }

        const verificationResult = await signUp.attemptEmailAddressVerification(
          {
            code: data.verificationCode ?? '',
          },
        );

        if (verificationResult.status === 'complete') {
          await completeSignUp();
        } else {
          form.setError('verificationCode', {
            type: 'manual',
            message: 'Verification failed. Please try again.',
          });
        }
      }
    } catch (err) {
      console.error('Error during sign-up:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignUp = async () => {
    const ROLE = 'band';
    try {
      await setActive({ session: signUp.createdSessionId });

      const response = await fetch('/api/setUserType', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: ROLE, token }),
      });

      if (response.ok) {
        router.push(`/studio/${studioId}`);
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      {...field}
                    />
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
