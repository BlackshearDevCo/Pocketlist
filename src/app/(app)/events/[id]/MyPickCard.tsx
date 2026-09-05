'use client'

import { useState } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

interface Props {
  eventId: string
  drawn: boolean
  myAssignment: {
    revealedAt: string | null
    receiverName: string | null
    receiverListId: string | null
  } | null
}

export default function MyPickCard({ eventId, drawn, myAssignment }: Props) {
  // isRevealed = server knows; visible = what's shown on screen right now
  const [isRevealed, setIsRevealed] = useState(!!myAssignment?.revealedAt)
  const [visible, setVisible] = useState(!!myAssignment?.revealedAt)
  const [receiverName, setReceiverName] = useState(myAssignment?.receiverName ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!drawn || !myAssignment) return null

  function fireConfetti() {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } })
    setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5, x: 0.3 }, angle: 60 }), 200)
    setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5, x: 0.7 }, angle: 120 }), 300)
  }

  async function handleCardClick() {
    if (visible) return // back face has its own hide button

    if (isRevealed) {
      // Already revealed — just flip back open
      setVisible(true)
      return
    }

    // First reveal — call API
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/events/${eventId}/draw/reveal`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reveal')
      setReceiverName(data.receiverName)
      setIsRevealed(true)
      setVisible(true)
      setTimeout(fireConfetti, 600)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8">
      <style>{`
        .flip-scene { perspective: 900px; }
        .flip-card {
          position: relative;
          width: 100%;
          height: 160px;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        .flip-card.is-flipped { transform: rotateY(180deg); }
        .flip-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .flip-front {
          background: var(--card-bg, #F2F5F3);
          border: 1px solid var(--card-border, #D2DAD5);
          cursor: pointer;
        }
        .flip-front:hover .gift-icon { transform: translateY(-3px); }
        .gift-icon { transition: transform 0.2s ease; }
        .flip-back {
          background: var(--brand-bg, #6B8F71);
          transform: rotateY(180deg);
        }
        @media (prefers-color-scheme: dark) {
          .flip-front { --card-bg: #222C25; --card-border: #2E3D32; }
          .flip-back  { --brand-bg: #4A6E50; }
        }
      `}</style>

      <h2 className="section-title mb-3">Your Secret Pick</h2>

      <div className="flip-scene" onClick={handleCardClick}>
        <div className={`flip-card ${visible ? 'is-flipped' : ''}`}>

          {/* Front — tap to reveal / tap to show */}
          <div className="flip-face flip-front select-none">
            {loading ? (
              <svg className="animate-spin w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <div className="gift-icon text-4xl mb-3">🎁</div>
                <p className="text-sm font-semibold text-warm-700">
                  {isRevealed ? 'Tap to show your pick' : 'Tap to reveal your pick'}
                </p>
                <p className="text-xs text-warm-400 mt-1">
                  {isRevealed ? 'Your pick is hidden' : 'Names have been drawn'}
                </p>
              </>
            )}
          </div>

          {/* Back — revealed name */}
          <div className="flip-face flip-back">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">You got</p>
            <p className="text-3xl font-bold text-white text-center leading-tight" style={{ textWrap: 'balance' }}>
              {receiverName}
            </p>
            <div className="flex items-center gap-4 mt-4">
              {myAssignment.receiverListId && (
                <Link
                  href={`/lists/${myAssignment.receiverListId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-white/80 hover:text-white transition-colors underline underline-offset-2"
                >
                  View their list →
                </Link>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setVisible(false) }}
                className="text-xs font-semibold text-white/60 hover:text-white/90 transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
