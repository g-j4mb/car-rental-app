import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalService } from '../services/rental.service';
import { RentalCreateInput, RentalAdjustInput, RentalReturnInput } from '../lib/validation';

export const useRentals = () => {
  return useQuery({
    queryKey: ['rentals'],
    queryFn: rentalService.getRentals,
  });
};

export const useRental = (id: string) => {
  return useQuery({
    queryKey: ['rentals', id],
    queryFn: () => rentalService.getRental(id),
    enabled: !!id,
  });
};

// Rental create/return/cancel also flip the car's status, so refresh cars too.
const invalidateRentalsAndCars = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['rentals'] });
  queryClient.invalidateQueries({ queryKey: ['cars'] });
};

export const useAddRental = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RentalCreateInput) => rentalService.addRental(input),
    onSuccess: () => invalidateRentalsAndCars(queryClient),
  });
};

export const useAdjustRental = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RentalAdjustInput) => rentalService.adjustRental(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rentals'] }),
  });
};

export const useReturnRental = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RentalReturnInput) => rentalService.returnRental(id, input),
    onSuccess: () => invalidateRentalsAndCars(queryClient),
  });
};

export const useCancelRental = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rentalService.cancelRental(id),
    onSuccess: () => invalidateRentalsAndCars(queryClient),
  });
};
