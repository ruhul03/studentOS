import { useState } from 'react';
import { motion } from 'framer-motion';

export function DeleteProfileModal({ isOpen, onClose, onDelete, isDeleting }) {
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setDeleteConfirmText('');
    onClose();
  };

  const handleDelete = async () => {
    if (deleteConfirmText === 'DELETE') {
      await onDelete();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="absolute inset-0 transition-opacity" onClick={handleClose}></div>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-surface rounded-xl border border-outline-variant w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden relative z-50"
      >
        {/* Content Area */}
        <div className="p-8 flex flex-col items-center text-center">
          {/* Prominent Warning Icon */}
          <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error/20 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-error text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          {/* Title & Message */}
          <h2 className="font-h2 text-h2 text-on-surface mb-2">Delete Account</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Are you absolutely sure? This action is permanent and cannot be undone.
          </p>
        </div>
        
        {/* Input Area */}
        <div className="px-8 pb-8 w-full">
          <label className="block font-body-sm text-body-sm text-on-surface-variant text-center mb-4" htmlFor="confirm-delete">
            To confirm, type <span className="font-bold text-on-surface">DELETE</span> below:
          </label>
          <div className="relative">
            <input 
              id="confirm-delete" 
              type="text" 
              placeholder="DELETE" 
              autoComplete="off"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-error focus:ring-1 focus:ring-error text-center placeholder-on-surface-variant/50 transition-colors" 
            />
          </div>
        </div>
        
        {/* Action Buttons Area */}
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex flex-col-reverse sm:flex-row gap-4 justify-end items-center">
          <button 
            disabled={isDeleting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-h3 text-h3 text-on-surface border border-outline-variant hover:bg-surface-container-high hover:border-outline focus:outline-none focus:ring-2 focus:ring-outline transition-all duration-200"
            onClick={handleClose}
          >
            Keep Account
          </button>
          <button 
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-h3 text-h3 bg-error text-on-error hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-surface shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${deleteConfirmText !== 'DELETE' || isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleDelete}
            disabled={deleteConfirmText !== 'DELETE' || isDeleting}
          >
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
