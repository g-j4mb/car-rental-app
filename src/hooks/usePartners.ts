import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../services/partner.service';
import { PartnerInput } from '../lib/validation';

export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: partnerService.getPartners,
  });
};

export const usePartner = (id: string) => {
  return useQuery({
    queryKey: ['partners', id],
    queryFn: () => partnerService.getPartner(id),
    enabled: !!id,
  });
};

export const useAddPartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PartnerInput) => partnerService.addPartner(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });
};

export const useUpdatePartner = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PartnerInput) => partnerService.updatePartner(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });
};

export const useRemovePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => partnerService.removePartner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });
};
