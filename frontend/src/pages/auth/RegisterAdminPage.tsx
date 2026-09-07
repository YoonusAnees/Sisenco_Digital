import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { extractErrorMessage } from '@/utils/error';
import { ShieldCheck, FileText } from 'lucide-react';
import { toast } from 'sonner';

const registerAdminSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Valid email address required').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(128)
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  department: z.string().trim().max(100).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  adminSetupSecret: z.string().trim().optional(),
});

type RegisterAdminFormData = z.infer<typeof registerAdminSchema>;

export const RegisterAdminPage: React.FC = () => {
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAdminFormData>({
    resolver: zodResolver(registerAdminSchema),
  });

  const onSubmit = async (data: RegisterAdminFormData) => {
    setServerError(null);
    try {
      await registerAdmin(data);
      toast.success('Initial Admin registered successfully!');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err, 'Admin setup failed');
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F2] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#B7872A] text-white flex items-center justify-center mx-auto shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Initial Admin Setup</h1>
          <p className="text-xs text-slate-500">Configure the first system administrator account</p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Admin Name"
            placeholder="System Admin"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@sisenco.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            helperText="At least 8 chars, 1 uppercase, 1 lowercase, 1 number"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Admin Setup Secret (If configured on backend)"
            type="password"
            placeholder="Enter setup secret"
            helperText="Required if ADMIN_SETUP_SECRET environment variable is set on server"
            error={errors.adminSetupSecret?.message}
            {...register('adminSetupSecret')}
          />

          <Input
            label="Department (Optional)"
            placeholder="Executive"
            error={errors.department?.message}
            {...register('department')}
          />

          <Input
            label="Job Title (Optional)"
            placeholder="Chief Technology Officer"
            error={errors.jobTitle?.message}
            {...register('jobTitle')}
          />

          <Button
            type="submit"
            variant="gold"
            isLoading={isSubmitting}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            className="w-full mt-2"
          >
            Register Administrator
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already initialized?{' '}
          <Link to="/login" className="text-[#62242F] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
