'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { PlantCharacter } from './PlantCharacter';
import type { ChatMessage as ChatMessageType, CharacterState } from '../types';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  characterState: CharacterState;
  onSendMessage: (message: string) => void;
  onQuickAction: (actionId: string, label: string) => void;
  onClose: () => void;
  onClear: () => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export function ChatWindow({
  messages, isTyping, characterState, onSendMessage, onQuickAction, onClose, onClear, onInputFocus, onInputBlur
}: ChatWindowProps): React.ReactElement {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];
  const showQuickActions = lastMessage?.showQuickActions && !isTyping;

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[70vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary to-[oklch(0.55_0.12_40)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
            <PlantCharacter state={characterState} size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground">Atlas ასისტენტი</h3>
            <p className="text-[10px] text-primary-foreground/70">ონლაინ</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClear}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            title="გასუფთავება"
          >
            <ArrowCounterClockwise className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="space-y-4">
          {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
          {showQuickActions && <QuickActions onAction={onQuickAction} />}
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isTyping} onFocus={onInputFocus} onBlur={onInputBlur} />
    </motion.div>
  );
}
