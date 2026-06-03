import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Workflow, ShoppingBag, MessageSquareQuote, Loader2, Search, X, ArrowRight, Frown } from 'lucide-react';

const CATEGORIES = {
  resource: { icon: FileText, color: 'text-primary', label: 'Resource' },
  service: { icon: Workflow, color: 'text-secondary', label: 'Service' },
  marketplace: { icon: ShoppingBag, color: 'text-tertiary', label: 'Market' },
  review: { icon: MessageSquareQuote, color: 'text-on-surface-variant', label: 'Review' }
};

export function GlobalSearch({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async (searchQuery) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setActiveIndex(-1);

    try {
      const endpoints = [
        { type: 'resource', url: `/api/resources?search=${encodeURIComponent(searchQuery)}` },
        { type: 'service', url: `/api/services?category=${encodeURIComponent(searchQuery)}` },
        { type: 'marketplace', url: `/api/marketplace?category=${encodeURIComponent(searchQuery)}` },
        { type: 'review', url: `/api/reviews?courseCode=${encodeURIComponent(searchQuery)}` }
      ];

      const responses = await Promise.all(
        endpoints.map(e => fetch(`${import.meta.env.VITE_API_URL}${e.url}`, { 
          signal: abortControllerRef.current.signal,
          headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
          .then(res => res.ok ? res.json().then(data => ({ data, type: e.type })) : null)
          .catch(() => null))
      );

      const formattedResults = [];
      responses.forEach(res => {
        if (!res) return;
        const { data, type } = res;
        
        data.forEach(item => {
          let title = '', subtitle = '';
          switch (type) {
            case 'resource':
              title = item.title;
              subtitle = `In ${item.courseCode}`;
              break;
            case 'service':
              if (!item.name.toLowerCase().includes(searchQuery.toLowerCase())) return;
              title = item.name;
              subtitle = item.location;
              break;
            case 'marketplace':
              if (!item.title.toLowerCase().includes(searchQuery.toLowerCase())) return;
              title = item.title;
              subtitle = `৳${item.price}`;
              break;
            case 'review':
              title = `${item.courseCode} Review`;
              subtitle = `Prof. ${item.professor}`;
              break;
          }
          formattedResults.push({ id: `${type}-${item.id}`, type, title, subtitle });
        });
      });

      setResults(formattedResults.slice(0, 8));
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) performSearch(query.trim());
      else setResults([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleNavigate = useCallback((type) => {
    setIsOpen(false);
    setQuery('');
    const routes = { resource: 'resources', service: 'services', marketplace: 'market', review: 'reviews' };
    onNavigate(routes[type] || 'home');
  }, [onNavigate]);

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleNavigate(results[activeIndex].type);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto lg:mx-0" ref={wrapperRef}>
      <div className={`group flex items-center bg-surface-container border rounded-2xl px-4 py-2.5 transition-all duration-500 ${
        isOpen ? 'border-primary ring-4 ring-primary/10 shadow-2xl bg-surface-container-high' : 'border-outline-variant hover:border-outline/50'
      }`}>
        <div className={`mr-3 transition-colors ${isOpen ? 'text-primary' : 'text-on-surface-variant'}`}>
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
        </div>
        <input
          type="text"
          placeholder="Search campus resources, services, reviews..."
          className="bg-transparent border-none text-on-surface w-full p-0 outline-none text-sm placeholder:text-on-surface-variant/40 focus:ring-0 font-medium"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => { if (query) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button 
            className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-surface-variant rounded-full transition-all cursor-pointer" 
            onClick={() => { setQuery(''); setResults([]); }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-[calc(100%+12px)] left-0 right-0 bg-surface-container-highest border border-outline-variant rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[1000] overflow-hidden"
          >
            {isLoading && results.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center gap-4 text-on-surface-variant">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Scanning UIU Network</span>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2.5 max-h-[440px] overflow-y-auto custom-scrollbar">
                <div className="px-3 py-2 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50">Top Results</span>
                </div>
                {results.map((result, idx) => (
                  <motion.div
                    key={result.id}
                    layout
                    className={`flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all group ${
                      idx === activeIndex ? 'bg-primary/10 border-primary/20' : 'hover:bg-surface-variant/50'
                    }`}
                    onClick={() => handleNavigate(result.type)}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container shadow-inner transition-transform group-hover:scale-110 ${CATEGORIES[result.type].color}`}>
                      {(() => {
                        const Icon = CATEGORIES[result.type].icon;
                        return <Icon size={20} className="fill-current opacity-20 absolute" />;
                      })()}
                      {(() => {
                        const Icon = CATEGORIES[result.type].icon;
                        return <Icon size={20} />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-on-surface truncate leading-none">{result.title}</h4>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 ${CATEGORIES[result.type].color}`}>
                          {CATEGORIES[result.type].label}
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant block truncate opacity-70 font-medium">{result.subtitle}</span>
                    </div>
                    <div className={`transition-all ${idx === activeIndex ? 'text-primary translate-x-0' : 'text-on-surface-variant/0 -translate-x-2 group-hover:text-on-surface-variant group-hover:translate-x-0'}`}>
                      <ArrowRight size={18} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : !isLoading && (
              <div className="p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-[2rem] bg-surface-container-high flex items-center justify-center text-outline-variant shadow-inner">
                  <Frown size={32} />
                </div>
                <div>
                  <p className="text-sm font-black text-on-surface mb-1 uppercase tracking-widest">No matches found</p>
                  <p className="text-xs text-on-surface-variant font-medium opacity-60">Try searching for courses, professors, or services</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
