export function ResourceFormFields({
  title, setTitle,
  courseTitle, setCourseTitle,
  courseCode, setCourseCode,
  type, setType,
  description, setDescription,
  selectedFile, handleFileChange,
  fileUrl, setFileUrl,
  isAnonymous, setIsAnonymous,
  resourceTypes
}) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Resource Title *</label>
        <input 
          className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all"
          placeholder="e.g., Operating Systems Final Notes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Course Title *</label>
        <input 
          className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all"
          placeholder="e.g., Data Structures and Algorithms"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Course Code *</label>
          <input 
            className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all uppercase"
            placeholder="CSE 303"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Resource Type</label>
          <select 
            className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {resourceTypes.map(t => <option key={t} value={t} className="bg-surface-container-high">{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Description *</label>
        <textarea 
          className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all h-24 resize-none"
          placeholder="Briefly describe what this resource contains..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">File Attachment</label>
          <div className="relative">
            <input type="file" id="resource-file" onChange={handleFileChange} className="hidden" />
            <label 
              htmlFor="resource-file" 
              className={`flex items-center gap-4 p-4 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${selectedFile ? 'border-primary/40 bg-primary/5' : 'border-white/5 hover:border-primary/20 bg-surface/50'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedFile ? 'bg-primary text-on-primary' : 'bg-white/5 text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[20px]">{selectedFile ? 'check_circle' : 'upload_file'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-on-surface truncate">
                  {selectedFile ? selectedFile.name : 'Choose local file...'}
                </p>
                {!selectedFile && <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30">Maximum size: 50MB</p>}
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Or Cloud URL</label>
          <input 
            className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all"
            placeholder="https://drive.google.com/..."
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-5">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="sr-only peer" />
            <div className="w-full h-full bg-white/10 rounded-full peer-checked:bg-primary transition-colors"></div>
            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-on-surface transition-colors">Share Anonymously</span>
        </label>
      </div>
    </>
  );
}
