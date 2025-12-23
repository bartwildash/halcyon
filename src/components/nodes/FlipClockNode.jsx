import React, { useState, useEffect, useRef } from 'react';
import { SwayWrapper, SmartHandle } from '../SpatialCommon';
import { Position } from '@xyflow/react';

// ============================================================================
// Types
// ============================================================================

// ============================================================================
// Main Component
// ============================================================================

export const FlipClockNode = ({ data }) => {
  // State: current time (updates every second)
  const [time, setTime] = useState(new Date())

  // State: flip animation flags for each card
  const [flipping, setFlipping] = useState({
    hourTens: false,
    hourOnes: false,
    minuteTens: false,
    minuteOnes: false,
    day: false,
    dateTens: false,
    dateOnes: false,
    month: false,
  })

  // State: 3D flip to settings
  const [isFlipped, setIsFlipped] = useState(false)
  const [use24Hour, setUse24Hour] = useState(false)
  const [timezone, setTimezone] = useState('local')

  // Refs: previous time for change detection
  const prevTime = useRef(time)
  const lastClickTime = useRef(0)

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Trigger flip animations when digits change
  useEffect(() => {
    const prev = prevTime.current
    const curr = time

    const prevHourTens = Math.floor(prev.getHours() / 10)
    const currHourTens = Math.floor(curr.getHours() / 10)
    const prevHourOnes = prev.getHours() % 10
    const currHourOnes = curr.getHours() % 10
    const prevMinuteTens = Math.floor(prev.getMinutes() / 10)
    const currMinuteTens = Math.floor(curr.getMinutes() / 10)
    const prevMinuteOnes = prev.getMinutes() % 10
    const currMinuteOnes = curr.getMinutes() % 10
    const prevDay = prev.getDay()
    const currDay = curr.getDay()
    const prevDateTens = Math.floor(prev.getDate() / 10)
    const currDateTens = Math.floor(curr.getDate() / 10)
    const prevDateOnes = prev.getDate() % 10
    const currDateOnes = curr.getDate() % 10
    const prevMonth = prev.getMonth()
    const currMonth = curr.getMonth()

    if (currHourTens !== prevHourTens) triggerFlip('hourTens')
    if (currHourOnes !== prevHourOnes) triggerFlip('hourOnes')
    if (currMinuteTens !== prevMinuteTens) triggerFlip('minuteTens')
    if (currMinuteOnes !== prevMinuteOnes) triggerFlip('minuteOnes')
    if (currDay !== prevDay) triggerFlip('day')
    if (currDateTens !== prevDateTens) triggerFlip('dateTens')
    if (currDateOnes !== prevDateOnes) triggerFlip('dateOnes')
    if (currMonth !== prevMonth) triggerFlip('month')

    prevTime.current = curr
  }, [time])

  const triggerFlip = (card) => {
    setFlipping(prev => ({ ...prev, [card]: true }))
    setTimeout(() => {
      setFlipping(prev => ({ ...prev, [card]: false }))
    }, 600)
  }

  // Format helpers
  const hours = time.getHours()
  const minutes = time.getMinutes()
  const hourTens = Math.floor(hours / 10)
  const hourOnes = hours % 10
  const minuteTens = Math.floor(minutes / 10)
  const minuteOnes = minutes % 10
  
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  const dayName = days[time.getDay()]
  const date = time.getDate()
  const dateTens = Math.floor(date / 10)
  const dateOnes = date % 10
  const monthName = months[time.getMonth()]

  return (
    <SwayWrapper>
      <div
        style={{
          // Removed fixed positioning and zIndex for React Flow compatibility
          cursor: 'grab',
          userSelect: 'none',
          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
          perspective: '1000px',
          position: 'relative'
        }}
      >
        <SmartHandle type="target" position={Position.Top} />
        <SmartHandle type="source" position={Position.Bottom} />
        
        {/* Flip container with 3D transform */}
        <div
          style={{
            width: 300,
            height: 342,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        >
          {/* FRONT FACE - Clock */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
            }}
            onClick={(e) => {
              // Detect double-click to flip to settings
              const now = Date.now()
              const timeSinceLastClick = now - lastClickTime.current
              lastClickTime.current = now

              if (timeSinceLastClick < 300) {
                setIsFlipped(true)
              }
            }}
          >
            {/* Outer frame - raised metallic rim */}
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #e8e8e8 0%, #cecece 50%, #d8d8d8 100%)',
                borderRadius: 42,
                padding: 10,
                position: 'relative',
                boxShadow: `
                  inset 0 2px 8px rgba(255, 255, 255, 0.9),
                  inset 0 -3px 8px rgba(0, 0, 0, 0.2),
                  0 12px 24px rgba(0, 0, 0, 0.2),
                  0 4px 8px rgba(0, 0, 0, 0.15)
                `,
                border: '3px solid #b8b8b8',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
          {/* Inner recessed border - dark dip */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              borderRadius: 32, // Adjusted: 42 - 10
              padding: 6,
              boxShadow: `
                inset 0 3px 6px rgba(0, 0, 0, 0.8),
                inset 0 -1px 3px rgba(255, 255, 255, 0.1)
              `,
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            {/* Layer 1: Interior refractive highlight */}
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                right: 6,
                bottom: 6,
                borderRadius: 26, // Adjusted: 32 - 6
                background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 30%, rgba(0,0,0,0.45) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Layer 2: Shadowed inner lip */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                bottom: 12,
                borderRadius: 20,
                background: 'rgba(0,0,0,0.5)',
                opacity: 0.7,
                pointerEvents: 'none',
              }}
            />
            {/* Clock face - light background */}
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #fafafa 0%, #ececec 100%)',
                borderRadius: 26, // Adjusted: 32 - 6
                padding: '0px 12px 4px 12px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}
            >
              {/* Gloss overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  right: 8,
                  bottom: 8,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 40%, rgba(0,0,0,0.05) 100%)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  pointerEvents: 'none',
                  zIndex: 1000,
                }}
              />
          {/* Internal container */}
          <div
            style={{
              maxWidth: 180,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              paddingBottom: '3pt',
            }}
          >
            {/* Time row (HH MM) */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <DoubleFlipCard
              digit1={hourTens}
              digit2={hourOnes}
              isFlipping1={flipping.hourTens}
              isFlipping2={flipping.hourOnes}
            />

            <DoubleFlipCard
              digit1={minuteTens}
              digit2={minuteOnes}
              isFlipping1={flipping.minuteTens}
              isFlipping2={flipping.minuteOnes}
            />
          </div>

            {/* Day row */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <FlipCard text={dayName} isFlipping={flipping.day} isWide />
            </div>

            {/* Date row */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', width: '100%' }}>
              <DoubleFlipCard
                digit1={dateTens}
                digit2={dateOnes}
                isFlipping1={flipping.dateTens}
                isFlipping2={flipping.dateOnes}
              />
              <FlipCard text={monthName} isFlipping={flipping.month} />
            </div>
              </div>
            </div>
            </div>
          </div>
          </div>
          {/* End FRONT FACE */}

          {/* BACK FACE - Settings (Simplified for React Flow) */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            onClick={(e) => {
              const now = Date.now()
              const timeSinceLastClick = now - lastClickTime.current
              lastClickTime.current = now

              if (timeSinceLastClick < 300) {
                setIsFlipped(false)
              }
            }}
          >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #e8e8e8 0%, #cecece 50%, #d8d8d8 100%)',
              borderRadius: 42,
              padding: 10,
              position: 'relative',
              boxShadow: `
                inset 0 2px 8px rgba(255, 255, 255, 0.9),
                inset 0 -3px 8px rgba(0, 0, 0, 0.2),
                0 12px 24px rgba(0, 0, 0, 0.2),
                0 4px 8px rgba(0, 0, 0, 0.15)
              `,
              border: '3px solid #b8b8b8',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#666', boxSizing: 'border-box' }}>
               Double click to return
            </div>
          </div>
          </div>
        </div>
      </div>
    </SwayWrapper>
  )
}

// Sub-components (Copied directly)
function DoubleFlipCard({ digit1, digit2, isFlipping1, isFlipping2 }) {
  const width = 80
  const height = 90

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        perspective: 1200,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: 'linear-gradient(180deg, #1e1e1e 0%, #0d0d0d 50%, #1a1a1a 100%)',
          borderRadius: 8,
          boxShadow: `
            inset 0 3px 8px rgba(0, 0, 0, 0.8),
            inset 0 -2px 6px rgba(0, 0, 0, 0.6),
            inset 2px 0 4px rgba(0, 0, 0, 0.5),
            inset -2px 0 4px rgba(0, 0, 0, 0.5)
          `,
          border: '2px solid #000',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        <div style={{ width: '50%', height: '100%', position: 'relative' }}>
          <FlipDigit digit={digit1} isFlipping={isFlipping1} />
        </div>
        <div style={{ width: '50%', height: '100%', position: 'relative' }}>
          <FlipDigit digit={digit2} isFlipping={isFlipping2} />
        </div>
      </div>
    </div>
  )
}

function FlipDigit({ digit, isFlipping }) {
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, #242424 0%, #0d0d0d 100%)', borderBottom: '1.5px solid #000', boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.6)', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none' }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: '#fafafa', fontFamily: 'system-ui', textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)', lineHeight: 1 }}>{digit}</div>
      </div>
      {isFlipping && (
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '50%', transformOrigin: 'top', transformStyle: 'preserve-3d', background: 'linear-gradient(180deg, #242424 0%, #0d0d0d 100%)', overflow: 'hidden', animation: 'flip 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.8)', borderRadius: '0 0 8px 8px', zIndex: 5 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: '#fafafa', fontFamily: 'system-ui', textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)', lineHeight: 1, transform: 'translateY(-50%)' }}>{digit}</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#000', transform: 'translateY(-1px)', zIndex: 10, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }} />
      <style>{`@keyframes flip { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(-180deg); } }`}</style>
    </>
  )
}

function FlipCard({ digit, text, isFlipping, isWide }) {
  const content = text || digit?.toString() || '0'
  const width = isWide ? 190 : text ? 80 : 55
  const height = isWide ? 50 : text ? 90 : 62

  return (
    <div style={{ width, height, position: 'relative', perspective: 1200 }}>
      <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(180deg, #1e1e1e 0%, #0d0d0d 50%, #1a1a1a 100%)', borderRadius: 8, boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.8), inset 0 -2px 6px rgba(0, 0, 0, 0.6)', border: '2px solid #000', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, #242424 0%, #0d0d0d 100%)', borderBottom: '1.5px solid #000', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none' }}>
          <div style={{ fontSize: isWide ? 32 : text ? 38 : 52, fontWeight: 900, color: '#fafafa', fontFamily: 'Impact, sans-serif', letterSpacing: isWide ? 4 : text ? 1 : 0, textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)', lineHeight: 1, transform: isWide || text ? 'scaleY(1.3)' : 'none', transformOrigin: 'center' }}>{content}</div>
        </div>
        {isFlipping && (
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '50%', transformOrigin: 'top', transformStyle: 'preserve-3d', background: 'linear-gradient(180deg, #242424 0%, #0d0d0d 100%)', overflow: 'hidden', animation: 'flip 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)', zIndex: 5 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
              <div style={{ fontSize: isWide ? 32 : text ? 38 : 52, fontWeight: 900, color: '#fafafa', fontFamily: 'Impact, sans-serif', transform: isWide || text ? 'translateY(-50%) scaleY(1.3)' : 'translateY(-50%)' }}>{content}</div>
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#000', transform: 'translateY(-1px)', zIndex: 10 }} />
      </div>
    </div>
  )
}

