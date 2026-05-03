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
    console.log('[apply] GAS status:', res.status, '| body:', text.slice(0, 300))

    // GAS can return 200 but with an error payload
    try {
      const json = JSON.parse(text)
      if (json.error) {
        console.error('[apply] GAS returned error:', json.error)
        return NextResponse.json({ error: 'Sheet write failed' }, { status: 502 })
      }
      if (json.success) {
        return NextResponse.json({ success: true })
      }
    } catch {
      // response wasn't JSON — fall through to status check
    }

    if (!res.ok) {
      console.error('[apply] GAS non-ok response:', res.status, text.slice(0, 300))
      return NextResponse.json({ error: 'Sheet write failed' }, { status: 502 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[apply] fetch threw:', err)
    return NextResponse.json({ error: 'Could not reach Google Sheet' }, { status: 502 })
  }
}
