'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Users, Crown, Shield, UserPlus, UserMinus, Volume2, VolumeX } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'gm' | 'player';
  character?: string;
  isOnline: boolean;
  isMuted: boolean;
}

interface SessionParticipantsProps {
  sessionId: string;
}

export function SessionParticipants({ sessionId }: SessionParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Game Master',
      role: 'gm',
      isOnline: true,
      isMuted: false
    },
    {
      id: '2',
      name: 'Alice',
      role: 'player',
      character: 'Elara the Ranger',
      isOnline: true,
      isMuted: false
    },
    {
      id: '3',
      name: 'Bob',
      role: 'player',
      character: 'Thorin the Dwarf',
      isOnline: false,
      isMuted: false
    }
  ]);

  const toggleMute = (participantId: string) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
    ));
  };

  const removeParticipant = (participantId: string) => {
    setParticipants(participants.filter(p => p.id !== participantId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>
                    {participant.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                    participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{participant.name}</span>
                  {participant.role === 'gm' ? (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  ) : (
                    <Shield className="h-3 w-3 text-blue-500" />
                  )}
                  <Badge variant={participant.isOnline ? 'default' : 'secondary'} className="text-xs">
                    {participant.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                {participant.character && (
                  <p className="text-xs text-muted-foreground">
                    Playing: {participant.character}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMute(participant.id)}
                className="h-8 w-8 p-0"
              >
                {participant.isMuted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
              
              {participant.role !== 'gm' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParticipant(participant.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <UserMinus className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Player
        </Button>
      </CardContent>
    </Card>
  );
}

