import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Package, CreditCard, Loader2 } from 'lucide-react';
import { inventoryApi, orderApi, paymentApi } from './api';
import './index.css';

interface Product {
  id: number;
  skuCode: string;
  quantity: number;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ skuCode: string, quantity: number }[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

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
      // Simplification: Placing order for the first item in cart as per our backend logic
      const order = {
        skuCode: cart[0].skuCode,
        quantity: cart[0].quantity,
        orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`
      };
      const response = await orderApi.place(order);
      setOrderStatus(`Order Placed: ${response.data}`);
      setCart([]);

      // Poll for payment status
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
          fetchProducts(); // Refresh inventory
        }
      } catch (e) {
        console.error("Polling error", e);
      }
      if (attempts > 10) clearInterval(interval);
    }, 2000);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--accent)' }}>Quantum</span> Store
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Premium Microservices-Powered Inventory</p>
        </div>
        <div className="glass-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ShoppingBag size={20} />
          <span>{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
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

      <main className="grid">
        <section style={{ gridColumn: 'span 2' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={24} /> Available Catalog
          </h2>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 className="animate-spin" size={48} color="var(--accent)" />
            </div>
          ) : (
            <div className="grid">
              {products.map(product => (
                <div key={product.id.toString()} className="glass-card animate-in">
                  <h3 style={{ marginBottom: '1rem' }}>{product.skuCode}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Stock: {product.quantity}</span>
                    <button
                      className="btn-primary"
                      onClick={() => addToCart(product)}
                      disabled={product.quantity <= 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={24} /> Checkout
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
                  className="btn-primary"
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
    </div>
  );
};

export default App;
