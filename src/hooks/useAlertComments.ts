import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AlertComment {
  id: string;
  alert_id: string;
  author_id: string;
  content: string;
  mentions: string[];
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface CreateCommentPayload {
  alert_id: string;
  content: string;
  mentions?: string[];
  attachment_url?: string;
  attachment_type?: string;
}

export function useAlertComments(alertId: string | null) {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch comments
  const { data: comments, isLoading, refetch } = useQuery({
    queryKey: ['alert-comments', alertId],
    queryFn: async () => {
      if (!alertId) return [];
      
      const { data, error } = await supabase
        .from('alert_comments')
        .select('*')
        .eq('alert_id', alertId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(data.map(c => c.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('user_id', authorIds);

      // Map profiles to comments
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(comment => ({
        ...comment,
        mentions: comment.mentions || [],
        author: profileMap.get(comment.author_id) || {
          id: comment.author_id,
          name: 'Usuário',
          email: null,
          avatar_url: null,
        },
      })) as AlertComment[];
    },
    enabled: !!alertId,
    staleTime: 5000,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!alertId) return;

    console.log('[Realtime] Setting up comments subscription for alert:', alertId);
    
    const channel = supabase
      .channel(`alert-comments-${alertId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alert_comments',
          filter: `alert_id=eq.${alertId}`,
        },
        (payload) => {
          console.log('[Realtime] Comment change:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['alert-comments', alertId] });
          
          if (payload.eventType === 'INSERT') {
            toast.info('Novo comentário adicionado');
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Comments subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('[Realtime] Cleaning up comments subscription');
      supabase.removeChannel(channel);
    };
  }, [alertId, queryClient]);

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (payload: CreateCommentPayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('alert_comments')
        .insert({
          alert_id: payload.alert_id,
          author_id: user.id,
          content: payload.content,
          mentions: payload.mentions || [],
          attachment_url: payload.attachment_url || null,
          attachment_type: payload.attachment_type || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-comments', alertId] });
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
      toast.error('Erro ao criar comentário');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('alert_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-comments', alertId] });
      toast.success('Comentário removido');
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast.error('Erro ao remover comentário');
    },
  });

  // Parse mentions from text
  const parseMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[2]); // User ID
    }
    return mentions;
  }, []);

  // Format content with mentions
  const formatContentWithMentions = useCallback((content: string, profiles: { id: string; name: string }[]) => {
    let formatted = content;
    profiles.forEach(profile => {
      const mentionPattern = `@[${profile.name}](${profile.id})`;
      const mentionDisplay = `<span class="text-primary font-medium">@${profile.name}</span>`;
      formatted = formatted.replace(mentionPattern, mentionDisplay);
    });
    return formatted;
  }, []);

  return {
    comments: comments || [],
    isLoading,
    isSubscribed,
    refetch,
    createComment: createCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    parseMentions,
    formatContentWithMentions,
  };
}

// Hook for fetching mentionable users
export function useMentionableUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['mentionable-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, name, email, avatar_url')
        .order('name');

      if (error) throw error;
      return data.map(p => ({
        id: p.user_id,
        name: p.name,
        email: p.email,
        avatar_url: p.avatar_url,
      }));
    },
    staleTime: 60000,
  });

  return { users: users || [], isLoading };
}
