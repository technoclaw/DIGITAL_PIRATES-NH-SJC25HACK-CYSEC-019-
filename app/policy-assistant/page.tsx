"use client"

import { useState, useRef, DragEvent, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useScrollFade } from "@/hooks/use-scroll-fade"
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react"

interface AnalysisResult {
  verdict: "pass" | "warn" | "fail"
  score: number
  findings: string[]
  recommendations: string[]
  timestamp: string
}

export default function PolicyAssistantPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadZoneRef = useScrollFade()
  const resultsRef = useScrollFade()

  // Validate file is PDF
  const validateFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF files are accepted. Please upload a .pdf file.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  // Handle file drop
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setUploadedFile(file)
        setAnalysisResult(null)
        toast({
          title: "File Uploaded",
          description: `${file.name} is ready for analysis.`,
        })
      }
    }
  }

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setUploadedFile(file)
        setAnalysisResult(null)
        toast({
          title: "File Uploaded",
          description: `${file.name} is ready for analysis.`,
        })
      }
    }
  }

  // Handle drag events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null)
    setAnalysisResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Mock analysis function
  const analyzePolicy = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setAnalysisResult(null)

    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Mock analysis result
    const mockResult: AnalysisResult = {
      verdict: Math.random() > 0.5 ? "pass" : Math.random() > 0.5 ? "warn" : "fail",
      score: Math.floor(Math.random() * 40) + 60,
      findings: [
        "Multi-factor authentication policy detected",
        "Data retention period: 90 days specified",
        "Encryption standards comply with industry best practices",
        "Incident response procedures documented",
      ],
      recommendations: [
        "Consider adding explicit password complexity requirements",
        "Include regular security training mandates for all employees",
        "Define specific breach notification timelines",
        "Add third-party vendor security assessment procedures",
      ],
      timestamp: new Date().toISOString(),
    }

    setAnalysisResult(mockResult)
    setIsAnalyzing(false)

    toast({
      title: "Analysis Complete",
      description: `Policy analysis finished with a ${mockResult.verdict.toUpperCase()} verdict.`,
    })
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "pass":
        return "cyber-text-success"
      case "warn":
        return "text-yellow-400"
      case "fail":
        return "cyber-text-danger"
      default:
        return "text-slate-200"
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "pass":
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />
      case "warn":
        return <AlertCircle className="w-6 h-6 text-yellow-400" />
      case "fail":
        return <AlertCircle className="w-6 h-6 text-rose-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">Policy Assistant</h1>
        <p className="text-slate-400">
          Upload your security policy PDF for AI-powered compliance analysis.
        </p>
      </header>

      {/* Upload Zone */}
      <section
        ref={uploadZoneRef.ref as any}
        className={`transition-all duration-700 ease-out ${
          uploadZoneRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <Card className="cyber-card border-2">
          <CardHeader>
            <CardTitle className="text-cyan-400">Upload Policy Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-lg p-12 
                transition-all duration-300 cursor-pointer
                ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-950/20 scale-[1.02]"
                    : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                }
              `}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload
                  className={`w-16 h-16 transition-colors ${
                    isDragging ? "text-cyan-400" : "text-slate-500"
                  }`}
                />
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-200">
                    {isDragging ? "Drop your PDF here" : "Click to browse or drag & drop"}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Only PDF files are accepted
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Uploaded File Display */}
            {uploadedFile && (
              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-cyan-400" />
                  <div>
                    <p className="font-medium text-slate-200">{uploadedFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="push-hover text-slate-400 hover:text-rose-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Analyze Button */}
            <Button
              onClick={analyzePolicy}
              disabled={!uploadedFile || isAnalyzing}
              className="w-full pulse-ripple push-hover bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing Policy...
                </>
              ) : (
                "Analyze Policy"
              )}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Results Section */}
      {analysisResult && (
        <section
          ref={resultsRef.ref as any}
          className={`transition-all duration-700 ease-out ${
            resultsRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="space-y-6">
            {/* Verdict Card */}
            <Card className="cyber-card border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  {getVerdictIcon(analysisResult.verdict)}
                  <span className={getVerdictColor(analysisResult.verdict)}>
                    Analysis Result: {analysisResult.verdict.toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-100">
                      {analysisResult.score}/100
                    </p>
                    <p className="text-sm text-slate-500">Compliance Score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Analyzed</p>
                    <p className="text-sm text-slate-400">
                      {new Date(analysisResult.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Findings Card */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisResult.findings.map((finding, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations Card */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
