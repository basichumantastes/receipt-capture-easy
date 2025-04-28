
// This file has been deprecated in favor of useExpenseMutation.ts
// Import the ExpenseData type for backward compatibility

import { ExpenseData } from "@/hooks/useExpenseMutation";

// This function is kept for backward compatibility but will use the new hooks internally
export const submitExpense = async () => {
  console.warn('submitExpense is deprecated. Use useSubmitExpenseMutation hook instead.');
  return { success: false, error: new Error('Function deprecated') };
};

// Re-export the ExpenseData type for backward compatibility
export type { ExpenseData };
