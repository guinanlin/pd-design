import React, { forwardRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileUp, CheckCircle } from "lucide-react"

interface UploadTextDialogProps {
  onFileUpload: (file: File) => void
}

const UploadTextDialog = forwardRef<HTMLButtonElement, UploadTextDialogProps>(({ onFileUpload }, ref) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setUploadSuccess(false)
    }
  }

  const handleFileUpload = () => {
    if (file) {
      onFileUpload(file)
      setUploadSuccess(true)
      setTimeout(() => setIsOpen(false), 1500) // 关闭对话框
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" ref={ref}>
                <FileUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>上传文本资料</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt,.doc,.docx,.pdf"
                />
                <Button onClick={handleFileUpload} disabled={!file}>
                  上传
                </Button>
              </div>
              {file && (
                <p className="text-sm text-gray-500 dark:text-gray-400">已选择文件: {file.name}</p>
              )}
              {uploadSuccess && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">文本资料上传成功！</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <TooltipContent>
          <p>上传文本资料</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

UploadTextDialog.displayName = "UploadTextDialog"

export default UploadTextDialog