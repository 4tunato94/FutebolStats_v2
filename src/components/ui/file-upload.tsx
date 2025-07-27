import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFileContent: (content: string) => void
  accept?: string
  className?: string
}

export function FileUpload({ onFileContent, accept = ".txt", className }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onFileContent(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className={className}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Arquivo
      </Button>
    </>
  )
}