
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useRecordings = () => {
  return useQuery({
    queryKey: ['recordings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recordings')
        .select('*, patients(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateRecording = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ patientId, title }: { patientId: string; title: string }) => {
      const { data, error } = await supabase
        .from('recordings')
        .insert({
          patient_id: patientId,
          title,
          status: 'recording'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });
};

export const useProcessAudio = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ recordingId, audioBlob }: { recordingId: string; audioBlob: Blob }) => {
      const { data, error } = await supabase.functions.invoke('process-audio', {
        body: { recordingId, audioBlob }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });
};
