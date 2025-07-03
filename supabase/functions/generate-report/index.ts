
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
    const { recordingId, reportType, templateId } = await req.json()
    
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

    // Get recording and transcription
    const { data: recording, error: recordingError } = await supabaseClient
      .from('recordings')
      .select('*, patients(*)')
      .eq('id', recordingId)
      .single()

    if (recordingError) throw recordingError

    // Get template if provided
    let template = null
    if (templateId) {
      const { data: templateData, error: templateError } = await supabaseClient
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single()
      
      if (!templateError) template = templateData
    }

    // Generate report content using AI (mock implementation)
    const reportContent = await generateReportContent(
      recording.transcription || '',
      reportType,
      template?.content,
      recording.patients
    )

    // Save the generated report
    const { data: report, error: reportError } = await supabaseClient
      .from('reports')
      .insert({
        recording_id: recordingId,
        patient_id: recording.patient_id,
        report_type: reportType,
        title: `${reportType.toUpperCase()} - ${recording.patients.name}`,
        content: reportContent,
        status: 'completed',
        user_id: user.id
      })
      .select()
      .single()

    if (reportError) throw reportError

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateReportContent(
  transcription: string,
  reportType: string,
  template?: string,
  patient?: any
): Promise<string> {
  // This is a mock implementation. In a real app, you would call an AI service like OpenAI
  const currentDate = new Date().toLocaleDateString()
  
  const sampleContent = {
    consultation: `CONSULTATION NOTE

Date: ${currentDate}
Patient: ${patient?.name || 'Patient Name'}
DOB: ${patient?.date_of_birth || 'DOB'}

CHIEF COMPLAINT:
Based on the consultation recording, the patient presents with the concerns discussed during the session.

HISTORY OF PRESENT ILLNESS:
${transcription ? `From the recorded session: ${transcription.substring(0, 200)}...` : 'Details from consultation recording will be analyzed here.'}

PHYSICAL EXAMINATION:
Physical examination findings as documented during the session.

ASSESSMENT AND PLAN:
Clinical assessment and treatment plan based on the consultation.`,

    soap: `SOAP NOTE

SUBJECTIVE:
${transcription ? `Patient reports: ${transcription.substring(0, 150)}...` : 'Patient subjective information from recording.'}

OBJECTIVE:
Physical examination and vital signs as documented.

ASSESSMENT:
Clinical assessment based on subjective and objective findings.

PLAN:
Treatment plan and follow-up recommendations.`,

    followup: `Subject: Follow-up Instructions - ${patient?.name || 'Patient'}

Dear ${patient?.name || 'Patient'},

Thank you for your recent consultation. Based on our discussion:

SUMMARY:
${transcription ? transcription.substring(0, 200) + '...' : 'Summary of consultation will be provided here.'}

RECOMMENDATIONS:
• Follow-up as discussed
• Continue prescribed treatments
• Monitor symptoms as instructed

Please contact our office if you have any questions.

Best regards,
Dr. [Your Name]`,

    discharge: `DISCHARGE SUMMARY

Patient: ${patient?.name || 'Patient Name'}
Date: ${currentDate}

REASON FOR ADMISSION:
Based on consultation records.

HOSPITAL COURSE:
${transcription ? `Course summary: ${transcription.substring(0, 200)}...` : 'Hospital course details.'}

DISCHARGE INSTRUCTIONS:
Follow-up care and discharge planning as discussed.`
  }

  if (template) {
    // Replace template variables with actual data
    return template
      .replace(/{patient_name}/g, patient?.name || '[Patient Name]')
      .replace(/{date}/g, currentDate)
      .replace(/{date_of_birth}/g, patient?.date_of_birth || '[DOB]')
      .replace(/{transcription}/g, transcription || '[Transcription]')
  }

  return sampleContent[reportType as keyof typeof sampleContent] || sampleContent.consultation
}
