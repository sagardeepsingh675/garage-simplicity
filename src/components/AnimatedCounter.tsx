
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  text: string;
  duration?: number;
  icon?: React.ReactNode;
}

export default function AnimatedCounter({ value, text, duration = 2, icon }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const totalDuration = duration * 1000; // Convert to ms
    const incrementTime = totalDuration / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    
    return () => {
      clearInterval(timer);
    };
  }, [value, duration]);

  return (
    <motion.div 
      className="bg-card p-6 rounded-lg shadow-md border flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {icon && <div className="text-primary mb-3 text-3xl">{icon}</div>}
      <div className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
        {count}+
      </div>
      <div className="text-center text-muted-foreground">{text}</div>
    </motion.div>
  );
}
