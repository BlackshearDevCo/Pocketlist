import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

function isAmazonUrl(url: string) {
  return /amazon\.(com|co\.uk|de|fr|it|es|ca|com\.au|co\.jp)/.test(url)
}

function cleanAmazonUrl(url: string): string {
  try {
    const u = new URL(url)
    // Keep only the ASIN path (/dp/ASIN or /gp/product/ASIN)
    const asinMatch = u.pathname.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/)
    if (asinMatch) {
      return `${u.origin}/dp/${asinMatch[2]}`
    }
  } catch {}
  return url
}

function extractAmazonData($: cheerio.CheerioAPI) {
  const title = $('#productTitle').text().trim() ||
    $('span#productTitle').text().trim() ||
    undefined

  // Try to get high-res image first
  const imageEl = $('#landingImage, #imgBlkFront, #ebooksImgBlkFront').first()
  const image = imageEl.attr('data-old-hires') ||
    imageEl.attr('data-a-dynamic-image')?.match(/"(https:[^"]+)"/)?.[1] ||
    imageEl.attr('src') ||
    undefined

  // Price: whole + fraction
  const whole = $('.a-price-whole').first().text().replace(/[^0-9]/g, '')
  const fraction = $('.a-price-fraction').first().text().replace(/[^0-9]/g, '') || '00'
  const price = whole ? `${whole}.${fraction}` : undefined

  return { title, image, price }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url parameter is required.' }, { status: 400 })
  }

  const fetchUrl = isAmazonUrl(url) ? cleanAmazonUrl(url) : url

  try {
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(10000),
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

    let title: string | undefined
    let image: string | undefined
    let price: string | undefined

    if (isAmazonUrl(url)) {
      const amazon = extractAmazonData($)
      title = amazon.title
      image = amazon.image
      price = amazon.price
    }

    // Fall back to OG tags (works for Amazon too if DOM parsing missed)
    title ??= getMeta(['meta[property="og:title"]', 'meta[name="twitter:title"]']) || $('title').text().trim() || undefined
    image ??= getMeta(['meta[property="og:image"]', 'meta[name="twitter:image"]'])
    price ??= getMeta(['meta[property="og:price:amount"]', 'meta[property="product:price:amount"]', 'meta[name="price"]'])

    const description =
      getMeta([
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]',
      ]) || undefined

    // Strip generic Amazon share titles
    if (title && /^check (this|out)|amazon\.com/i.test(title)) {
      title = undefined
    }

    return NextResponse.json({ title, image, description, price, url: fetchUrl })
  } catch (error) {
    console.error('[share/metadata] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata.' },
      { status: 502 }
    )
  }
}
