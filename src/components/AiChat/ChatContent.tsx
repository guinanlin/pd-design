import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ReactMarkdown from "react-markdown"
import { SendIcon } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatContentProps {
  messages: Message[]
  isThinking: boolean
  input: string
  showShortcuts: boolean
  selectedShortcutIndex: number
  shortcuts: { id: string; name: string }[]
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onShortcutClick: (shortcut: { id: string; name: string }) => void
  onSubmit: (e: React.FormEvent) => void
  onSummarize: () => void
}

export function ChatContent({
  messages,
  isThinking,
  input,
  showShortcuts,
  selectedShortcutIndex,
  shortcuts,
  onInputChange,
  onKeyDown,
  onShortcutClick,
  onSubmit,
  onSummarize
}: ChatContentProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-grow flex flex-col">
      <ScrollArea className="flex-grow border border-gray-200 rounded-lg dark:border-gray-800" style={{ height: "calc(100vh - 400px)" }}>
        <div className="p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="flex gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{message.role === "user" ? "用户" : "AI"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">{message.role === "user" ? "您" : "AI"}</p>
                <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                  {message.content}
                </ReactMarkdown>
                {index === 0 && (
                  <Button onClick={onSummarize} className="mt-2 text-xs py-1 px-2 h-auto">
                    总结归纳
                  </Button>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">AI</p>
                <p className="text-sm">AI正在思考中...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="relative mt-4">
        {showShortcuts && (
          <div className="absolute bottom-full left-0 z-10 w-64 bg-white border border-gray-200 rounded-md shadow-lg mb-1 dark:border-gray-800">
            {shortcuts.map((shortcut, index) => (
              <button
                key={shortcut.id}
                className={`block w-full text-left px-4 py-2 ${
                  index === selectedShortcutIndex ? "bg-gray-100" : "hover:bg-gray-100"
                }`}
                onClick={() => onShortcutClick(shortcut)}
              >
                {shortcut.name}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={onSubmit} className="flex items-center space-x-4">
          <Input
            ref={inputRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder="询问关于您文本资料的问题..."
            className="flex-1 text-sm py-4"
          />
          <Button type="submit" size="sm" className="text-sm py-4 px-6">
            <SendIcon className="h-4 w-4 mr-2" />
            发送
          </Button>
        </form>
      </div>
    </div>
  )
}