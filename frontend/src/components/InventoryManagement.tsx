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
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    try {
      if (window.confirm('Are you sure you want to delete this product?')) {
        await inventoryApi.delete(id);
        onRefresh();
      }
    } catch (error) {
      console.error('Delete failed:', error);
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
      setFormData({ skuCode: '', name: '', description: '', price: 0, originalPrice: 0, imageUrl: '', category: '', brand: '', quantity: 0 });
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

  const filteredProducts = selectedCategory === ''
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="fade-in" style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem' }}>
          <Package size={28} className="accent-text" />
          Catalog Management
        </h2>
        {!isAdding && !editingId && (
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setIsAdding(true)}
          >
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* SIDEBAR: Form Section */}
        <div style={{ flex: '1 1 300px', maxWidth: '100%', position: 'sticky', top: '100px', minWidth: '280px' }}>
          {(isAdding || editingId) ? (
            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1rem', border: '1px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{editingId ? 'Edit Product' : 'Add Product'}</h3>
                <button type="button" onClick={cancelEdit} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>SKU Code *</label>
                  <input type="text" className="input" value={formData.skuCode || ''} onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Product Name *</label>
                  <input type="text" className="input" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Category</label>
                  <select
                    className="input"
                    value={categories.includes(formData.category || '') ? formData.category : (formData.category ? 'OTHER' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'OTHER') {
                        setFormData({ ...formData, category: '' });
                      } else {
                        setFormData({ ...formData, category: val });
                      }
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="OTHER">+ Add New Category</option>
                  </select>
                  {(!categories.includes(formData.category || '') || formData.category === '') && (
                    <input
                      type="text"
                      placeholder="Enter category name"
                      className="input"
                      style={{ marginTop: '0.5rem' }}
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Price *</label>
                    <input type="number" step="0.01" className="input" value={formData.price || 0} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Stock *</label>
                    <input type="number" className="input" value={formData.quantity || 0} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Brand</label>
                  <input type="text" className="input" value={formData.brand || ''} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Image URL</label>
                  <input type="url" className="input" value={formData.imageUrl || ''} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Description</label>
                  <textarea className="input" rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          ) : (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)' }}>
              <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Select a product to edit, or click "Add New Product" to expand the catalog.</p>
            </div>
          )}
        </div>

        {/* MAIN: Product List Section */}
        <div style={{ flex: '2 1 600px', minWidth: '320px' }}>
          {/* Category Filter Bar */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: selectedCategory === '' ? 'var(--accent)' : 'transparent',
                color: selectedCategory === '' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: selectedCategory === cat ? 'var(--accent)' : 'transparent',
                  color: selectedCategory === cat ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: selectedCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.05)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {filteredProducts.map(product => (
              <div key={product.id} className="glass-card animate-in" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: editingId === product.id ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                <div style={{ height: '160px', width: '100%', background: 'white', position: 'relative' }}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name || product.skuCode} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={32} opacity={0.2} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(15, 23, 42, 0.9)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: product.quantity > 0 ? '#22c55e' : '#ef4444' }}>
                      {product.quantity}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {product.brand || 'Generic'} &bull; {product.skuCode}
                  </div>
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: 600 }}>
                    {product.name || product.skuCode}
                  </h3>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>${product.price?.toFixed(2) || '0.00'}</div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }} onClick={() => handleEdit(product)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => handleDelete(product.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
