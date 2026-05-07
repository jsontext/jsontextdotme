import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full h-full flex flex-col items-center justify-center bg-white p-8 relative"
    >
      <h1 className="text-4xl font-bold mb-4">Contact</h1>
    </motion.div>
  );
}
