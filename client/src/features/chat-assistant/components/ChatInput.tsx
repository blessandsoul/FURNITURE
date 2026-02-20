'use client';

import * as React from 'react';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function ChatInput({ onSend, disabled, onFocus, onBlur }: ChatInputProps): React.ReactElement {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-border bg-background">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="დაწერეთ შეტყობინება..."
        disabled={disabled}
        className="flex-1 text-sm"
      />
      <Button type="submit" size="icon" disabled={!value.trim() || disabled} className="shrink-0">
        <PaperPlaneRight className="w-4 h-4" />
      </Button>
    </form>
  );
}
