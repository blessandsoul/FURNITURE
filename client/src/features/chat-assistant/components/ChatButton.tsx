'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { PlantCharacter } from './PlantCharacter';
import type { CharacterState } from '../types';

interface ChatButtonProps {
  onClick: () => void;
  characterState: CharacterState;
  onWakeUp?: () => void;
}

export function ChatButton({ onClick, characterState, onWakeUp }: ChatButtonProps): React.ReactElement {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = (): void => {
    setIsHovered(true);
    if (characterState === 'sleeping' && onWakeUp) onWakeUp();
  };

  const displayState: CharacterState = characterState === 'sleeping' ? 'idle' : isHovered ? 'listening' : characterState;

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-16 h-16 rounded-full bg-transparent cursor-pointer flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      aria-label="ჩატ ასისტენტი"
    >
      <PlantCharacter state={displayState} size={52} />

      {/* Tooltip */}
      <motion.div
        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
        transition={{ duration: 0.2 }}
      >
        გამარჯობა
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
      </motion.div>
    </motion.button>
  );
}
