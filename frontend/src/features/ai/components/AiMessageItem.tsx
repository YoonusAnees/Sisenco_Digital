import React from 'react';
import { AiMessage, AiStructuredReport } from '../types/ai';
import { StructuredReportPreview } from './StructuredReportPreview';
import { Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AiMessageItemProps {
  message: AiMessage;
  onApplyReport?: (report: AiStructuredReport) => void;
}

export const AiMessageItem: React.FC<AiMessageItemProps> = ({
  message,
  onApplyReport,
}) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 text-xs leading-relaxed',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs',
          isUser
            ? 'bg-[#62242F] text-[#B7872A] border border-[#B7872A]/30'
            : 'bg-[#B7872A]/15 text-[#62242F] border border-[#B7872A]/30'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl p-3 shadow-xs',
          isUser
            ? 'bg-[#62242F] text-white rounded-tr-xs'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
        )}
      >
        {!isUser && message.operation && (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#B7872A] mb-1">
            <Bot className="w-3 h-3" />
            <span>{message.operation.replace(/_/g, ' ')}</span>
          </div>
        )}

        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

        {/* If this message has a structured report preview */}
        {message.structuredReport && (
          <StructuredReportPreview
            report={message.structuredReport}
            onApply={onApplyReport}
          />
        )}
      </div>
    </div>
  );
};