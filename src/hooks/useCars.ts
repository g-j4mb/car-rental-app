import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carService } from '../services/car.service';
import { partnerService } from '../services/partner.service';
import { CarInput, CarEditInput } from '../lib/validation';

export const useCars = () => {
  return useQuery({
    queryKey: ['cars'],
    queryFn: carService.getCars,
  });
};

export const useCar = (id: string) => {
  return useQuery({
    queryKey: ['cars', id],
    queryFn: () => carService.getCar(id),
    enabled: !!id,
  });
};

export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: partnerService.getPartners,
  });
};

export const useAddCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CarInput) => carService.addCar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
};

export const useUpdateCar = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CarEditInput) => carService.updateCar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
};

export const useRemoveCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => carService.removeCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
};
