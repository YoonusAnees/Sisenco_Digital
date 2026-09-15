import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/aiApi';
import { AiChatPayload, AiMessage, AiOperation } from '../types/ai';
import { extractErrorMessage } from '@/utils/error';
import { toast } from 'sonner';

export const aiQueryKeys = {
  all: ['ai'] as const,
  conversations: () => ['ai', 'conversations'] as const,
  conversation: (id: string) => ['ai', 'conversation', id] as const,
};

export const useAiChat = (initialConversationId?: string) => {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [messages, setMessages] = useState<AiMessage[]>([]);

  // Load conversation details when an ID is selected
  const { isLoading: isLoadingConversation } = useQuery({
    queryKey: aiQueryKeys.conversation(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) return null;
      const data = await aiApi.getConversationById(conversationId);
      if (data?.conversation?.messages) {
        setMessages(data.conversation.messages);
      }
      return data.conversation;
    },
    enabled: !!conversationId,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: AiChatPayload) => aiApi.sendMessage(payload),
    onSuccess: (data) => {
      // Append user message if not already added
      const newAssistantMsg: AiMessage = {
        role: 'assistant',
        content: data.reply,
        operation: data.operation,
        structuredReport: data.structuredReport,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newAssistantMsg]);

      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }

      queryClient.invalidateQueries({ queryKey: aiQueryKeys.conversations() });
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'AI request failed');
      toast.error(msg);
    },
  });

  const sendMessage = useCallback(
    async (
      message: string,
      operation: AiOperation = 'chat',
      context?: AiChatPayload['context']
    ) => {
      if (!message.trim()) return;

      const userMsg: AiMessage = {
        role: 'user',
        content: message,
        operation,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);

      try {
        await sendMutation.mutateAsync({
          operation,
          message,
          conversationId,
          context,
        });
      } catch {
        // Error is surfaced via onError toast
      }
    },
    [conversationId, sendMutation]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
  }, []);

  const loadConversation = useCallback((id: string) => {
    setConversationId(id);
  }, []);

  return {
    messages,
    conversationId,
    sendMessage,
    clearChat,
    loadConversation,
    isLoading: sendMutation.isPending || isLoadingConversation,
    error: sendMutation.error,
  };
};

export const useAiConversations = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: aiQueryKeys.conversations(),
    queryFn: () => aiApi.getConversations({ limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => aiApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiQueryKeys.conversations() });
      toast.success('Conversation deleted');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to delete conversation'));
    },
  });

  return {
    conversations: data?.conversations || [],
    isLoading,
    refetch,
    deleteConversation: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};