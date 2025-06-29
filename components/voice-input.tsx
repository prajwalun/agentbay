"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Square } from "lucide-react"
import { voiceApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  onCancel: () => void
}

export function VoiceInput({ onTranscript, onCancel }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      // Cleanup
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleTranscribe = async () => {
    if (!audioBlob) return

    setTranscribing(true)
    try {
      const transcript = await voiceApi.transcribe(audioBlob)
      onTranscript(transcript)
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTranscribing(false)
    }
  }

  return (
    <div className="text-center space-y-6">
      <h3 className="text-lg font-semibold text-white">Voice Input</h3>

      {/* Recording Indicator */}
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isRecording ? "bg-red-500 recording-pulse" : audioBlob ? "bg-green-500" : "bg-gray-500"
          }`}
        >
          {isRecording ? (
            <Mic className="h-8 w-8 text-white" />
          ) : audioBlob ? (
            <Square className="h-8 w-8 text-white" />
          ) : (
            <MicOff className="h-8 w-8 text-white" />
          )}
        </div>

        <p className="text-white/70">
          {isRecording
            ? "Recording... Click stop when finished"
            : audioBlob
              ? "Recording complete. Click transcribe to convert to text."
              : "Click the microphone to start recording"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!isRecording && !audioBlob && (
          <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600">
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="outline" className="glass border-white/20 bg-transparent">
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        )}

        {audioBlob && !transcribing && (
          <>
            <Button onClick={handleTranscribe}>Transcribe</Button>
            <Button variant="outline" onClick={() => setAudioBlob(null)} className="glass border-white/20">
              Re-record
            </Button>
          </>
        )}

        {transcribing && <Button disabled>Transcribing...</Button>}

        <Button variant="outline" onClick={onCancel} className="glass border-white/20 bg-transparent">
          Cancel
        </Button>
      </div>
    </div>
  )
}
