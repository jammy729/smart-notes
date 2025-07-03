
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recordingId, audioBlob } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('No user found')

    // Mock transcription process (in real app, use speech-to-text service)
    const mockTranscription = `Doctor: Good morning, how are you feeling today?
Patient: I've been experiencing some chest pain and shortness of breath over the past few days.
Doctor: Can you describe the pain? Is it sharp, dull, or pressure-like?
Patient: It's more of a sharp pain that comes and goes, especially when I take deep breaths.
Doctor: I see. Any other symptoms? Dizziness, nausea, or palpitations?
Patient: No, just the chest pain and some mild shortness of breath when I exert myself.
Doctor: Let me examine you. Your vital signs look stable. Heart rate is 78, blood pressure 130/85.
Doctor: Based on the examination, this appears to be musculoskeletal in nature, likely costochondritis.
Doctor: I recommend NSAIDs for pain management and rest. Follow up if symptoms persist or worsen.`

    // Update the recording with transcription
    const { error: updateError } = await supabaseClient
      .from('recordings')
      .update({
        transcription: mockTranscription,
        status: 'completed'
      })
      .eq('id', recordingId)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ 
      transcription: mockTranscription,
      status: 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
