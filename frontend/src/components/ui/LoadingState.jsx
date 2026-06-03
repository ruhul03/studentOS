import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingState = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClasses = fullScreen 
    ? "min-h-screen flex flex-col items-center justify-center p-8 bg-background text-on-surface" 
    : "flex flex-col items-center justify-center p-8 w-full h-full min-h-[200px]";

  return (
    <div className={containerClasses}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="w-10 h-10 text-primary mb-4" />
      </motion.div>
      <p className="text-on-surface-variant text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;

