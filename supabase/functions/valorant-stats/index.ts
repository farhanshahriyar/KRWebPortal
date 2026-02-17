import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const HENRIK_API_KEY = Deno.env.get('HENRIK_DEV_API')!
const HENRIK_BASE_URL = 'https://api.henrikdev.xyz'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Parse request body (supabase.functions.invoke sends data in body)
        const { name, tag } = await req.json()

        if (!name || !tag) {
            return new Response(
                JSON.stringify({ error: 'Missing name or tag parameter' }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    }
                }
            )
        }

        console.log(`Fetching account for ${name}#${tag} to determine region...`)

        // 1. Fetch Account Data FIRST to get the region
        const accountRes = await fetch(`${HENRIK_BASE_URL}/valorant/v1/account/${name}/${tag}`, {
            headers: { 'Authorization': HENRIK_API_KEY }
        })
        const account = await accountRes.json()

        if (account.status !== 200) {
            return new Response(
                JSON.stringify({
                    error: 'Player not found',
                    details: account.errors || 'Account does not exist'
                }),
                {
                    status: 404,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    }
                }
            )
        }

        // Extract region from account data (e.g. 'ap', 'na', 'eu')
        const region = account.data.region;
        console.log(`Detected region: ${region}`)

        // 2. Fetch MMR and Matches in parallel using the CORRECT region
        const [mmrRes, matchesRes] = await Promise.all([
            fetch(`${HENRIK_BASE_URL}/valorant/v2/mmr/${region}/${name}/${tag}`, {
                headers: { 'Authorization': HENRIK_API_KEY }
            }),
            fetch(`${HENRIK_BASE_URL}/valorant/v3/matches/${region}/${name}/${tag}?size=5`, {
                headers: { 'Authorization': HENRIK_API_KEY }
            })
        ])

        const mmr = await mmrRes.json()
        const matches = await matchesRes.json()

        console.log('API responses:', {
            account: account.status,
            region: region,
            mmr: mmr.status,
            matches: matches.status
        })

        // MMR and matches are optional - player might not have competitive data
        // Return whatever data we have
        const response = {
            account: account.data,
            mmr: mmr.status === 200 ? mmr.data : null,
            matches: matches.status === 200 ? matches.data : [],
            fetchedAt: new Date().toISOString()
        }

        return new Response(
            JSON.stringify(response),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                }
            }
        )

    } catch (error) {
        console.error('Error fetching Valorant stats:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error.message }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                }
            }
        )
    }
})
