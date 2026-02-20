'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useChatAssistant } from '../hooks';

const AUTH_PATHS = ['/login', '/register'];

export function ChatAssistant(): React.ReactElement | null {
  const pathname = usePathname();
  const {
    isOpen, messages, isTyping, characterState,
    toggleChat, closeChat, sendMessage, handleQuickAction, clearChat, setCharacterState, wakeUp
  } = useChatAssistant();

  const handleInputFocus = React.useCallback((): void => setCharacterState('listening'), [setCharacterState]);
  const handleInputBlur = React.useCallback((): void => { if (!isTyping) setCharacterState('idle'); }, [isTyping, setCharacterState]);

  // Hide on auth pages
  const isAuthPage = AUTH_PATHS.some(path => pathname.endsWith(path));
  if (isAuthPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {isOpen && (
          <ChatWindow
            messages={messages} isTyping={isTyping} characterState={characterState}
            onSendMessage={sendMessage} onQuickAction={handleQuickAction}
            onClose={closeChat} onClear={clearChat}
            onInputFocus={handleInputFocus} onInputBlur={handleInputBlur}
          />
        )}
      </AnimatePresence>
      <ChatButton onClick={toggleChat} characterState={isOpen ? 'happy' : characterState} onWakeUp={wakeUp} />
    </div>
  );
}
