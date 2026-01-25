"use client";

import { useState, useEffect } from 'react';
import { Save, Loader, Plus, Trash2, Edit } from 'lucide-react';
import RichTextEditor from '../../../components/RichTextEditor';
import { useNotificationContext } from '../../../lib/contexts/NotificationContext';

interface BusinessSystemCard {
  id?: number;
  title: string;
  description: string;
  order: number;
  image?: string;
}

interface BusinessSystemCardsManagementProps {
  inputClass: string;
  labelClass: string;
  buttonClass: string;
  sectionClass: string;
  titleClass: string;
  saving: string | null;
  setSaving: (value: string | null) => void;
}

export default function BusinessSystemCardsManagement({
  inputClass,
  labelClass,
  buttonClass,
  sectionClass,
  titleClass,
  saving,
  setSaving
}: BusinessSystemCardsManagementProps) {
  const [cards, setCards] = useState<BusinessSystemCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState<BusinessSystemCard>({ title: '', description: '', order: 1 });
  const { success, error } = useNotificationContext();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const response = await fetch('https://orr-backend.orr.solutions/admin-portal/v1/cms/business-system-cards/', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (response.ok) {
        const result = await response.json();
        let cardsData = result;
        if (result && result.data) {
          cardsData = result.data;
        }
        const cardsArray = Array.isArray(cardsData) ? cardsData : [];
        setCards(cardsArray.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error('Failed to fetch business system cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (cardId: number, cardData: BusinessSystemCard) => {
    setSaving(`card-${cardId}`);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const response = await fetch(`https://orr-backend.orr.solutions/admin-portal/v1/cms/business-system-cards/${cardId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(cardData)
      });

      if (response.ok) {
        success('Card saved successfully!', 'Business system card has been updated.');
        fetchCards();
      } else {
        throw new Error('Failed to save card');
      }
    } catch (err) {
      console.error('Failed to save card:', err);
      error('Failed to save card', 'Please try again or contact support.');
    } finally {
      setSaving(null);
    }
  };

  const handleAddCard = async () => {
    setSaving('add-card');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      const response = await fetch('https://orr-backend.orr.solutions/admin-portal/v1/cms/business-system-cards/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(newCard)
      });

      if (response.ok) {
        success('Card added successfully!', 'New business system card has been created.');
        setShowAddForm(false);
        setNewCard({ title: '', description: '', order: cards.length + 1 });
        fetchCards();
      } else {
        throw new Error('Failed to add card');
      }
    } catch (err) {
      console.error('Failed to add card:', err);
      error('Failed to add card', 'Please try again or contact support.');
    } finally {
      setSaving(null);
    }
  };

  const handleCardChange = (cardId: number, field: string, value: any) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  if (loading) {
    return (
      <div className={sectionClass}>
        <h2 className={titleClass}>Business System Cards</h2>
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={titleClass}>Business System Cards</h2>
        <button 
          onClick={() => {
            setNewCard({ title: '', description: '', order: cards.length + 1 });
            setShowAddForm(true);
          }}
          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Card
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">
        All business system cards are shaped around your context - no generic playbooks. Add and edit business cards to customize the living system representation.
      </p>

      <div className="flex flex-col gap-6">
        {showAddForm && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-white">Add New Card</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddCard(); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Order</label>
                <input 
                  type="number" 
                  value={newCard.order} 
                  onChange={(e) => setNewCard({...newCard, order: parseInt(e.target.value)})}
                  className={inputClass}
                />
              </div>
              <RichTextEditor
                label="Title"
                value={newCard.title}
                onChange={(value) => setNewCard({...newCard, title: value})}
                placeholder="Enter card title"
              />
              <RichTextEditor
                label="Description"
                value={newCard.description}
                onChange={(value) => setNewCard({...newCard, description: value})}
                placeholder="Enter card description"
                rows={3}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={saving === 'add-card'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'add-card' ? 'Adding...' : 'Add Card'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-300 px-6 py-2 rounded-lg font-medium transition-all duration-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {cards.map((card, index) => (
          <div key={card.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-white">Card {index + 1} - {card.title || 'Untitled'}</h3>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              card.id && handleSave(card.id, card); 
            }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Order</label>
                <input 
                  type="number" 
                  value={card.order} 
                  onChange={(e) => card.id && handleCardChange(card.id, 'order', parseInt(e.target.value))}
                  className={inputClass}
                />
              </div>
              <RichTextEditor
                label="Title"
                value={card.title}
                onChange={(value) => card.id && handleCardChange(card.id, 'title', value)}
                placeholder="Enter card title"
              />
              <RichTextEditor
                label="Description"
                value={card.description}
                onChange={(value) => card.id && handleCardChange(card.id, 'description', value)}
                placeholder="Enter card description"
                rows={3}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={saving === `card-${card.id}`} className={buttonClass}>
                  <Save size={18} />
                  {saving === `card-${card.id}` ? 'Saving...' : `Save Card ${index + 1}`}
                </button>
              </div>
            </form>
          </div>
        ))}

        {cards.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-400">
            <p>No business system cards found. Click "Add Card" to create your first card.</p>
          </div>
        )}
      </div>
    </div>
  );
}