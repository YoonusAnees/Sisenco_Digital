import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { WeeklyReport, CreateReportPayload } from "@/types/report";
import { Project } from "@/types/project";
import {
  TASK_PRIORITIES,
  HOURS_CATEGORIES,
  HOURS_CATEGORY_LABELS,
} from "@/constants/reports";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/error";
import { useState } from "react";

/* ─── Zod sub-schemas ─── */
const completedTaskSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  project: z.string().min(1, "Project required"),
  hoursSpent: z.coerce.number().min(0).max(24),
});

const nextWeekTaskSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  project: z.string().min(1, "Project required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional().nullable(),
});

const blockerSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  project: z.string().min(1, "Project required"),
  impact: z.string().optional(),
  assistanceNeeded: z.string().optional(),
});

const achievementSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  project: z.string().optional().nullable(),
});

const hoursBreakdownSchema = z.object({
  project: z.string().min(1, "Project required"),
  category: z.enum([
    "development",
    "testing",
    "design",
    "meetings",
    "research",
    "documentation",
    "support",
    "other",
  ]),
  hours: z.coerce.number().min(0.25).max(24),
  notes: z.string().optional(),
});

const linkSchema = z.object({
  label: z.string().min(1, "Required"),
  url: z.string().url("Enter a valid URL"),
});

