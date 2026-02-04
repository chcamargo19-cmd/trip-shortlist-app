mkdir -p app/api/extract

import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Extract accommodation details from this URL or content. Return ONLY valid JSON:

{
  "name": "Hotel name",
  "description": "Short description",
  "vibe": "romantic/quiet/luxury/etc",
  "tags": ["central", "pool", "family-friendly"],
  "price_per_night": 150.50,
  "total_price": 1053.50,
  "currency": "EUR",
  "nights": 7,
  "refundable": true,
  "image_url": "https://example.com/image.jpg"
}

URL: ${url}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const jsonText = response.text().replace(/```json\n?|\n?```/g, '').trim()
    
    return NextResponse.json(JSON.parse(jsonText))
  } catch (error) {
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
