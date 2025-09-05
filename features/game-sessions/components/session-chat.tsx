'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Dice6, Zap, Bot, User, Crown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { useSessionChat } from '../hooks/use-sessions'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatRelativeTime } from '@/shared/lib/utils'
import type { ChatMessage } from '../types'

interface SessionChatProps {
  sessionId: string
}

export function SessionChat({ sessionId }: SessionChatProps) {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'message' | 'action'>('message')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { messages, sendMessage, sendAction } = useSessionChat(sessionId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      if (messageType === 'action') {
        await sendAction(message.trim())
      } else {
        await sendMessage(message.trim())
      }
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-3">
        <h3 className="font-semibold">Session Chat</h3>
        <p className="text-xs text-muted-foreground">
          {messages.length} messages
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Welcome to the session! Start chatting to begin your adventure.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              isOwn={msg.userId === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Message Type Toggle */}
          <div className="flex space-x-1">
            <Button
              type="button"
              variant={messageType === 'message' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('message')}
            >
              <User className="mr-1 h-3 w-3" />
              Say
            </Button>
            <Button
              type="button"
              variant={messageType === 'action' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('action')}
            >
              <Zap className="mr-1 h-3 w-3" />
              Action
            </Button>
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                messageType === 'action' 
                  ? 'Describe your action...' 
                  : 'Type your message...'
              }
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {messageType === 'action' 
              ? 'Actions appear in italics and describe what your character does'
              : 'Press Enter to send, Shift+Enter for new line'
            }
          </p>
        </form>
      </div>
    </div>
  )
}

function ChatMessageItem({ 
  message, 
  isOwn 
}: { 
  message: ChatMessage
  isOwn: boolean 
}) {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'system':
        return <Bot className="h-4 w-4 text-blue-500" />
      case 'dice':
        return <Dice6 className="h-4 w-4 text-green-500" />
      case 'action':
        return <Zap className="h-4 w-4 text-purple-500" />
      case 'ai':
        return <Crown className="h-4 w-4 text-yellow-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getMessageStyle = () => {
    switch (message.type) {
      case 'system':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'dice':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'action':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'ai':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return isOwn 
          ? 'bg-primary text-primary-foreground ml-8' 
          : 'bg-muted mr-8'
    }
  }

  const userName = message.user 
    ? `${message.user.first_name} ${message.user.last_name}`.trim() || 'Unknown User'
    : 'System'

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 border ${getMessageStyle()}`}>
        {/* Message Header */}
        <div className="flex items-center space-x-2 mb-1">
          {getMessageIcon()}
          <span className="text-xs font-medium">{userName}</span>
          <span className="text-xs opacity-70">
            {formatRelativeTime(message.timestamp)}
          </span>
          {message.type !== 'message' && (
            <Badge variant="outline" className="text-xs">
              {message.type}
            </Badge>
          )}
        </div>

        {/* Message Content */}
        <div className={`text-sm ${message.type === 'action' ? 'italic' : ''}`}>
          {message.type === 'action' && '*'}
          {message.content}
          {message.type === 'action' && '*'}
        </div>

        {/* Dice Roll Metadata */}
        {message.type === 'dice' && message.metadata?.diceRoll && (
          <div className="mt-2 text-xs opacity-80">
            <div className="font-mono">
              {message.metadata.diceRoll.expression}
              {message.metadata.diceRoll.modifier !== 0 && 
                ` ${message.metadata.diceRoll.modifier >= 0 ? '+' : ''}${message.metadata.diceRoll.modifier}`
              }
            </div>
            {message.metadata.diceRoll.purpose && (
              <div className="text-xs mt-1">
                Purpose: {message.metadata.diceRoll.purpose}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

