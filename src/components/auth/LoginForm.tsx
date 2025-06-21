'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AuthService } from '@/lib/auth';
import { useAuthStore } from '@/lib/store';
import { validateEmail } from '@/lib/utils';
import { LoginForm as LoginFormType } from '@/types';

export default function LoginForm() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginFormType>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormType>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormType> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const { user } = await AuthService.signIn(formData);
      
      if (user) {
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        router.push('/dashboard');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message || 'An error occurred during login');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormType) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="h-6 w-6 text-blue-600 font-bold text-xl">S</div>
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Welcome to SOLACE
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to access your social work dashboard
        </p>
      </div>

      {/* Form */}
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            placeholder="Enter your email"
            leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
            fullWidth
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            placeholder="Enter your password"
            leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
            fullWidth
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          fullWidth
          size="lg"
        >
          Sign In
        </Button>

        {/* Demo credentials note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Demo Access:</p>
              <p>Email: demo@solace.app</p>
              <p>Password: demo123</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 