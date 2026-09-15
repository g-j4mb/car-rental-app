import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { customerService } from '../services/customer.service';
import { CustomerInput } from '../lib/validation';

const CUSTOMERS_PAGE_SIZE = 30;

// Loads all customers at once — used where a full in-memory list is needed
// (e.g. the rental customer picker).
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getCustomers,
  });
};

// Paginated + searchable list for the customers screen (infinite scroll).
export const useCustomersInfinite = (search: string) => {
  return useInfiniteQuery({
    queryKey: ['customers', 'list', search],
    queryFn: ({ pageParam }) =>
      customerService.getCustomersPage({ search, page: pageParam, pageSize: CUSTOMERS_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) => customerService.addCustomer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useUpdateCustomer = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) => customerService.updateCustomer(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useRemoveCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.removeCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
};
