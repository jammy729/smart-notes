
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
    const { recordingId, reportType, templateId, aiProvider = 'openai', apiKey, customInstructions } = await req.json()
    
    if (!apiKey) {
      throw new Error('API key is required')
    }
    
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

    // Generate report content using real AI
    const reportContent = await generateReportWithAI(
      recording.transcription || '',
      reportType,
      template?.content,
      recording.patients,
      aiProvider,
      apiKey,
      customInstructions
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
    console.error('Error generating report:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateReportWithAI(
  transcription: string,
  reportType: string,
  template?: string,
  patient?: any,
  aiProvider: string = 'openai',
  apiKey: string = '',
  customInstructions?: string
): Promise<string> {
  const currentDate = new Date().toLocaleDateString()
  
  // Create the prompt for AI
  const systemPrompt = `You are a medical AI assistant specializing in generating professional medical reports. 
  
IMPORTANT HIPAA COMPLIANCE INSTRUCTIONS:
- Only use the provided patient information
- Do not generate or assume any medical information not present in the transcription
- Maintain professional medical terminology
- Ensure accuracy and clinical appropriateness
- Follow standard medical documentation practices

Generate a ${reportType} report based on the provided consultation transcription.`

  const userPrompt = `
Patient Information:
- Name: ${patient?.name || '[Patient Name]'}
- Date of Birth: ${patient?.date_of_birth || '[DOB]'}
- Date: ${currentDate}

Consultation Transcription:
${transcription || 'No transcription available'}

${template ? `Template to follow:\n${template}` : ''}

${customInstructions ? `Additional Instructions:\n${customInstructions}` : ''}

Please generate a professional ${reportType} report based on this information.`

  try {
    let aiResponse = ''
    
    switch (aiProvider) {
      case 'openai':
        aiResponse = await callOpenAI(systemPrompt, userPrompt, apiKey)
        break
      case 'groq':
        aiResponse = await callGroq(systemPrompt, userPrompt, apiKey)
        break
      case 'anthropic':
        aiResponse = await callAnthropic(systemPrompt, userPrompt, apiKey)
        break
      default:
        throw new Error(`Unsupported AI provider: ${aiProvider}`)
    }
    
    return aiResponse
  } catch (error) {
    console.error('AI API Error:', error)
    // Fallback to template-based generation
    return generateFallbackReport(transcription, reportType, template, patient, currentDate)
  }
}

async function callOpenAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Failed to generate report'
}

async function callGroq(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Failed to generate report'
}

async function callAnthropic(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0]?.text || 'Failed to generate report'
}

function generateFallbackReport(
  transcription: string,
  reportType: string,
  template?: string,
  patient?: any,
  currentDate?: string
): string {
  // Fallback template-based generation (existing logic)
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
    return template
      .replace(/{patient_name}/g, patient?.name || '[Patient Name]')
      .replace(/{date}/g, currentDate || '[Date]')
      .replace(/{date_of_birth}/g, patient?.date_of_birth || '[DOB]')
      .replace(/{transcription}/g, transcription || '[Transcription]')
  }

  return sampleContent[reportType as keyof typeof sampleContent] || sampleContent.consultation
}
