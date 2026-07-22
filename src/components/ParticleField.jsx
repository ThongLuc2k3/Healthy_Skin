import { useEffect, useRef } from 'react'

/* Sparkling glowing ambient particle field filling 100% of hero */
export default function ParticleField({
  density = 180,
  className = '',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let parts = []

    const resize = () => {
      const parent = canvas.parentElement || document.body
      w = parent.clientWidth || window.innerWidth
      h = parent.clientHeight || window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      parts = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 2.2 + 0.4,
        a: Math.random() * 0.6 + 0.15,
        tw: Math.random() * Math.PI * 2,
        twSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.3 ? '103, 232, 249' : '96, 165, 250',
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.tw += p.twSpeed
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        const flicker = 0.5 + Math.sin(p.tw) * 0.5
        const alpha = p.a * flicker

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (0.8 + flicker * 0.4), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`
        ctx.shadowBlur = p.r * 6
        ctx.shadowColor = `rgba(${p.color}, ${alpha * 0.9})`
        ctx.fill()
      }
      ctx.shadowBlur = 0
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full z-15 ${className}`}
      aria-hidden
    />
  )
}
