import { useState, useRef, useCallback } from 'react'

export function useRecorder() {
  const [recording, setRecording] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = useCallback((canvasElement, audioElement) => {
    chunksRef.current = []
    setRecordedUrl(null)

    const canvasStream = canvasElement.captureStream(30)

    let combinedStream = canvasStream
    if (audioElement && audioElement.captureStream) {
      try {
        const audioStream = audioElement.captureStream()
        const tracks = [...canvasStream.getTracks(), ...audioStream.getTracks()]
        combinedStream = new MediaStream(tracks)
      } catch {
        // Audio capture may not be supported
      }
    }

    const recorder = new MediaRecorder(combinedStream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedUrl(url)
    }

    recorder.start(100)
    mediaRecorderRef.current = recorder
    setRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }, [])

  const downloadRecording = useCallback(() => {
    if (!recordedUrl) return
    const a = document.createElement('a')
    a.href = recordedUrl
    a.download = 'memorial-slideshow.webm'
    a.click()
  }, [recordedUrl])

  return { recording, recordedUrl, startRecording, stopRecording, downloadRecording }
}
