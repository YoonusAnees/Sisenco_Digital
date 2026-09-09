import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Briefcase, Building2, Calendar, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/api/userApi";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { USER_ROLE_LABELS, UserRole } from "@/constants/roles";
import { formatDate } from "@/utils/date";
import { extractErrorMessage } from "@/utils/error";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  department: z.string().max(50).optional(),
  jobTitle: z.string().max(50).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      department: user?.department || "",
      jobTitle: user?.jobTitle || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userId = user.id || (user as { _id?: string })._id;
      if (!userId) throw new Error("User ID not found");

      await userApi.updateUser(userId, {
        name: values.name,
        department: values.department || undefined,
        jobTitle: values.jobTitle || undefined,
      });

      await refetchUser();
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel = user?.role
    ? USER_ROLE_LABELS[user.role as UserRole] || user.role
    : "Member";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Account Settings"
        description="Manage your personal profile and account preferences."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#62242F] text-white flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-[#F7EBEF]">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U"}
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-4">
            {user?.name}
          </h3>
          <p className="text-xs text-slate-500">{user?.email}</p>

          <div className="mt-3 flex gap-2">
            <Badge variant="primary">{roleLabel}</Badge>
            <Badge variant={user?.isActive ? "success" : "danger"}>
              {user?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="w-full border-t border-slate-100 my-5" />

          <div className="w-full space-y-3 text-left text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user?.department || "No department specified"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user?.jobTitle || "No job title specified"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Joined{" "}
                {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Personal Information
          </h3>



          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Full Name"
                error={errors.name?.message}
                {...register("name")}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Email address is managed by your administrator and cannot be
                changed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Department"
                  error={errors.department?.message}
                  {...register("department")}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div>
                <Input
                  label="Job Title"
                  error={errors.jobTitle?.message}
                  {...register("jobTitle")}
                  placeholder="e.g. Frontend Specialist"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!isDirty || isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
