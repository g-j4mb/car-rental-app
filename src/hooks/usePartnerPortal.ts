import { useQuery } from '@tanstack/react-query';
import { partnerPortalService } from '../services/partnerPortal.service';

export const useMyPartner = (partnerId?: string) =>
  useQuery({
    queryKey: ['partner-portal', 'partner', partnerId],
    queryFn: () => partnerPortalService.getMyPartner(partnerId!),
    enabled: !!partnerId,
  });

export const useMyCars = (partnerId?: string) =>
  useQuery({
    queryKey: ['partner-portal', 'cars', partnerId],
    queryFn: () => partnerPortalService.getMyCars(partnerId!),
    enabled: !!partnerId,
  });

export const useMyRentals = (partnerId?: string) =>
  useQuery({
    queryKey: ['partner-portal', 'rentals', partnerId],
    queryFn: () => partnerPortalService.getMyRentals(partnerId!),
    enabled: !!partnerId,
  });

export const useMyCarExpenses = (partnerId?: string) =>
  useQuery({
    queryKey: ['partner-portal', 'car_expenses', partnerId],
    queryFn: () => partnerPortalService.getMyCarExpenses(partnerId!),
    enabled: !!partnerId,
  });

export const useMyPayments = (partnerId?: string) =>
  useQuery({
    queryKey: ['partner-portal', 'payments', partnerId],
    queryFn: () => partnerPortalService.getMyPayments(partnerId!),
    enabled: !!partnerId,
  });
