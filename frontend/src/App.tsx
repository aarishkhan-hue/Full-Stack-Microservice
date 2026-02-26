import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Package, CreditCard, Loader2, Settings, Store, Users, LogOut, Search } from 'lucide-react';
import { inventoryApi, orderApi, paymentApi } from './api';
import InventoryManagement from './components/InventoryManagement';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import './index.css';

interface Product {
  id: number;
  skuCode: string;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  quantity: number;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ skuCode: string, quantity: number }[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [view, setView] = useState<'shop' | 'admin' | 'users' | 'cart'>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [auth, setAuth] = useState<{ token: string | null, username: string | null, role: string | null }>({
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role')
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await inventoryApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.skuCode === product.skuCode);
      if (existing) {
        return prev.map(item =>
          item.skuCode === product.skuCode ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { skuCode: product.skuCode, quantity: 1 }];
    });
  };

  const updateCartQuantity = (skuCode: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.skuCode === skuCode) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, cartItem) => {
      const product = products.find(p => p.skuCode === cartItem.skuCode);
      return total + (product?.price || 0) * cartItem.quantity;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const orderNumber = `ORD-${Math.floor(Math.random() * 10000)}`;

      for (const item of cart) {
        const order = {
          skuCode: item.skuCode,
          quantity: item.quantity,
          orderNumber: orderNumber
        };
        await orderApi.place(order);
      }

      setOrderStatus(`Order Placed Successfully: ${orderNumber}`);
      setCart([]);
      pollPaymentStatus(orderNumber);
    } catch (error) {
      console.error("Order failed", error);
      setOrderStatus("Order submission failed. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const pollPaymentStatus = async (orderNumber: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await paymentApi.getStatus(orderNumber);
        if (response.data && response.data.length > 0) {
          const payment = response.data[0];
          setOrderStatus(`Order ${orderNumber}: Payment ${payment.paymentStatus}`);
          clearInterval(interval);
          fetchProducts();
        }
      } catch (e) {
        console.error("Polling error", e);
      }
      if (attempts > 10) clearInterval(interval);
    }, 2000);
  };

  const handleLoginSuccess = (token: string, username: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    setAuth({ token, username, role });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setAuth({ token: null, username: null, role: null });
    setView('shop');
  };

  if (!auth.token) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ... (previous logout and auth handlers)

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div className="app-container">
      {/* Navigation Drawer Overlay */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`} onClick={toggleDrawer} />

      {/* Navigation Drawer Content */}
      <div className={`drawer-content ${isDrawerOpen ? 'active' : ''}`}>
        <div className="drawer-header">
          <div style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '50%' }}>
            <Users size={24} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hello, {auth.username}</div>
            <h2>Quantum Account</h2>
          </div>
        </div>
        <div className="drawer-body">
          <div className="drawer-section">
            <div className="drawer-section-title">Shop By Category</div>
            {['Electronics', 'Fashion', 'Home', 'Books'].map(cat => (
              <div key={cat} className="drawer-item" onClick={() => { setSelectedCategory(cat); setView('shop'); toggleDrawer(); }}>
                {cat}
              </div>
            ))}
          </div>
          <div className="drawer-divider" />
          <div className="drawer-section">
            <div className="drawer-section-title">Help & Settings</div>
            <div className="drawer-item" onClick={() => { setView('users'); toggleDrawer(); }}>Your Account</div>
            <div className="drawer-item" onClick={handleLogout}>Sign Out</div>
          </div>
        </div>
      </div>

      {/* Dynamic Header System */}
      {(view === 'shop' || view === 'cart') ? (
        <>
          <nav className="nav-header">
            {/* Logo */}
            <div className="nav-logo" onClick={() => { setView('shop'); setSelectedProduct(null); }}>
              <Store size={22} color="var(--accent)" />
              <h1>Quantum<span>Store</span></h1>
            </div>

            {/* Actions - Text hidden on mobile via CSS */}
            <div className="nav-actions">
              {auth.role === 'ADMIN' && (
                <button
                  className="btn-icon"
                  onClick={() => { setView('admin'); setSelectedProduct(null); }}
                >
                  <Settings size={20} />
                  <span>Admin</span>
                </button>
              )}

              <div className="nav-user-info" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Sign Out</span>
              </div>

              <div
                className="nav-cart-icon"
                onClick={() => { setView('cart'); setSelectedProduct(null); }}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                <ShoppingBag size={20} color={cart.length > 0 ? "var(--accent)" : "currentColor"} />
                {cart.reduce((a, b) => a + b.quantity, 0) > 0 && (
                  <span className="cart-badge">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Search Bar - Grid Area: search */}
            <div className="nav-search-container">
              <input
                type="text"
                className="nav-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="nav-search-btn">
                <Search size={18} />
                <span>Search</span>
              </button>
            </div>
          </nav>

          {/* Amazon Sub-Navbar (Categories) - Hidden in Admin */}
          {view === 'shop' && (
            <nav className="sub-nav">
              <div className="sub-nav-all-category" onClick={toggleDrawer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                All
              </div>
              <div
                style={{ cursor: 'pointer', fontWeight: selectedCategory === '' ? 600 : 400, color: selectedCategory === '' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onClick={() => setSelectedCategory('')}
              >
                All Products
              </div>
              {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
                <div
                  key={cat}
                  style={{ cursor: 'pointer', fontWeight: selectedCategory === cat ? 600 : 400, color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  onClick={() => setSelectedCategory(cat!)}
                >
                  {cat}
                </div>
              ))}
            </nav>
          )}
        </>
      ) : (
        /* Dedicated Admin Mode Navbar - Responsive */
        <nav className="admin-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Admin Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'var(--accent)', padding: '4px', borderRadius: '6px' }}>
                <Settings size={20} color="#0f172a" />
              </div>
              <h2 style={{ fontSize: '1rem', margin: 0, fontWeight: 800, letterSpacing: '0.5px' }}>
                ADMIN<span>WORKSPACE</span>
              </h2>
            </div>

            {/* Admin Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setView('admin')}
                className={`btn ${view === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
              >
                <Package size={16} /> <span>Catalog</span>
              </button>
              <button
                onClick={() => setView('users')}
                className={`btn ${view === 'users' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
              >
                <Users size={16} /> <span>Analytics</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', paddingRight: '0.75rem', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'none' }} className="md:block">
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Admin</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{auth.username}</div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444' }}
              onClick={() => setView('shop')}
            >
              <LogOut size={14} /> <span>Exit</span>
            </button>
          </div>
        </nav>
      )}

      <div className="container" style={{ flex: 1, padding: '1rem' }}>
        {orderStatus && (
          <div className="glass-card animate-in" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent)', background: 'rgba(56, 189, 248, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle color="var(--accent)" />
              <p>{orderStatus}</p>
            </div>
          </div>
        )}

        {view === 'shop' ? (
          <main className="grid">
            {/* ... shop content ... */}
            <section style={{ gridColumn: 'span 2' }}>
              {selectedProduct ? (
                <div className="fade-in">
                  <button
                    className="btn btn-secondary"
                    style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => setSelectedProduct(null)}
                  >
                    &larr; Back to Catalog
                  </button>
                  <div className="detail-grid">
                    {/* Hero Image Section */}
                    <div className="detail-image-container">
                      {selectedProduct.imageUrl ? (
                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                      ) : (
                        <Package size={150} opacity={0.1} />
                      )}
                    </div>

                    {/* Metadata & Buy Box Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
                      {/* Product Metadata */}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                          {selectedProduct.brand || 'Quantum Brand'}
                        </div>
                        <h2 style={{ fontSize: '2.4rem', marginBottom: '1.2rem', lineHeight: '1.2', fontWeight: 800 }}>
                          {selectedProduct.name || selectedProduct.skuCode}
                        </h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ display: 'flex', color: '#eab308', fontSize: '1.4rem' }}>
                            {"★".repeat(Math.round(selectedProduct.rating || 5)) + "☆".repeat(5 - Math.round(selectedProduct.rating || 5))}
                          </div>
                          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedProduct.rating || '4.8'}</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{selectedProduct.reviewCount || 128} Answered Questions</span>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Product Description:</h4>
                          <p style={{ lineHeight: '1.8', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem' }}>
                            {selectedProduct.description || 'Experience cutting-edge performance and sleek design with our latest Quantum series. Engineered for those who demand excellence, this product combines durability with modern aesthetics to elevate your lifestyle.'}
                          </p>
                        </div>

                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Special Features:</strong>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.95rem', opacity: 0.8 }}>
                            <li>Premium build quality with aerospace-grade materials.</li>
                            <li>Advanced Quantum-Sync technology integrated.</li>
                            <li>Energy efficient and highly reliable performance.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Professional Buy Box */}
                      <div className="buy-box">
                        <div style={{ marginBottom: '1.5rem' }}>
                          {selectedProduct.originalPrice && selectedProduct.price && selectedProduct.originalPrice > selectedProduct.price ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: '#ef4444', fontSize: '1.6rem', fontWeight: 300 }}>-{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}%</span>
                                <span style={{ fontSize: '2.6rem', fontWeight: 800 }}>${selectedProduct.price.toFixed(2)}</span>
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Typical price: <span style={{ textDecoration: 'line-through' }}>${selectedProduct.originalPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '2.6rem', fontWeight: 800 }}>${selectedProduct.price?.toFixed(2) || '0.00'}</div>
                          )}
                        </div>

                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={20} /> In Stock
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Fastest delivery by Tomorrow</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', borderRadius: '30px', boxShadow: '0 4px 15px var(--glow)' }}
                            onClick={() => addToCart(selectedProduct)}
                            disabled={selectedProduct.quantity <= 0}
                          >
                            <ShoppingBag size={20} />
                            Add to Cart
                          </button>

                          <button
                            className="btn btn-secondary"
                            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: '30px', background: '#eab308', color: '#000', border: 'none' }}
                            onClick={() => { addToCart(selectedProduct); setView('cart'); }}
                            disabled={selectedProduct.quantity <= 0}
                          >
                            Buy Now
                          </button>
                        </div>

                        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Ships from</span>
                            <span>Quantum Logistics</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Sold by</span>
                            <span style={{ color: 'var(--accent)' }}>Quantum Store</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={24} className="accent-text" /> Available Catalog
                  </h2>
                  {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                      <Loader2 className="animate-spin" size={48} color="var(--accent)" />
                    </div>
                  ) : (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                      {products.filter(p => {
                        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
                        return matchesSearch && matchesCategory;
                      }).map(product => (
                        <div
                          key={product.id.toString()}
                          className="glass-card animate-in"
                          style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                          onClick={() => setSelectedProduct(product)}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div style={{ height: '220px', width: '100%', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name || product.skuCode} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={48} opacity={0.2} />
                              </div>
                            )}
                            {product.originalPrice && product.price && product.originalPrice > product.price && (
                              <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                              {product.brand || 'Generic'}
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {product.name || product.skuCode}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.75rem' }}>
                              <span style={{ color: '#eab308' }}>★</span>
                              <span style={{ fontWeight: 600 }}>{product.rating || '0.0'}</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>({product.reviewCount || 0})</span>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${product.price?.toFixed(2) || '0.00'}</div>
                                {product.originalPrice && (
                                  <div style={{ color: 'var(--text-secondary)', textDecoration: 'line-through', fontSize: '0.9rem' }}>
                                    ${product.originalPrice.toFixed(2)}
                                  </div>
                                )}
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                disabled={product.quantity <= 0}
                                style={{ padding: '0.5rem 1rem' }}
                              >
                                {product.quantity > 0 ? 'Add' : 'Out'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        ) : view === 'cart' ? (
          <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ShoppingBag size={32} className="accent-text" /> Shopping Cart
            </h2>

            <div className="cart-layout">
              {/* Cart Items List */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                    <ShoppingBag size={64} opacity={0.2} style={{ margin: '0 auto 1.5rem auto' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Quantum Cart is empty.</h3>
                    <button className="btn btn-primary" onClick={() => setView('shop')}>Continue Shopping</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      <span>Product Details</span>
                      <span>Action</span>
                    </div>

                    {cart.map(item => {
                      const product = products.find(p => p.skuCode === item.skuCode);
                      if (!product) return null;

                      return (
                        <div key={item.skuCode} className="cart-item">
                          <div className="cart-item-image">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package opacity={0.2} size={40} /></div>
                            )}
                          </div>

                          <div className="cart-item-info">
                            <h4>{product.name}</h4>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>SKU: {item.skuCode}</span>
                            <span style={{ color: product.quantity > 0 ? '#22c55e' : '#ef4444', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'auto' }}>
                              {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 700 }}>
                              ${product.price?.toFixed(2)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: '120px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <button
                                onClick={() => updateCartQuantity(item.skuCode, -1)}
                                style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}
                              >-</button>
                              <span style={{ padding: '0 0.5rem', fontWeight: 600, minWidth: '25px', textAlign: 'center' }}>{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.skuCode, 1)}
                                disabled={item.quantity >= product.quantity}
                                style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', color: 'white', cursor: item.quantity >= product.quantity ? 'not-allowed' : 'pointer', fontSize: '1.1rem', opacity: item.quantity >= product.quantity ? 0.3 : 1 }}
                              >+</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Summary / Bill - Side Column */}
              <div className="cart-summary">
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Items ({cart.reduce((a, b) => a + b.quantity, 0)}):</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Shipping:</span>
                    <span style={{ color: '#22c55e' }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span>Tax:</span>
                    <span>$0.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>
                    <span>Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', boxShadow: '0 0 20px var(--glow)' }}
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || cart.length === 0}
                >
                  {placingOrder ? <Loader2 className="animate-spin" size={22} /> : <CreditCard size={22} />}
                  {placingOrder ? 'Processing...' : 'Place Order Now'}
                </button>

                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Secure SSL Checkout | 30 Day Returns
                </div>
              </div>
            </div>
          </div>
        ) : view === 'admin' ? (
          <InventoryManagement products={products} onRefresh={fetchProducts} />
        ) : (
          <AdminDashboard />
        )}
        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav">
          <div className={`bottom-nav-item ${view === 'shop' ? 'active' : ''}`} onClick={() => setView('shop')}>
            <Store size={20} />
            <span>Home</span>
          </div>
          <div className="bottom-nav-item" onClick={toggleDrawer}>
            <Users size={20} />
            <span>Menu</span>
          </div>
          <div className={`bottom-nav-item ${view === 'cart' ? 'active' : ''}`} onClick={() => setView('cart')}>
            <ShoppingBag size={20} />
            <span>Cart</span>
          </div>
          <div className={`bottom-nav-item ${auth.role === 'ADMIN' ? '' : 'disabled'}`} onClick={() => auth.role === 'ADMIN' && setView('admin')}>
            <Settings size={20} />
            <span>Admin</span>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;
