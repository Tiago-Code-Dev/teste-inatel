import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAlertComments, useMentionableUsers, AlertComment } from '@/hooks/useAlertComments';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  AtSign,
  Smile,
  MoreVertical,
  Trash2,
  Reply,
  Loader2,
  MessageSquare,
  Wifi,
  WifiOff
} from 'lucide-react';

interface AlertCollaborationPanelProps {
  alertId: string;
  className?: string;
}

export function AlertCollaborationPanel({ alertId, className }: AlertCollaborationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const { 
    comments, 
    isLoading, 
    isSubscribed,
    createComment, 
    deleteComment,
    isCreating,
    isDeleting,
  } = useAlertComments(alertId);

  const { users: mentionableUsers } = useMentionableUsers();

  // Auto scroll to bottom on new comments
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  // Filter mentionable users based on search
  const filteredUsers = useMemo(() => {
    if (!mentionSearch) return mentionableUsers;
    return mentionableUsers.filter(u => 
      u.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  }, [mentionableUsers, mentionSearch]);

  // Handle message input with @ detection
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setMessage(value);
    setCursorPosition(position);

    // Check if user is typing a mention
    const textBeforeCursor = value.substring(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's no space after @ (still typing mention)
      if (!textAfterAt.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(textAfterAt);
        return;
      }
    }
    setShowMentions(false);
    setMentionSearch('');
  }, []);

  // Insert mention
  const insertMention = useCallback((user: { id: string; name: string }) => {
    const textBeforeCursor = message.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textBeforeAt = message.substring(0, lastAtIndex);
    const textAfterCursor = message.substring(cursorPosition);
    
    const mentionText = `@[${user.name}](${user.id}) `;
    const newMessage = textBeforeAt + mentionText + textAfterCursor;
    
    setMessage(newMessage);
    setShowMentions(false);
    setMentionSearch('');
    textareaRef.current?.focus();
  }, [message, cursorPosition]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!message.trim() || isCreating) return;

    // Extract mentions from message
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[2]); // User ID
    }

    try {
      await createComment({
        alert_id: alertId,
        content: message.trim(),
        mentions,
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [message, alertId, createComment, isCreating]);

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Format message content with mentions highlighted
  const formatContent = (content: string) => {
    // Replace mention patterns with styled spans
    return content.replace(
      /@\[([^\]]+)\]\(([^)]+)\)/g,
      '<span class="text-primary font-medium cursor-pointer hover:underline">@$1</span>'
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium text-sm">Colaboração</span>
          <Badge variant="secondary" className="text-xs">
            {comments.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {isSubscribed ? (
            <Wifi className="w-3.5 h-3.5 text-status-ok" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span className="text-[10px] text-muted-foreground">
            {isSubscribed ? 'Tempo real' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum comentário ainda</p>
            <p className="text-xs">Seja o primeiro a comentar</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((comment, index) => (
                <CommentBubble
                  key={comment.id}
                  comment={comment}
                  onDelete={() => deleteComment(comment.id)}
                  isDeleting={isDeleting}
                  formatContent={formatContent}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="p-3 border-t bg-muted/30">
        <div className="relative">
          {/* Mention suggestions */}
          <AnimatePresence>
            {showMentions && filteredUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10"
              >
                {filteredUsers.slice(0, 5).map(user => (
                  <button
                    key={user.id}
                    onClick={() => insertMention(user)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-muted transition-colors text-left"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      {user.email && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... Use @ para mencionar"
                className="min-h-[80px] max-h-[150px] pr-10 resize-none"
                disabled={isCreating}
              />
              <button
                onClick={() => setShowMentions(!showMentions)}
                className="absolute right-2 bottom-2 p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <AtSign className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                disabled
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!message.trim() || isCreating}
                className="h-8 w-8"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Comment bubble component
interface CommentBubbleProps {
  comment: AlertComment;
  onDelete: () => void;
  isDeleting: boolean;
  formatContent: (content: string) => string;
}

function CommentBubble({ comment, onDelete, isDeleting, formatContent }: CommentBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="group flex gap-3"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={comment.author?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {comment.author?.name?.substring(0, 2).toUpperCase() || '??'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {comment.author?.name || 'Usuário'}
          </span>
          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
        </div>
        
        <div 
          className="text-sm text-foreground/90 whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
        />

        {/* Attachment preview */}
        {comment.attachment_url && (
          <div className="mt-2">
            {comment.attachment_type?.startsWith('image') ? (
              <img 
                src={comment.attachment_url} 
                alt="Anexo"
                className="max-w-[200px] rounded-lg border"
              />
            ) : (
              <a 
                href={comment.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <Paperclip className="w-3 h-3" />
                Ver anexo
              </a>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-1">
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-status-critical hover:bg-status-critical/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </PopoverContent>
            </Popover>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
