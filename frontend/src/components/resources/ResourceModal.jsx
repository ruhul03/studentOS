import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { playSuccessSound, playErrorSound } from '../../utils/notificationSound';
import { ResourceFormFields } from './ResourceFormFields';
import { Share2, X, AlertCircle } from 'lucide-react';

export function ResourceModal({ isOpen, onClose, onResourceCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [type, setType] = useState('Notes');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resourceTypes = ['Notes', 'Exam Paper', 'Study Guide', 'Textbook', 'Link'];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCourseCode('');
    setCourseTitle('');
    setType('Notes');
    setFileUrl('');
    setSelectedFile(null);
    setIsAnonymous(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setError('You must be logged in to share resources'); return; }
    if (!title.trim()) { setError('Title is required'); return; }
    if (!courseCode.trim()) { setError('Course Code is required'); return; }
    if (!courseTitle.trim()) { setError('Course Title is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
    if (!selectedFile && !fileUrl.trim()) { setError('Provide a file or external URL'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      const resourceRequest = {
        title: title.trim(),
        description: description.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        courseTitle: courseTitle.trim(),
        fileUrl: fileUrl.trim(),
        type,
        uploaderId: Number(user?.id),
        anonymous: isAnonymous
      };

      console.log('Preparing to share resource:', resourceRequest);
      const formData = new FormData();
      formData.append('resource', new Blob([JSON.stringify(resourceRequest)], { type: 'application/json' }));
      if (selectedFile) {
        console.log('Attaching file:', selectedFile.name);
        formData.append('file', selectedFile);
      }

      const resp = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/resources`, {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errorBody = await resp.text();
        console.error('Resource upload failed:', resp.status, errorBody);
        throw new Error(errorBody || `Upload failed with status ${resp.status}`);
      }

      console.log('Resource shared successfully!');
      playSuccessSound();
      onResourceCreated?.();
      handleClose();
    } catch (err) {
      console.error('Submission error:', err);
      let msg = err.message || 'Something went wrong';
      try {
        const parsed = JSON.parse(msg);
        msg = parsed.message || (typeof parsed === 'object' ? Object.values(parsed).join(', ') : msg);
      } catch (e) {}
      playErrorSound();
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-surface-container-high border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden z-10"
          >
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <Share2 size={24} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-[0.2em] text-on-surface">Share Resource</h2>
              </div>
              <button onClick={handleClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-white/5 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-xs font-bold uppercase tracking-wider">
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              <ResourceFormFields 
                title={title} setTitle={setTitle}
                courseTitle={courseTitle} setCourseTitle={setCourseTitle}
                courseCode={courseCode} setCourseCode={setCourseCode}
                type={type} setType={setType}
                description={description} setDescription={setDescription}
                selectedFile={selectedFile} handleFileChange={handleFileChange}
                fileUrl={fileUrl} setFileUrl={setFileUrl}
                isAnonymous={isAnonymous} setIsAnonymous={setIsAnonymous}
                resourceTypes={resourceTypes}
              />

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:bg-white/5 transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] py-4 rounded-2xl bg-primary text-on-primary text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
                >
                  {isSubmitting ? 'Syncing...' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464554; }
      `}} />
    </AnimatePresence>
  );
}
