import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Package, CreditCard, Loader2, Settings, Store, Users, LogOut } from 'lucide-react';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Amazon-Style Top Navigation Bar */}
      <nav style={{ background: '#0f172a', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Logo */}
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setView('shop'); setSelectedProduct(null); }}>
          <Store size={28} color="var(--accent)" />
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Quantum<span style={{ color: 'var(--accent)' }}>Store</span>
          </h1>
        </div>

        {/* Search Bar */}
        <div style={{ flex: 1, display: 'flex', maxWidth: '800px' }}>
          <input
            type="text"
            placeholder="Search products, brands, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px 0 0 8px', border: 'none', outline: 'none', fontSize: '1rem', color: '#000' }}
          />
          <button style={{ padding: '0 1.5rem', background: 'var(--accent)', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', color: '#fff', fontWeight: 600 }}>
            Search
          </button>
        </div>

        {/* Nav Links & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {auth.role === 'ADMIN' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${view === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => { setView('admin'); setSelectedProduct(null); }}
              >
                <Settings size={16} style={{ marginRight: '6px' }} /> Manage
              </button>
              <button
                className={`btn ${view === 'users' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => { setView('users'); setSelectedProduct(null); }}
              >
                <Users size={16} style={{ marginRight: '6px' }} /> Users
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={handleLogout}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hello, {auth.username}</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Sign Out <LogOut size={14} /></span>
          </div>

          {/* Cart Icon */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', background: view === 'cart' ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}
            onClick={() => { setView('cart'); setSelectedProduct(null); }}
            className="hover-bg"
          >
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={28} color={cart.length > 0 ? "var(--accent)" : "currentColor"} />
              {cart.reduce((a, b) => a + b.quantity, 0) > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
            <span style={{ fontWeight: 600, fontSize: '1rem', display: 'none' }} className="md:block">Cart</span>
          </div>
        </div>
      </nav>

      <div className="container" style={{ flex: 1, padding: '2rem 1rem' }}>
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
                  <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', padding: '2rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                      {selectedProduct.imageUrl ? (
                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name || selectedProduct.skuCode} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Package size={100} opacity={0.2} />
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        {selectedProduct.brand || 'Generic Brand'}
                      </div>
                      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: '1.2' }}>{selectedProduct.name || selectedProduct.skuCode}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', color: '#eab308', fontSize: '1.2rem' }}>★★★★★</div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedProduct.rating || '0.0'}</span>
                        <span style={{ color: '#38bdf8', cursor: 'pointer' }}>{selectedProduct.reviewCount || 0} Ratings</span>
                      </div>

                      <div style={{ marginBottom: '2rem' }}>
                        {selectedProduct.originalPrice && selectedProduct.price && selectedProduct.originalPrice > selectedProduct.price && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 300 }}>
                              -{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}%
                            </span>
                            <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>${selectedProduct.price.toFixed(2)}</span>
                          </div>
                        )}
                        {!(selectedProduct.originalPrice && selectedProduct.price && selectedProduct.originalPrice > selectedProduct.price) && (
                          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>${selectedProduct.price?.toFixed(2) || '0.00'}</div>
                        )}
                        {selectedProduct.originalPrice && (
                          <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            Typical price: <span style={{ textDecoration: 'line-through' }}>${selectedProduct.originalPrice.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ marginBottom: '2rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
                        <strong>About this item:</strong>
                        <p style={{ marginTop: '0.5rem' }}>{selectedProduct.description || 'No description available for this product.'}</p>
                      </div>

                      <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '1.2rem', color: selectedProduct.quantity > 0 ? '#22c55e' : '#ef4444', fontWeight: 600, marginBottom: '1rem' }}>
                          {selectedProduct.quantity > 0 ? 'In Stock' : 'Currently Unavailable'}
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                          onClick={() => addToCart(selectedProduct)}
                          disabled={selectedProduct.quantity <= 0}
                        >
                          <ShoppingBag size={20} />
                          {selectedProduct.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
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
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                      {products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
              {/* Cart Items List */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                    <ShoppingBag size={64} opacity={0.2} style={{ margin: '0 auto 1.5rem auto' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Quantum Cart is empty.</h3>
                    <button className="btn btn-primary" onClick={() => setView('shop')}>Continue Shopping</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      <span>Product Details</span>
                      <span>Quantity & Price</span>
                    </div>

                    {cart.map(item => {
                      const product = products.find(p => p.skuCode === item.skuCode);
                      if (!product) return null;

                      return (
                        <div key={item.skuCode} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: '120px', height: '120px', background: 'white', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package opacity={0.2} size={40} /></div>
                            )}
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>{product.name}</h4>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'auto' }}>Brand: {product.brand || 'Generic'}</span>
                            <span style={{ color: product.quantity > 0 ? '#22c55e' : '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>
                              {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: '150px' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                              ${((product.price || 0) * item.quantity).toFixed(2)}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <button
                                onClick={() => updateCartQuantity(item.skuCode, -1)}
                                style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                              >-</button>
                              <span style={{ padding: '0 0.5rem', fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.skuCode, 1)}
                                disabled={item.quantity >= product.quantity}
                                style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'white', cursor: item.quantity >= product.quantity ? 'not-allowed' : 'pointer', fontSize: '1.2rem', opacity: item.quantity >= product.quantity ? 0.3 : 1 }}
                              >+</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Summary / Bill */}
              <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Items ({cart.reduce((a, b) => a + b.quantity, 0)}):</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Shipping & handling:</span>
                    <span>$0.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span>Total before tax:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                    <span>Order Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || cart.length === 0}
                >
                  {placingOrder ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
                  {placingOrder ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </div>
        ) : view === 'admin' ? (
          <InventoryManagement products={products} onRefresh={fetchProducts} />
        ) : (
          <AdminDashboard />
        )}
      </div>
    </div>
  );
};

export default App;
