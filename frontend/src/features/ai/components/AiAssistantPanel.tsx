import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAiChat, useAiConversations } from '../hooks/useAiAssistant';
import { AiMessageItem } from './AiMessageItem';
import { AiSuggestedActions } from './AiSuggestedActions';
import { AiOperation, AiStructuredReport } from '../types/ai';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  History,
  RotateCcw,
  Loader2,
  Bot,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyReport?: (report: AiStructuredReport) => void;
  activeProjectId?: string;
  activeReportId?: string;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  isOpen,
  onClose,
  onApplyReport,
  activeProjectId,
  activeReportId,
}) => {
  const location = useLocation();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<AiOperation>('chat');
  const [showHistory, setShowHistory] = useState(false);

  const {
    messages,
    sendMessage,
    clearChat,
    loadConversation,
    isLoading,
  } = useAiChat();

  const {
    conversations,
    isLoading: isHistoryLoading,
    deleteConversation,
    isDeleting,
  } = useAiConversations();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !showHistory) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, showHistory]);

  const handleSend = async (op?: AiOperation, msgOverride?: string) => {
    const textToSend = (msgOverride || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const operation = op || selectedOperation;

    setInputMessage('');
    setSelectedOperation('chat');

    await sendMessage(textToSend, operation, {
      page: location.pathname,
      projectId: activeProjectId,
      reportId: activeReportId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedAction = (operation: AiOperation, prompt: string) => {
    handleSend(operation, prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="relative w-full max-w-md bg-[#F8F6F2] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-[#B7872A]/30">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2A171A] text-white border-b border-[#3D2327]">
          <div className="flex items-center gap-2.5 min-w-0">
            {showHistory ? (
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
                aria-label="Back to chat"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#62242F] text-[#B7872A] border border-[#B7872A]/40 flex items-center justify-center shadow-inner shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                <span>{showHistory ? 'Saved Chats' : 'Report Assistant'}</span>
                <span className="text-[10px] font-semibold bg-[#B7872A]/20 text-[#B7872A] px-1.5 py-0.2 rounded">
                  AI
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                {showHistory
                  ? 'Your past conversations'
                  : 'Role-aware weekly reporting co-pilot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!showHistory && (
              <>
                <button
                  type="button"
                  title="View chat history"
                  onClick={() => setShowHistory(true)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <History className="w-4 h-4" />
                </button>
                {messages.length > 0 && (
                  <button
                    type="button"
                    title="Clear current chat"
                    onClick={clearChat}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {showHistory ? (
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Recent Conversations ({conversations.length})
            </p>
            {isHistoryLoading && (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading history...
              </div>
            )}
            {!isHistoryLoading && conversations.length === 0 && (
              <div className="text-center py-12 text-xs text-slate-400">
                No saved conversations yet.
              </div>
            )}
            {!isHistoryLoading &&
              conversations.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-[#B7872A] transition-all group shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      loadConversation(c.id);
                      setShowHistory(false);
                    }}
                    className="flex-1 text-left min-w-0 pr-2"
                  >
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#62242F]">
                      {c.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {c.messageCount} messages · {new Date(c.lastActivityAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => deleteConversation(c.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="py-8 px-2 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#62242F]/10 text-[#62242F] flex items-center justify-center mx-auto shadow-inner">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Weekly Report Assistant
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                      I can help you write your weekly report, organize rough notes into compliant sections, summarize team progress, or explain platform rules.
                    </p>
                  </div>
                  <div className="pt-2 text-left">
                    <AiSuggestedActions
                      onSelectAction={handleSuggestedAction}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <AiMessageItem
                      key={i}
                      message={m}
                      onApplyReport={onApplyReport}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs max-w-[80%] text-xs text-slate-500 shadow-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#62242F]" />
                      <span>Thinking and preparing report response...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Suggested Actions pill bar if messages exist */}
            {messages.length > 0 && (
              <div className="px-4 py-2 border-t border-slate-200 bg-white/50">
                <AiSuggestedActions
                  onSelectAction={handleSuggestedAction}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Input Box */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="relative border border-slate-300 rounded-xl focus-within:border-[#62242F] focus-within:ring-2 focus-within:ring-[#62242F]/20 transition-all bg-slate-50">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question or paste rough report notes..."
                  rows={2}
                  maxLength={10000}
                  disabled={isLoading}
                  className="w-full p-2.5 text-xs text-slate-900 bg-transparent resize-none focus:outline-none placeholder:text-slate-400"
                />
                <div className="flex items-center justify-between px-2.5 pb-2">
                  <span className="text-[10px] text-slate-400">
                    {inputMessage.length > 0 ? `${inputMessage.length}/10,000` : 'Shift+Enter for newline'}
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!inputMessage.trim() || isLoading}
                    onClick={() => handleSend()}
                    className="h-7 w-7 p-0 rounded-lg bg-[#62242F] hover:bg-[#48282D] text-white shrink-0 flex items-center justify-center"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};