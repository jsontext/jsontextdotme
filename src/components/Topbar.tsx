import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <nav className="absolute top-0 left-0 w-full p-4 flex items-center justify-start z-50">
      <motion.button
        onClick={() => navigate('/')}
        className="flex items-center text-black cursor-pointer"
        whileHover="hover"
      >
        <ArrowLeft size={24} />
        <motion.div
          variants={{ hover: { width: 30, opacity: 1 } }}
          initial={{ width: 0, opacity: 0 }}
          className="h-0.5 bg-black"
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.button>
    </nav>
  );
}
