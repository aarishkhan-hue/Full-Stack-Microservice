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
  const [view, setView] = useState<'shop' | 'admin' | 'users'>('shop');
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

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const order = {
        skuCode: cart[0].skuCode,
        quantity: cart[0].quantity,
        orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`
      };
      const response = await orderApi.place(order);
      setOrderStatus(`Order Placed: ${response.data}`);
      setCart([]);
      pollPaymentStatus(order.orderNumber);
    } catch (error) {
      console.error("Order failed", error);
      setOrderStatus("Order submission failed");
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
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--accent)' }}>Quantum</span> Store
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Premium Microservices-Powered Inventory</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className={`btn ${view === 'shop' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setView('shop')}
          >
            <Store size={18} /> Shop
          </button>
          {auth.role === 'ADMIN' && (
            <>
              <button
                className={`btn ${view === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: '1px solid rgba(0, 210, 255, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setView('admin')}
              >
                <Settings size={18} /> Manage
              </button>
              <button
                className={`btn ${view === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: '1px solid rgba(0, 210, 255, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setView('users')}
              >
                <Users size={18} /> Users
              </button>
            </>
          )}
          <div className="glass-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ShoppingBag size={20} className="accent-text" />
            <span>{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

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
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={24} className="accent-text" /> Available Catalog
            </h2>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent)" />
              </div>
            ) : (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {products.map(product => (
                  <div key={product.id.toString()} className="glass-card animate-in" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                          onClick={() => addToCart(product)}
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
          </section>

          <section>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={24} className="accent-text" /> Checkout
            </h2>
            <div className="glass-card">
              {cart.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No items in cart</p>
              ) : (
                <div>
                  {cart.map(item => (
                    <div key={item.skuCode.toString()} style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.skuCode}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                  >
                    {placingOrder ? 'Processing...' : 'Complete Order'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      ) : view === 'admin' ? (
        <InventoryManagement products={products} onRefresh={fetchProducts} />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
};

export default App;
