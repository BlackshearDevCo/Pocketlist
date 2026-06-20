import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url parameter is required.' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Pocketlist/1.0; +https://pocketlist.app)',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: 502 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const getMeta = (selectors: string[]): string | undefined => {
      for (const selector of selectors) {
        const content = $(selector).attr('content')
        if (content) return content
      }
      return undefined
    }

    const title =
      getMeta(['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
      $('title').text() ||
      undefined

    const image =
      getMeta(['meta[property="og:image"]', 'meta[name="twitter:image"]']) ||
      undefined

    const description =
      getMeta([
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]',
      ]) || undefined

    const price =
      getMeta([
        'meta[property="og:price:amount"]',
        'meta[property="product:price:amount"]',
        'meta[name="price"]',
      ]) || undefined

    return NextResponse.json({ title, image, description, price, url })
  } catch (error) {
    console.error('[share/metadata] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata.' },
      { status: 502 }
    )
  }
}
