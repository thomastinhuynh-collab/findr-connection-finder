import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendEmailTo } from '../_shared/brevo.ts'
import { CONTACT_SENDER } from '../_shared/emails.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const sent = await sendEmailTo(
    'thomas@findrapp.fr',
    'waitlist_welcome',
    { firstName: 'Thomas' },
    CONTACT_SENDER,
  )
  return new Response(JSON.stringify({ sent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
