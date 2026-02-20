'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { PlantCharacter } from './PlantCharacter';

export function TypingIndicator(): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-2 items-center"
    >
      <div className="w-8 h-8 rounded-full bg-primary-foreground flex-shrink-0 flex items-center justify-center border border-border overflow-hidden">
        <PlantCharacter state="thinking" size={24} />
      </div>

      <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
