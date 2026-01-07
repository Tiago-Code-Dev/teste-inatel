import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Users, Trophy, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface TeamData {
  id: string;
  name: string;
  resolved: number;
  avgTime: number; // minutes
  slaCompliance: number; // percentage
}

interface TeamPerformanceTableProps {
  data: TeamData[];
  className?: string;
}

export function TeamPerformanceTable({ data, className }: TeamPerformanceTableProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" />
            Performance por Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Sem dados de equipes
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by resolved count for ranking
  const rankedData = [...data].sort((a, b) => b.resolved - a.resolved);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4" />
          Performance por Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rankedData.map((team, index) => {
          const isLeader = index === 0;
          const formatTime = (mins: number) => {
            if (mins < 60) return `${mins}min`;
            return `${Math.floor(mins / 60)}h ${mins % 60}m`;
          };

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                isLeader && 'bg-status-ok/5 border-status-ok/30'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isLeader && (
                    <Trophy className="w-4 h-4 text-status-ok" />
                  )}
                  <span className="font-medium">{team.name}</span>
                  {isLeader && (
                    <Badge className="bg-status-ok/15 text-status-ok text-[10px] h-5">
                      Líder
                    </Badge>
                  )}
                </div>
                <span className="text-lg font-bold">{team.resolved}</span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Average Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Tempo médio:</span>
                  <span className="font-medium">{formatTime(team.avgTime)}</span>
                </div>

                {/* SLA Compliance */}
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">SLA:</span>
                  <span className={cn(
                    'font-medium',
                    team.slaCompliance >= 90 ? 'text-status-ok' : 
                    team.slaCompliance >= 75 ? 'text-status-warning' : 
                    'text-status-critical'
                  )}>
                    {team.slaCompliance}%
                  </span>
                </div>
              </div>

              {/* SLA Progress bar */}
              <div className="mt-3">
                <Progress 
                  value={team.slaCompliance} 
                  className="h-1.5"
                />
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
