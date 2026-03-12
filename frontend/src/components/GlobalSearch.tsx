import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Link as LinkIcon } from 'lucide-react';
import './GlobalSearch.css';

type SearchResultItem = {
  id: string;
  type: 'resource' | 'service' | 'marketplace' | 'review' | 'lostfound';
  title: string;
  subtitle: string;
  sourceId: number;
};

export function GlobalSearch({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be a single backend endpoint that aggregates results
      // Here we simulate it by calling multiple endpoints in parallel
      const [resourcesRes, servicesRes, marketRes, reviewsRes] = await Promise.all([
        fetch(`http://localhost:8081/api/resources?search=${encodeURIComponent(searchQuery)}`),
        fetch(`http://localhost:8081/api/services?category=${encodeURIComponent(searchQuery)}`), // basic fallback
        fetch(`http://localhost:8081/api/marketplace?category=${encodeURIComponent(searchQuery)}`), // basic fallback
        fetch(`http://localhost:8081/api/reviews?courseCode=${encodeURIComponent(searchQuery)}`) // basic fallback
      ]);

      const formattedResults: SearchResultItem[] = [];

      if (resourcesRes.ok) {
        const resources = await resourcesRes.json();
        resources.forEach((r: any) => formattedResults.push({
          id: `res-${r.id}`, type: 'resource', title: r.title, subtitle: `Resource • ${r.courseCode}`, sourceId: r.id
        }));
      }

      if (servicesRes.ok) {
         // simulated search filter on client side for demo
        const allServices = await servicesRes.json();
        const filteredServices = allServices.filter((s:any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()));
        filteredServices.forEach((s: any) => formattedResults.push({
          id: `srv-${s.id}`, type: 'service', title: s.name, subtitle: `Campus Service • ${s.location}`, sourceId: s.id
        }));
      }

      if (marketRes.ok) {
        const allMarket = await marketRes.json();
        const filteredMarket = allMarket.filter((m:any) => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()));
        filteredMarket.forEach((m: any) => formattedResults.push({
          id: `mkt-${m.id}`, type: 'marketplace', title: m.title, subtitle: `Marketplace • $${m.price}`, sourceId: m.id
        }));
      }

      if (reviewsRes.ok) {
        const reviews = await reviewsRes.json();
        reviews.forEach((r: any) => formattedResults.push({
          id: `rev-${r.id}`, type: 'review', title: `${r.courseCode} Review`, subtitle: `Review for ${r.professor}`, sourceId: r.id
        }));
      }

      setResults(formattedResults.slice(0, 10)); // Limit to top 10

    } catch (err) {
      console.error('Global search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (type: string) => {
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
    <div className="global-search-wrapper" ref={wrapperRef}>
      <div className={`global-search-input ${isOpen ? 'active' : ''}`}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search StudentOS..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => { if (query) setIsOpen(true); }}
        />
        {query && (
          <button className="clear-btn" onClick={() => setQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="search-dropdown glass-card">
          {isLoading ? (
            <div className="search-loading">
              <Loader2 size={24} className="animate-spin" />
              <span>Searching campus network...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results">
              {results.map(result => (
                <div 
                  key={result.id} 
                  className={`search-result-item ${result.type}-result`}
                  onClick={() => handleResultClick(result.type)}
                >
                  <div className="result-icon">
                    <LinkIcon size={16} />
                  </div>
                  <div className="result-info">
                    <h4>{result.title}</h4>
                    <span className="result-subtitle">{result.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="search-empty">
              <p>No results found for "{query}"</p>
              <span className="search-hint">Try searching for a course code like CSE 101, a building, or a service.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
