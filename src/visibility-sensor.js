import React from 'react'
import { useGetter } from '@dhmk/hooks'

const isPartiallyVisible = el => {
  const rect = el.getBoundingClientRect()
  return rect.top >= 0 && rect.top <= window.innerHeight
}

export const IntervalPartialSensor = ({ children }) => {
  const getCb = useGetter(children)
  const domRef = React.useRef()
  React.useEffect(() => {
    let mute

    const check = () => {
      const vis = isPartiallyVisible(domRef.current)
      !mute && vis && getCb()()
      mute = vis
    }

    check()
    const tid = setInterval(check, 500)
    return () => clearInterval(tid)
  }, [])
  return <div ref={domRef} />
}
