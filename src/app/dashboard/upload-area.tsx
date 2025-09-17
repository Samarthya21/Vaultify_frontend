"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, FileIcon, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type UploadProgress = {
  id: string
  name: string
  size: number
  progress: number
  status: "idle" | "uploading" | "done" | "error"
  error?: string
}

interface UploadAreaProps {
  onFilesUploaded?: () => void
}

export default function UploadArea({ onFilesUploaded }: UploadAreaProps) {
  const [uploadItems, setUploadItems] = useState<UploadProgress[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // add new files to queue
  const addFiles = (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)

    const newItems: UploadProgress[] = fileArray.map((f, i) => ({
      id: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      size: f.size,
      progress: 0,
      status: "idle",
    }))

    setUploadItems((prev) => [...prev, ...newItems])
    setTimeout(() => uploadFiles(newItems, fileArray), 50)
  }

  // upload logic
  const uploadFiles = async (newItems: UploadProgress[], files: File[]) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      alert("Not authenticated. Please login first.")
      return
    }

    await Promise.all(
      files.map(
        (file, idx) =>
          new Promise<void>((resolve) => {
            const itemId = newItems[idx].id

            const form = new FormData()
            form.append("file", file, file.name)

            const xhr = new XMLHttpRequest()
            xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/upload`, true)
            xhr.setRequestHeader("Authorization", `Bearer ${token}`)

            // progress updates
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100)
                setUploadItems((prev) =>
                  prev.map((it) =>
                    it.id === itemId ? { ...it, progress: percent, status: "uploading" } : it,
                  ),
                )
              }
            }

            // completion
            xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                  setUploadItems((prev) =>
                    prev.map((it) =>
                      it.id === itemId ? { ...it, progress: 100, status: "done" } : it,
                    ),
                  )

                
                  setTimeout(() => {
                    setUploadItems((prev) => prev.filter((it) => it.id !== itemId))
                  }, 2000)

                  onFilesUploaded?.()
                  resolve()
                } else {
                  setUploadItems((prev) =>
                    prev.map((it) =>
                      it.id === itemId
                        ? { ...it, status: "error", error: xhr.responseText || `status ${xhr.status}` }
                        : it,
                    ),
                  )
                  resolve()
                }
              }
            }

            xhr.onerror = () => {
              setUploadItems((prev) =>
                prev.map((it) =>
                  it.id === itemId ? { ...it, status: "error", error: "network error" } : it,
                ),
              )
              resolve()
            }

            xhr.send(form)
          }),
      ),
    )
  }

  // drag + drop 
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.currentTarget.value = "" 
  }

  return (
    <div className="mb-8">
      <Card
        className={`transition-all duration-200 ${
          dragActive
            ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
            : "border-dashed border-2 hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <CardContent className="p-8 text-center" onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
          <div className="flex flex-col items-center space-y-4">
            <div
              className={`p-4 rounded-full transition-colors ${
                dragActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Upload className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{dragActive ? "Drop files here" : "Upload your files"}</h3>
              <p className="text-sm text-muted-foreground">Drag and drop files here, or click to select files</p>
            </div>

            {/* hidden input + trigger via button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onFileInput}
              accept="*/*"
            />
            <Button size="lg" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Select Files
            </Button>

            <p className="text-xs text-muted-foreground">Supports multiple files • Maximum 100MB per file</p>
          </div>
        </CardContent>
      </Card>

      {uploadItems.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Upload Progress</h4>
          {uploadItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {item.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      {item.status === "done" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {item.status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                      {item.status === "idle" && <FileIcon className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">
                      {item.status === "uploading" && `${item.progress}%`}
                      {item.status === "done" && <span className="text-green-600">Complete</span>}
                      {item.status === "error" && <span className="text-destructive">Failed</span>}
                    </div>
                  </div>
                </div>

                {item.status === "uploading" && (
                  <Progress value={item.progress} className="h-2" />
                )}

                {item.status === "error" && item.error && (
                  <p className="text-xs text-destructive mt-2">{item.error}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