const reportFormSchema = z.object({
  weekStart: z.string().min(1, "Week start date is required"),
  summary: z.string().max(2000).optional(),
  completedTasks: z.array(completedTaskSchema),
  nextWeekTasks: z.array(nextWeekTaskSchema),
  blockers: z.array(blockerSchema),
  achievements: z.array(achievementSchema),
  hoursBreakdown: z.array(hoursBreakdownSchema),
  links: z.array(linkSchema),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

/* ─── Props ─── */
interface ReportEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: WeeklyReport | null;
  projects: Project[];
  onSubmit: (payload: CreateReportPayload) => Promise<void>;
}

/* ─── Collapsible section helper ─── */
const Section: React.FC<{
  title: string;
  count: number;
  children: React.ReactNode;
  accent?: string;
}> = ({ title, count, children, accent = "#62242F" }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span
            className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
            style={{ background: accent }}
          >
            {count}
          </span>
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
};

/* ─── Main component ─── */
export const ReportEditorModal: React.FC<ReportEditorModalProps> = ({
  isOpen,
  onClose,
  report,
  projects,
  onSubmit,
}) => {
  const isEdit = !!report;

  const projectOptions = [
    { value: "", label: "Select project..." },
    ...projects.map((p) => ({
      value: p._id || p.id,
      label: `${p.name} (${p.code})`,
    })),
  ];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      weekStart: "",
      summary: "",
      completedTasks: [],
      nextWeekTasks: [],
      blockers: [],
      achievements: [],
      hoursBreakdown: [],
      links: [],
    },
  });

  const completedTasksField = useFieldArray({
    control,
    name: "completedTasks",
  });
  const nextWeekTasksField = useFieldArray({ control, name: "nextWeekTasks" });
  const blockersField = useFieldArray({ control, name: "blockers" });
  const achievementsField = useFieldArray({ control, name: "achievements" });
  const hoursBreakdownField = useFieldArray({
    control,
    name: "hoursBreakdown",
  });
  const linksField = useFieldArray({ control, name: "links" });

  useEffect(() => {
    if (isOpen) {
      if (report) {
        const resolveProjectId = (val: unknown): string => {
          if (typeof val === "string") return val;
          if (val && typeof val === "object" && "_id" in val)
            return (val as { _id: string })._id;
          return "";
        };
        reset({
          weekStart: report.weekStart?.substring(0, 10) ?? "",
          summary: report.summary ?? "",
          completedTasks: (report.completedTasks ?? []).map((t) => ({
            ...t,
            project: resolveProjectId(t.project),
          })),
          nextWeekTasks: (report.nextWeekTasks ?? []).map((t) => ({
            ...t,
            project: resolveProjectId(t.project),
            dueDate: t.dueDate?.substring(0, 10) ?? null,
          })),
          blockers: (report.blockers ?? []).map((b) => ({
            ...b,
            project: resolveProjectId(b.project),
          })),
          achievements: (report.achievements ?? []).map((a) => ({
            ...a,
            project: a.project ? resolveProjectId(a.project) : null,
          })),
          hoursBreakdown: (report.hoursBreakdown ?? []).map((h) => ({
            ...h,
            project: resolveProjectId(h.project),
          })),
          links: report.links ?? [],
        });
      } else {
        reset({
          weekStart: "",
          summary: "",
          completedTasks: [],
          nextWeekTasks: [],
          blockers: [],
          achievements: [],
          hoursBreakdown: [],
          links: [],
        });
      }
    }
  }, [isOpen, report, reset]);

  const handleFormSubmit = async (data: ReportFormData) => {
    try {
      await onSubmit(data as CreateReportPayload);
      toast.success(isEdit ? "Report updated" : "Report created");
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to save report"));
    }
  };

  const priorityOptions = [
    { value: "", label: "No priority" },
    { value: TASK_PRIORITIES.LOW, label: "Low" },
    { value: TASK_PRIORITIES.MEDIUM, label: "Medium" },
    { value: TASK_PRIORITIES.HIGH, label: "High" },
    { value: TASK_PRIORITIES.URGENT, label: "Urgent" },
  ];

  const categoryOptions = Object.values(HOURS_CATEGORIES).map((c) => ({
    value: c,
    label: HOURS_CATEGORY_LABELS[c],
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Report" : "New Weekly Report"}
      maxWidth="2xl"
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-5 max-h-[75vh] overflow-y-auto pr-1"
      >
        {/* Week & Summary */}
        {projects.length === 0 && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <div className="text-xs">
              <p className="font-semibold">No projects assigned yet</p>
              <p className="text-amber-700 mt-0.5">
                You are not currently a member of any active project. Ask your manager or admin to add you to a project before creating a report.
              </p>
            </div>
          </div>
        )}

        {/* Week & Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Week Start Date"
            type="date"
            required
            error={errors.weekStart?.message}
            {...register("weekStart")}
          />
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Summary{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#62242F]/30 resize-none h-20"
              placeholder="Brief overview of the week..."
              {...register("summary")}
            />
          </div>
        </div>

        {/* Completed Tasks */}
        <Section
          title="Completed Tasks"
          count={completedTasksField.fields.length}
          accent="#62242F"
        >
          {completedTasksField.fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className="sm:col-span-4">
                <Input
                  placeholder="Task title *"
                  {...register(`completedTasks.${idx}.title`)}
                  error={(errors.completedTasks?.[idx] as any)?.title?.message}
                />
              </div>
              <div className="sm:col-span-4">
                <Select
                  options={projectOptions}
                  {...register(`completedTasks.${idx}.project`)}
                  error={
                    (errors.completedTasks?.[idx] as any)?.project?.message
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  label="Hrs Spent"
                  placeholder="e.g. 2.5"
                  step="0.5"
                  min="0"
                  max="24"
                  {...register(`completedTasks.${idx}.hoursSpent`)}
                  error={
                    (errors.completedTasks?.[idx] as any)?.hoursSpent?.message
                  }
                />
              </div>
              <div className="sm:col-span-2 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 w-full"
                  onClick={() => completedTasksField.remove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="sm:col-span-12">
                <Input
                  placeholder="Description (optional)"
                  {...register(`completedTasks.${idx}.description`)}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() =>
              completedTasksField.append({
                title: "",
                description: "",
                project: "",
                hoursSpent: 0,
              })
            }
          >
            Add Task
          </Button>
        </Section>

        {/* Next Week Tasks */}
        <Section
          title="Next Week Plan"
          count={nextWeekTasksField.fields.length}
          accent="#B7872A"
        >
          {nextWeekTasksField.fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className="sm:col-span-4">
                <Input
                  placeholder="Task title *"
                  {...register(`nextWeekTasks.${idx}.title`)}
                  error={(errors.nextWeekTasks?.[idx] as any)?.title?.message}
                />
              </div>
              <div className="sm:col-span-3">
                <Select
                  options={projectOptions}
                  {...register(`nextWeekTasks.${idx}.project`)}
                  error={(errors.nextWeekTasks?.[idx] as any)?.project?.message}
                />
              </div>
              <div className="sm:col-span-2">
                <Select
                  options={priorityOptions}
                  {...register(`nextWeekTasks.${idx}.priority`)}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="date"
                  {...register(`nextWeekTasks.${idx}.dueDate`)}
                />
              </div>
              <div className="sm:col-span-1 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => nextWeekTasksField.remove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() =>
              nextWeekTasksField.append({
                title: "",
                project: "",
                priority: "medium",
                dueDate: null,
              })
            }
          >
            Add Planned Task
          </Button>
        </Section>

        {/* Blockers */}
        <Section
          title="Blockers"
          count={blockersField.fields.length}
          accent="#DC2626"
        >
          {blockersField.fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-red-50 rounded-xl border border-red-100"
            >
              <div className="sm:col-span-5">
                <Input
                  placeholder="Blocker title *"
                  {...register(`blockers.${idx}.title`)}
                  error={(errors.blockers?.[idx] as any)?.title?.message}
                />
              </div>
              <div className="sm:col-span-5">
                <Select
                  options={projectOptions}
                  {...register(`blockers.${idx}.project`)}
                  error={(errors.blockers?.[idx] as any)?.project?.message}
                />
              </div>
              <div className="sm:col-span-2 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 w-full"
                  onClick={() => blockersField.remove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="sm:col-span-12">
                <Input
                  placeholder="Description *"
                  {...register(`blockers.${idx}.description`)}
                  error={(errors.blockers?.[idx] as any)?.description?.message}
                />
              </div>
              <div className="sm:col-span-6">
                <Input
                  placeholder="Impact..."
                  {...register(`blockers.${idx}.impact`)}
                />
              </div>
              <div className="sm:col-span-6">
                <Input
                  placeholder="Assistance needed..."
                  {...register(`blockers.${idx}.assistanceNeeded`)}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() =>
              blockersField.append({
                title: "",
                description: "",
                project: "",
                impact: "",
                assistanceNeeded: "",
              })
            }
          >
            Add Blocker
          </Button>
        </Section>

        {/* Achievements */}
        <Section
          title="Achievements"
          count={achievementsField.fields.length}
          accent="#059669"
        >
          {achievementsField.fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-green-50 rounded-xl border border-green-100"
            >
              <div className="sm:col-span-5">
                <Input
                  placeholder="Achievement title *"
                  {...register(`achievements.${idx}.title`)}
                  error={(errors.achievements?.[idx] as any)?.title?.message}
                />
              </div>
              <div className="sm:col-span-5">
                <Select
                  options={[
                    { value: "", label: "No project (general)" },
                    ...projectOptions.slice(1),
                  ]}
                  {...register(`achievements.${idx}.project`)}
                />
              </div>
              <div className="sm:col-span-2 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 w-full"
                  onClick={() => achievementsField.remove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="sm:col-span-12">
                <Input
                  placeholder="Description (optional)"
                  {...register(`achievements.${idx}.description`)}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() =>
              achievementsField.append({
                title: "",
                description: "",
                project: null,
              })
            }
          >
            Add Achievement
          </Button>
        </Section>

        {/* Hours Breakdown */}
        <Section
          title="Hours Breakdown"
          count={hoursBreakdownField.fields.length}
          accent="#7C3AED"
        >
          {hoursBreakdownField.fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-violet-50 rounded-xl border border-violet-100"
            >
              <div className="sm:col-span-4">
                <Select
                  options={projectOptions}
                  {...register(`hoursBreakdown.${idx}.project`)}
                  error={
                    (errors.hoursBreakdown?.[idx] as any)?.project?.message
                  }
                />
              </div>
              <div className="sm:col-span-3">
                <Select
                  options={categoryOptions}
                  {...register(`hoursBreakdown.${idx}.category`)}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  placeholder="Hrs"
                  step="0.5"
                  min="0.25"
                  {...register(`hoursBreakdown.${idx}.hours`)}
                  error={(errors.hoursBreakdown?.[idx] as any)?.hours?.message}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  placeholder="Notes..."
                  {...register(`hoursBreakdown.${idx}.notes`)}
                />
              </div>
              <div className="sm:col-span-1 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => hoursBreakdownField.remove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() =>
              hoursBreakdownField.append({
                project: "",
                category: "development",
                hours: 0,
                notes: "",
              })
            }
          >
            Add Hours Entry
          </Button>
        </Section>

        {/* Supporting Links */}
        <Section
          title="Supporting Links"
          count={linksField.fields.length}
          accent="#0891B2"
        >
          {linksField.fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2"
            >
              <div className="sm:col-span-3">
                <Input
                  placeholder="Label *"
                  {...register(`links.${idx}.label`)}
                  error={(errors.links?.[idx] as any)?.label?.message}
                />
              </div>
              <div className="sm:col-span-8">
                <Input
                  placeholder="https://..."
                  {...register(`links.${idx}.url`)}
                  error={(errors.links?.[idx] as any)?.url?.message}
                />
              </div>
              <div className="sm:col-span-1 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => linksField.remove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => linksField.append({ label: "", url: "" })}
          >
            Add Link
          </Button>
        </Section>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white pb-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? "Save Changes" : "Create Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
