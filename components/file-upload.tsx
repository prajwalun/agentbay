"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, X, File } from "lucide-react"
import { fileApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onUpload: (files: string[]) => void
  onCancel: () => void
}

export function FileUpload({ onUpload, onCancel }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": [".txt", ".md", ".csv"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadedFiles = await fileApi.uploadFiles(files)
      onUpload(uploadedFiles.map((f) => f.name))
      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Upload Files</h3>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-white/30 hover:border-white/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-white/70" />
        {isDragActive ? (
          <p className="text-white">Drop the files here...</p>
        ) : (
          <div className="text-white/70">
            <p>Drag & drop files here, or click to select</p>
            <p className="text-sm mt-1">Supports: PDF, DOC, TXT, Images (max 10MB)</p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-white">Selected Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between glass p-2 rounded">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-white/70" />
                <span className="text-sm text-white">{file.name}</span>
                <span className="text-xs text-white/50">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleUpload} disabled={files.length === 0 || uploading} className="flex-1">
          {uploading ? "Uploading..." : `Upload ${files.length} file(s)`}
        </Button>
        <Button variant="outline" onClick={onCancel} className="glass border-white/20 bg-transparent">
          Cancel
        </Button>
      </div>
    </div>
  )
}
