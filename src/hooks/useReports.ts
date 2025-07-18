
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, patients(*), recordings(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      recordingId, 
      reportType, 
      templateId,
      aiProvider = 'openai',
      apiKey,
      customInstructions
    }: { 
      recordingId: string; 
      reportType: string; 
      templateId?: string;
      aiProvider?: string;
      apiKey: string;
      customInstructions?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { 
          recordingId, 
          reportType, 
          templateId, 
          aiProvider, 
          apiKey,
          customInstructions 
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
