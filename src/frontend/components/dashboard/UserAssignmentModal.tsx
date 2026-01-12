import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  User,
  Search,
  Loader2,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserOption {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar_url?: string;
}

interface UserAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (userId: string, userName: string) => Promise<void>;
  users: UserOption[];
  title?: string;
  description?: string;
  loading?: boolean;
}

export function UserAssignmentModal({
  open,
  onOpenChange,
  onAssign,
  users,
  title = 'Atribuir Responsável',
  description = 'Selecione o responsável para este item.',
  loading = false,
}: UserAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedUser) return;

    setIsAssigning(true);
    try {
      await onAssign(selectedUser.id, selectedUser.name);
      handleClose();
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSearchQuery('');
      setSelectedUser(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User List */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            <AnimatePresence>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: index * 0.03 }}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
                      'hover:bg-muted/50',
                      selectedUser?.id === user.id && 'bg-primary/10 border border-primary/30'
                    )}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                    {user.role && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full shrink-0">
                        {user.role}
                      </span>
                    )}
                    {selectedUser?.id === user.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </motion.button>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <User className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={!selectedUser || isAssigning || loading}
            onClick={handleAssign}
          >
            {isAssigning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Atribuir {selectedUser ? `a ${selectedUser.name}` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
