import React, { useEffect, useState } from 'react';
import { FormAmount } from './manual-input/FormAmount';
import { FormMerchant } from './manual-input/FormMerchant';
import { FormCategory } from './manual-input/FormCategory';
import { FormDatePicker } from './manual-input/FormDatePicker';
import { FormReason } from './manual-input/FormReason';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ExpenseData } from '@/hooks/useExpenseMutation';

interface Props {
  capturedImage?: string | null;
  onSubmit: (expenseData: ExpenseData) => void;
}

const ManualInputForm = ({ capturedImage, onSubmit }: Props) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [commercant, setCommercant] = useState('');
  const [montant, setMontant] = useState('');
  const [categorie, setCategorie] = useState('');
  const [motif, setMotif] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/login?from=/submit');
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const expenseData: ExpenseData = {
      date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      commercant,
      montant_ttc: parseFloat(montant.replace(',', '.')),
      categorie,
      motif
    };
    
    try {
      onSubmit(expenseData);
      navigate('/');
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-5">
      {capturedImage && (
        <div className="mb-4">
          <img src={capturedImage} alt="Captured" className="w-full rounded-md" />
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormDatePicker date={date} setDate={setDate} />
        <FormMerchant commercant={commercant} setCommercant={setCommercant} />
        <FormAmount montant={montant} setMontant={setMontant} />
        <FormCategory categorie={categorie} setCategorie={setCategorie} />
        <FormReason motif={motif} setMotif={setMotif} />
        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManualInputForm;
