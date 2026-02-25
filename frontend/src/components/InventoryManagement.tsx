import React, { useState } from 'react';
import { inventoryApi } from '../api';
import { Package, Plus, Pencil, Trash2, X, Save } from 'lucide-react';

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

interface InventoryManagementProps {
  products: Product[];
  onRefresh: () => void;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ products, onRefresh }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    skuCode: '', name: '', description: '', price: 0, originalPrice: 0, imageUrl: '', category: '', brand: '', quantity: 0
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await inventoryApi.delete(id);
        onRefresh();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventoryApi.update(editingId, formData);
      } else {
        await inventoryApi.create(formData);
      }
      setEditingId(null);
      setIsAdding(false);
      setFormData({ skuCode: '', quantity: 0 });
      onRefresh();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ skuCode: '', name: '', description: '', price: 0, originalPrice: 0, imageUrl: '', category: '', brand: '', quantity: 0 });
  };

  return (
    <div className="card glass-card fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={24} className="accent-text" />
          Inventory Management
        </h2>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ skuCode: '', name: '', description: '', price: 0, originalPrice: 0, imageUrl: '', category: '', brand: '', quantity: 0 }); }}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="card" style={{ background: 'rgba(255,255,255,0.03)', marginBottom: '2rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>SKU Code *</label>
              <input type="text" className="input" value={formData.skuCode || ''} onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Product Name *</label>
              <input type="text" className="input" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description</label>
              <textarea className="input" rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Price ($) *</label>
              <input type="number" step="0.01" className="input" value={formData.price || 0} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Original Price ($)</label>
              <input type="number" step="0.01" className="input" value={formData.originalPrice || 0} onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Category</label>
              <input type="text" className="input" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Brand</label>
              <input type="text" className="input" value={formData.brand || ''} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Image URL</label>
              <input type="url" className="input" value={formData.imageUrl || ''} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Stock Quantity *</label>
              <input type="number" className="input" value={formData.quantity || 0} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              <X size={18} style={{ marginRight: '0.5rem' }} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Product
            </button>
          </div>
        </form>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Price</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Quantity</th>
              <th style={{ textAlign: 'right', padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{product.name || product.skuCode}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{product.skuCode} &bull; {product.brand || 'No Brand'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  ${product.price?.toFixed(2) || '0.00'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`status-badge ${product.quantity > 0 ? 'status-success' : 'status-failed'}`}>
                    {product.quantity} units
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => handleEdit(product)}>
                      <Pencil size={16} />
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManagement;
