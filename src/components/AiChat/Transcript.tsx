import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import React from "react"

interface TranscriptProps {
  transcript: string
  setTranscript: (value: string) => void
  handleDragOver: (e: React.DragEvent<HTMLTextAreaElement>) => void
  handleDrop: (e: React.DragEvent<HTMLTextAreaElement>) => void
}

export const Transcript: React.FC<TranscriptProps> = ({ transcript, setTranscript, handleDragOver, handleDrop }) => {
  return (
    <ScrollArea className="flex-grow border border-gray-200 rounded-lg dark:border-gray-800" style={{ height: "calc(100vh - 300px)" }}>

        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          placeholder="将文件拖放到此处或在此处粘贴您的参考资料..."
          className="w-full text-sm border-none focus:ring-0 min-h-[500px]"
        />
    </ScrollArea>
  )
}