import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GOOGLE_SHEET_APPLY_WEBHOOK

  if (!webhookUrl) {
    console.error('GOOGLE_SHEET_APPLY_WEBHOOK not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const body = await req.json()

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Sheet write failed' }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
