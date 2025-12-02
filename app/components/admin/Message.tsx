import React from 'react'

interface MessageProps {
  senderId: string | number;
}

export default function Message({senderId}: MessageProps) {
  return (
    <div>Message</div>
  )
}
