import { useState, useEffect, useRef } from 'react';

export function GlobalSearch({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setIsLoading(true);
    try {
      const [resourcesRes, servicesRes, marketRes, reviewsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/resources?search=${encodeURIComponent(searchQuery)}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/services?category=${encodeURIComponent(searchQuery)}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/marketplace?category=${encodeURIComponent(searchQuery)}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/reviews?courseCode=${encodeURIComponent(searchQuery)}`)
      ]);

      const formattedResults = [];

      if (resourcesRes.ok) {
        const resources = await resourcesRes.json();
        resources.forEach((r) => formattedResults.push({
          id: `res-${r.id}`, type: 'resource', title: r.title, subtitle: `Resource • ${r.courseCode}`, sourceId: r.id
        }));
      }

      if (servicesRes.ok) {
        const allServices = await servicesRes.json();
        const filteredServices = allServices.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()));
        filteredServices.forEach((s) => formattedResults.push({
          id: `srv-${s.id}`, type: 'service', title: s.name, subtitle: `Campus Service • ${s.location}`, sourceId: s.id
        }));
      }

      if (marketRes.ok) {
        const allMarket = await marketRes.json();
        const filteredMarket = allMarket.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()));
        filteredMarket.forEach((m) => formattedResults.push({
          id: `mkt-${m.id}`, type: 'marketplace', title: m.title, subtitle: `Marketplace • $${m.price}`, sourceId: m.id
        }));
      }

      if (reviewsRes.ok) {
        const reviews = await reviewsRes.json();
        reviews.forEach((r) => formattedResults.push({
          id: `rev-${r.id}`, type: 'review', title: `${r.courseCode} Review`, subtitle: `Review for ${r.professor}`, sourceId: r.id
        }));
      }

      setResults(formattedResults.slice(0, 10));

    } catch (err) {
      console.error('Global search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (type) => {
    setIsOpen(false);
    switch (type) {
      case 'resource': onNavigate('resources'); break;
      case 'service': onNavigate('services'); break;
      case 'marketplace': onNavigate('market'); break;
      case 'review': onNavigate('reviews'); break;
      case 'lostfound': onNavigate('lostfound'); break;
      default: break;
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className={`flex items-center bg-surface-container border rounded-full px-4 py-2 transition-all duration-300 ${isOpen ? 'border-primary shadow-[0_0_15px_rgba(73,75,214,0.15)] bg-surface-container-high' : 'border-outline-variant hover:border-outline'}`}>
        <span className={`material-symbols-outlined text-[20px] mr-2 ${isOpen ? 'text-primary' : 'text-on-surface-variant'}`}>search</span>
        <input
          type="text"
          placeholder="Search campus resources..."
          className="bg-transparent border-none text-on-surface w-full p-0 outline-none text-sm placeholder:text-on-surface-variant/50 focus:ring-0"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => { if (query) setIsOpen(true); }}
        />
        {query && (
          <button className="text-on-surface-variant hover:text-on-surface p-0.5" onClick={() => setQuery('')}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-surface-container-highest border border-outline-variant rounded-2xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 p-8 text-on-surface-variant">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Searching UIU Network...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
              {results.map(result => (
                <div
                  key={result.id}
                  className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-surface-variant transition-colors group"
                  onClick={() => handleResultClick(result.type)}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container transition-transform group-hover:scale-105 ${
                    result.type === 'resource' ? 'text-primary' :
                    result.type === 'service' ? 'text-secondary' :
                    result.type === 'marketplace' ? 'text-tertiary' : 'text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {result.type === 'resource' ? 'description' :
                       result.type === 'service' ? 'hub' :
                       result.type === 'marketplace' ? 'shopping_bag' : 'reviews'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-on-surface truncate">{result.title}</h4>
                    <span className="text-[11px] text-on-surface-variant block truncate">{result.subtitle}</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/0 group-hover:text-on-surface-variant/100 transition-all text-[18px]">chevron_right</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-on-surface mb-2">No matches for "{query}"</p>
              <span className="text-xs text-on-surface-variant leading-relaxed">
                Try searching for a course (e.g., CSE 1110), a professor, or campus services.
              </span>
            </div>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464554; }
      `}} />
    </div>
  );
}
