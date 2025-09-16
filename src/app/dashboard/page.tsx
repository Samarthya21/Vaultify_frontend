"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Filter,
  Download,
  Share2,
  FileText,
  ImageIcon,
  Video,
  Archive,
  MoreHorizontal,
  ChevronDown,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import type { DateRange } from "react-day-picker"

type FileMetadata = {
  id: string
  filename: string
  mime: string
  size: number
  uploaded_at: string
  sha256: string
  storage_key: string
  tags?: string[]
  uploader?: string
}

type FilterState = {
  search: string
  mimeType: string
  sizeRange: [number, number]
  dateRange: DateRange | undefined
  tags: string[]
  uploader: string
}

export default function DashboardPage() {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    mimeType: "all",
    sizeRange: [0, 100000],
    dateRange: undefined,
    tags: [],
    uploader: "",
  })

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token") // stored at login
        if (!token) {
          setError("Authentication required. Please log in to view your files.")
          setLoading(false)
          return
        }

        const res = await fetch("http://localhost:8080/api/v1/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch files: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        setFiles(data)
        setFilteredFiles(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching files:", err)
        setError(err instanceof Error ? err.message : "Failed to load files")
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [])

  useEffect(() => {
    const filtered = files.filter((file) => {
      const matchesSearch = file.filename.toLowerCase().includes(filters.search.toLowerCase())
      const matchesMimeType = filters.mimeType === "all" || file.mime.includes(filters.mimeType)
      const matchesSize = file.size >= filters.sizeRange[0] * 1024 && file.size <= filters.sizeRange[1] * 1024
      const matchesUploader = !filters.uploader || file.uploader?.includes(filters.uploader)

      let matchesDateRange = true
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const fileDate = new Date(file.uploaded_at)
        if (filters.dateRange.from && fileDate < filters.dateRange.from) matchesDateRange = false
        if (filters.dateRange.to && fileDate > filters.dateRange.to) matchesDateRange = false
      }

      const matchesTags = filters.tags.length === 0 || filters.tags.some((tag) => file.tags?.includes(tag))

      return matchesSearch && matchesMimeType && matchesSize && matchesDateRange && matchesTags && matchesUploader
    })

    setFilteredFiles(filtered)
  }, [files, filters])

  const getFileIcon = (mime: string) => {
    if (mime.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />
    if (mime.startsWith("video/")) return <Video className="h-5 w-5 text-purple-500" />
    if (mime.includes("pdf") || mime.includes("document")) return <FileText className="h-5 w-5 text-red-500" />
    if (mime.includes("zip") || mime.includes("archive")) return <Archive className="h-5 w-5 text-yellow-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">File Manager</h1>
              <p className="text-muted-foreground">Manage and organize your files</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">MIME Type</label>
                    <Select
                      value={filters.mimeType}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, mimeType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Uploader</label>
                    <Input
                      placeholder="Filter by uploader..."
                      value={filters.uploader}
                      onChange={(e) => setFilters((prev) => ({ ...prev, uploader: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size Range (KB)</label>
                    <div className="px-2">
                      <Slider
                        value={filters.sizeRange}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, sizeRange: value as [number, number] }))
                        }
                        max={10000}
                        min={0}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.sizeRange[0]} KB</span>
                        <span>{filters.sizeRange[1]} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <DatePickerWithRange
                      date={filters.dateRange}
                      onDateChange={(dateRange) => setFilters((prev) => ({ ...prev, dateRange }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredFiles.length} of {files.length} files
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        search: "",
                        mimeType: "all",
                        sizeRange: [0, 100000],
                        dateRange: undefined,
                        tags: [],
                        uploader: "",
                      })
                    }
                  >
                    Clear all filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading files...</span>
          </div>
        ) : error ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-destructive">Authentication Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>To fix this issue:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Log in through your authentication system</li>
                  <li>
                    Or manually set a token:{" "}
                    <code className="bg-muted px-1 rounded">localStorage.setItem("token", "your-jwt-token")</code>
                  </li>
                  <li>Make sure your backend is running on http://localhost:8080</li>
                </ul>
              </div>
              <Button onClick={() => (window.location.href = "/login")} className="mt-4">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        ) : filteredFiles.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or upload some files.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mime)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate" title={file.filename}>
                          {file.filename}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {file.mime.split("/")[1]?.toUpperCase() || "FILE"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <X className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="font-medium">{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span className="font-medium">{new Date(file.uploaded_at).toLocaleDateString()}</span>
                    </div>
                    {file.uploader && (
                      <div className="flex justify-between">
                        <span>By:</span>
                        <span className="font-medium">{file.uploader}</span>
                      </div>
                    )}
                  </div>

                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {file.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {file.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{file.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
