import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/constants/roles';
import { AiOperation } from '../types/ai';
import { Sparkles, FileText, ClipboardCheck, AlertTriangle, HelpCircle } from 'lucide-react';

interface SuggestedAction {
  label: string;
  operation: AiOperation;
  prompt: string;
  icon: React.ReactNode;
}

interface AiSuggestedActionsProps {
  onSelectAction: (operation: AiOperation, prompt: string) => void;
  disabled?: boolean;
}

export const AiSuggestedActions: React.FC<AiSuggestedActionsProps> = ({
  onSelectAction,
  disabled = false,
}) => {
  const { user } = useAuth();
  const role = user?.role || USER_ROLES.MEMBER;

  const actions: SuggestedAction[] = [
    {
      label: 'Improve writing',
      operation: 'improve_writing',
      prompt: 'Please improve the clarity and grammar of my draft report text while keeping the exact facts.',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#B7872A]" />,
    },
    {
      label: 'Organize notes',
      operation: 'structure_notes',
      prompt: 'Organize my rough notes into completed tasks, next week plans, blockers, and hours breakdown.',
      icon: <FileText className="w-3.5 h-3.5 text-blue-600" />,
    },
  ];

  if (role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN) {
    actions.push(
      {
        label: role === USER_ROLES.ADMIN ? 'Summarize all reports' : 'Summarize team reports',
        operation: 'summarize_reports',
        prompt: 'Summarize weekly progress, completed milestones, and hours breakdown for my projects this week.',
        icon: <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />,
      },
      {
        label: 'Show project blockers',
        operation: 'summarize_blockers',
        prompt: 'What are the current open blockers and impediments requiring management attention this week?',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
      }
    );
  }

  actions.push({
    label: 'Explain this page',
    operation: 'explain_system',
    prompt: 'How does this page work, and what are my permissions for weekly reports in this system?',
    icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />,
  });

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
        Suggested Actions
      </p>
      <div className="flex flex-wrap gap-1.5">
        {actions.map((act) => (
          <button
            key={act.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelectAction(act.operation, act.prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-[#B7872A] hover:bg-[#B7872A]/5 hover:text-[#62242F] transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {act.icon}
            <span>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};