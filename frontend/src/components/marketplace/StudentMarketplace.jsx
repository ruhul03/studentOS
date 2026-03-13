import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Marketplace.css';
import { Tag, Phone, Search, Image as ImageIcon } from 'lucide-react';

export function StudentMarketplace() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('Books');
  const [contactInfo, setContactInfo] = useState('');

  const fetchItems = async () => {
    try {
      const url = activeCategory === 'All' 
        ? `${import.meta.env.VITE_API_URL}/api/marketplace` 
        : `${import.meta.env.VITE_API_URL}/api/marketplace?category=${activeCategory}`;
        
      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();
        if (search) {
          data = data.filter((item) => 
            item.title.toLowerCase().includes(search.toLowerCase()) || 
            item.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace items', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeCategory, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, price: parseFloat(price), condition, category, contactInfo, sellerId: user.id
        })
      });
      if (response.ok) {
        setShowForm(false);
        setTitle(''); setDescription(''); setPrice(''); setCondition('Good'); setCategory('Books'); setContactInfo('');
        fetchItems();
      }
    } catch (err) {
      console.error('Failed to list item', err);
    }
  };

  const markAsSold = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/${id}/sold`, { method: 'PUT' });
      fetchItems();
    } catch (err) {
      console.error('Failed to mark item as sold', err);
    }
  };

  const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Other'];

  return (
    <div className="marketplace-container">
      <div className="market-header">
        <div>
          <h2>Campus Marketplace</h2>
          <p>Buy and sell items within the student community.</p>
        </div>
        <button className="sell-btn" onClick={() => setShowForm(!showForm)}>
          <Tag size={18} /> {showForm ? 'Cancel' : 'Sell an Item'}
        </button>
      </div>

      <div className="market-controls">
        <div className="search-bar market-search">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for books, laptops, UIU bus passes..."
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

      {showForm && (
        <form className="sell-form glass-card" onSubmit={handleSubmit}>
          <h3>List an Item for Sale</h3>
          <div className="form-row">
            <input type="text" placeholder="Item Name (e.g. Intro to Algorithms Book)" value={title} onChange={e => setTitle(e.target.value)} required />
            <div className="price-input">
              <span className="currency-symbol">$</span>
              <input type="number" step="0.01" min="0" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
          </div>
          <textarea placeholder="Description (Edition, details, why selling...)" value={description} onChange={e => setDescription(e.target.value)} required />
          <div className="form-row">
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Other</option>
            </select>
            <select value={condition} onChange={e => setCondition(e.target.value)}>
              <option value="New">Like New</option>
              <option value="Good">Good Condition</option>
              <option value="Fair">Fair / Very Used</option>
            </select>
          </div>
          <input type="text" placeholder="Contact Info (Email or Phone)" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required />
          <button type="submit" className="submit-listing-btn">Publish Listing</button>
        </form>
      )}

      <div className="market-grid">
        {items.map(item => (
          <div key={item.id} className="market-card glass-card">
            <div className="item-image-placeholder">
              <ImageIcon size={32} className="image-icon" />
            </div>
            
            <div className="market-card-content">
              <div className="market-card-header">
                <h3>{item.title}</h3>
                <span className="item-price">${Number(item.price).toFixed(2)}</span>
              </div>
              
              <div className="item-badges">
                <span className="badge category-badge">{item.category}</span>
                <span className="badge condition-badge">{item.condition}</span>
              </div>
              
              <p className="item-desc">{item.description}</p>
              
              <div className="seller-info">
                <div className="seller-details">
                  <span className="seller-name">Sold by {item.seller.name}</span>
                  <span className="posted-time">Listed {new Date(item.listedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="contact-action">
                  {user?.name === item.seller.name ? (
                    <button className="mark-sold-btn" onClick={() => markAsSold(item.id)}>
                      Mark as Sold
                    </button>
                  ) : (
                    <div className="contact-badge">
                      <Phone size={14} /> {item.contactInfo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty-state-market">
            <Tag size={48} className="text-dim" />
            <h3>{search || activeCategory !== 'All' ? 'No items found' : 'Market is empty'}</h3>
            <p className="text-dim">
              {search || activeCategory !== 'All' 
                ? "Try adjusting your filters or search terms." 
                : "Got something to sell? List it here and reach fellow students!"}
            </p>
            {!search && activeCategory === 'All' && (
              <button className="sell-btn-secondary" onClick={() => setShowForm(true)}>
                List an Item
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
