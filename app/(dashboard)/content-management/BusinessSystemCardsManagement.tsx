"use client";

import { useState, useEffect } from 'react';
import { Save, Loader, Plus, Trash2, Edit } from 'lucide-react';
import RichTextEditor from '../../../components/RichTextEditor';
import { useNotificationContext } from '../../../lib/contexts/NotificationContext';
import { useLanguageStore } from '@/store/languageStore';
import { cleanContentObject, cleanHtmlContent } from "@/app/utils/htmlCleaner";

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
  const { t } = useLanguageStore();
  const [cards, setCards] = useState<BusinessSystemCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState<BusinessSystemCard>({ title: '', description: '', order: 1 });
  const { success, error } = useNotificationContext();

  const getStringValue = (value: any): string => {
    return cleanHtmlContent(value);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/business-system-cards/`, {
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
        const cleanedCards = cardsArray.map((card: any) => cleanContentObject(card));
        setCards(cleanedCards.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      }
    } catch (err) {
      console.error('Failed to fetch business system cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (cardId: number, cardData: BusinessSystemCard) => {
    setSaving(`card-${cardId}`);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/business-system-cards/${cardId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(cardData)
      });

      if (response.ok) {
        success(t('content_management.success_save_title'), t('content_management.success_save_msg'));
        fetchCards();
      } else {
        throw new Error('Failed to save card');
      }
    } catch (err) {
      console.error('Failed to save card:', err);
      error(t('content_management.error_save_title'), t('content_management.validation_error_msg'));
    } finally {
      setSaving(null);
    }
  };

  const handleAddCard = async () => {
    setSaving('add-card');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/business-system-cards/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(newCard)
      });

      if (response.ok) {
        success(t('content_management.success_save_title'), t('content_management.success_save_msg'));
        setShowAddForm(false);
        setNewCard({ title: '', description: '', order: cards.length + 1 });
        fetchCards();
      } else {
        throw new Error('Failed to add card');
      }
    } catch (err) {
      console.error('Failed to add card:', err);
      error(t('content_management.error_save_title'), t('content_management.validation_error_msg'));
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
        <h2 className={titleClass}>{t('content_management.business_system_section')}</h2>
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={titleClass}>{t('content_management.business_system_section')}</h2>
        <button 
          onClick={() => {
            setNewCard({ title: '', description: '', order: cards.length + 1 });
            setShowAddForm(true);
          }}
          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={18} />
          {t('content_management.add_card')}
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">
        {t('content_management.cards_desc')}
      </p>

      <div className="flex flex-col gap-6">
        {showAddForm && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.add_new_card')}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddCard(); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>{t('content_management.order')}</label>
                <input 
                  type="number" 
                  value={newCard.order} 
                  onChange={(e) => setNewCard({...newCard, order: parseInt(e.target.value)})}
                  className={inputClass}
                />
              </div>
              <RichTextEditor
                label={t('content_management.section_title')}
                value={getStringValue(newCard.title)}
                onChange={(value) => setNewCard({...newCard, title: value})}
                placeholder={t('content_management.placeholder_card_title')}
              />
              <RichTextEditor
                label={t('content_management.description')}
                value={getStringValue(newCard.description)}
                onChange={(value) => setNewCard({...newCard, description: value})}
                placeholder={t('content_management.placeholder_card_description')}
                rows={3}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={saving === 'add-card'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'add-card' ? t('content_management.adding') : t('content_management.add_card')}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-300 px-6 py-2 rounded-lg font-medium transition-all duration-200">
                  {t('content_management.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {cards.map((card, index) => (
          <div key={card.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.card', { num: index + 1 })} - {getStringValue(card.title) || t('content_management.not_specified')}</h3>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              card.id && handleSave(card.id, card); 
            }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>{t('content_management.order')}</label>
                <input 
                  type="number" 
                  value={card.order} 
                  onChange={(e) => card.id && handleCardChange(card.id, 'order', parseInt(e.target.value))}
                  className={inputClass}
                />
              </div>
              <RichTextEditor
                label={t('content_management.section_title')}
                value={getStringValue(card.title)}
                onChange={(value) => card.id && handleCardChange(card.id, 'title', value)}
                placeholder={t('content_management.placeholder_card_title')}
              />
              <RichTextEditor
                label={t('content_management.description')}
                value={getStringValue(card.description)}
                onChange={(value) => card.id && handleCardChange(card.id, 'description', value)}
                placeholder={t('content_management.placeholder_card_description')}
                rows={3}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={saving === `card-${card.id}`} className={buttonClass}>
                  <Save size={18} />
                  {saving === `card-${card.id}` ? t('content_management.saving') : t('content_management.save_faq', { num: index + 1 })}
                </button>
              </div>
            </form>
          </div>
        ))}

        {cards.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-400">
            <p>{t('content_management.no_cards')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
