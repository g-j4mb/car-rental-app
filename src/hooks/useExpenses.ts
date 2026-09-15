import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../services/expense.service';

export const useCarExpenses = () => {
  return useQuery({
    queryKey: ['car_expenses'],
    queryFn: expenseService.getCarExpenses,
  });
};

export const useGeneralExpenses = () => {
  return useQuery({
    queryKey: ['general_expenses'],
    queryFn: expenseService.getGeneralExpenses,
  });
};

export const useAddCarExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseService.addCarExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['car_expenses'] }),
  });
};

export const useAddGeneralExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseService.addGeneralExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['general_expenses'] }),
  });
};

export const useRemoveCarExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.removeCarExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['car_expenses'] }),
  });
};

export const useRemoveGeneralExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.removeGeneralExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['general_expenses'] }),
  });
};
