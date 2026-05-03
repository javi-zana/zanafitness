import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GOOGLE_SHEET_APPLY_WEBHOOK

  if (!webhookUrl) {
    console.error('[apply] GOOGLE_SHEET_APPLY_WEBHOOK env var not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'follow',
    })

    const text = await res.text()
    console.log('[apply] GAS status:', res.status, '| body:', text.slice(0, 500))

    // Only succeed if GAS explicitly returns { success: true }
    // Any other response (HTML login page, error, etc.) is treated as failure
    try {
      const json = JSON.parse(text)
      if (json.success === true) {
        return NextResponse.json({ success: true })
      }
      console.error('[apply] GAS did not return success:', json)
      return NextResponse.json({ error: 'Sheet write failed' }, { status: 502 })
    } catch {
      // Response was not JSON — likely an HTML redirect/login page
      console.error('[apply] GAS returned non-JSON (possible auth redirect):', text.slice(0, 300))
      return NextResponse.json({ error: 'Sheet write failed' }, { status: 502 })
    }

  } catch (err) {
    console.error('[apply] fetch threw:', err)
    return NextResponse.json({ error: 'Could not reach Google Sheet' }, { status: 502 })
  }
}
