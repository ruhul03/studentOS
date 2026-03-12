import { useState, useEffect } from 'react';
import './CampusServices.css';
import { Search, MapPin, Clock, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

export type CampusService = {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  operatingHours: string;
  contactInfo: string;
  status: string;
};

export function CampusServicesDirectory() {
  const [services, setServices] = useState<CampusService[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchServices = async () => {
    try {
      const url = activeCategory === 'All' 
        ? 'http://localhost:8081/api/services' 
        : `http://localhost:8081/api/services?category=${activeCategory}`;
        
      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();
        if (search) {
          data = data.filter((s: CampusService) => 
            s.name.toLowerCase().includes(search.toLowerCase()) || 
            s.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to fetch campus services', err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [activeCategory, search]);

  const categories = ['All', 'Library', 'Medical', 'Food', 'Transport'];

  return (
    <div className="services-container">
      <div className="services-header">
        <h2>Campus Services Directory</h2>
        <p>Find essential university facilities, their operating hours, and live status.</p>
      </div>

      <div className="services-controls">
        <div className="search-bar services-search">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for a building, service, or food..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card glass-card">
            <div className="service-header-row">
              <h3>{service.name}</h3>
              <span className={`status-badge ${service.status === 'Open' || service.status === 'Running' ? 'status-open' : 'status-closed'}`}>
                {service.status === 'Open' || service.status === 'Running' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {service.status}
              </span>
            </div>
            
            <span className="category-tag">{service.category}</span>
            <p className="service-desc">{service.description}</p>
            
            <div className="service-details">
              <div className="detail-item">
                <MapPin size={16} className="detail-icon" />
                <span>{service.location}</span>
              </div>
              <div className="detail-item">
                <Clock size={16} className="detail-icon" />
                <span>{service.operatingHours}</span>
              </div>
              {service.contactInfo && (
                <div className="detail-item">
                  <Phone size={16} className="detail-icon" />
                  <span>{service.contactInfo}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="empty-state">No services found matching your criteria.</div>
        )}
      </div>
    </div>
  );
}
