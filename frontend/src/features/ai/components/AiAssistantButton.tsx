import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AiAssistantButtonProps {
  onClick: () => void;
  hasActivity?: boolean;
  className?: string;
}

export const AiAssistantButton: React.FC<AiAssistantButtonProps> = ({
  onClick,
  hasActivity = false,
  className,
}) => {
  return (
    <button
      id="ai-assistant-fab"
      type="button"
      onClick={onClick}
      aria-label="Open AI Assistant"
      className={cn(
        'fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-40',
        'w-13 h-13 rounded-2xl shadow-lg',
        'bg-gradient-to-br from-[#62242F] to-[#8B2E3D]',
        'text-white border border-[#B7872A]/30',
        'flex items-center justify-center',
        'hover:from-[#8B2E3D] hover:to-[#62242F] hover:shadow-xl hover:scale-105',
        'active:scale-95',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B7872A] focus-visible:ring-offset-2',
        className
      )}
    >
      <Sparkles className="w-5 h-5" />

      {/* Activity pulse indicator */}
      {hasActivity && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B7872A] opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#B7872A] border-2 border-white" />
        </span>
      )}
    </button>
  );
};
