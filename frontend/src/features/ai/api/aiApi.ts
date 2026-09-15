import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  AiChatPayload,
  AiChatResponseData,
  AiConversationSummary,
  AiConversationDetail,
} from '../types/ai';

export const aiApi = {
  async sendMessage(payload: AiChatPayload): Promise<AiChatResponseData> {
    const response = await apiClient.post<ApiResponse<AiChatResponseData>>(
      '/ai/chat',
      payload
    );
    return response.data.data!;
  },

  async getConversations(params: { page?: number; limit?: number } = {}): Promise<{
    conversations: AiConversationSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        conversations: AiConversationSummary[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/ai/conversations', { params });
    return response.data.data!;
  },

  async getConversationById(
    conversationId: string
  ): Promise<{ conversation: AiConversationDetail }> {
    const response = await apiClient.get<
      ApiResponse<{ conversation: AiConversationDetail }>
    >(`/ai/conversations/${conversationId}`);
    return response.data.data!;
  },

  async deleteConversation(conversationId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/ai/conversations/${conversationId}`
    );
    return response.data.data!;
  },
};