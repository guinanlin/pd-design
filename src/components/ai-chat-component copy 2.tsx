'use client'

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileUp, SendIcon, CheckCircle, Info, Key, PlusCircle, ChevronDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { ProjectSelector } from "@/components/AiChat/ProjectInfoDialog"
import AzureKeyDialog from "@/components/AiChat/AzureKeyDialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { saveAzureConfig, getAzureConfig } from "@/components/AiChat/azureConfig"
import { Transcript } from "@/components/AiChat/Transcript"
import { getAnswer } from '@/app/utils/actions';

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Shortcut {
  id: string
  name: string
}

interface ProjectInfo {
  name: string
  description: string
}

interface Project {
  value: string
  label: string
}

const shortcuts: Shortcut[] = [
  { id: "generate-project-goals", name: "生成项目目标" },
  { id: "summarize-core-business", name: "总结核心业务流程" },
  { id: "generate-feature-list", name: "生成开发功能清单" },
  { id: "generate-personnel-quote", name: "生成人员配置报价" },
  { id: "generate-project-plan", name: "生成项目开发计划" },
]

const projects: Project[] = [
  { value: "project1", label: "项目1" },
  { value: "project2", label: "项目2" },
  { value: "project3", label: "项目3" },
]

export function AiChatComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState<string>("")
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "您好！我是您的AI助手。请问有什么我可以帮助您的吗？" }
  ])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [selectedShortcutIndex, setSelectedShortcutIndex] = useState(0)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isProjectInfoDialogOpen, setIsProjectInfoDialogOpen] = useState(false)
  const [isAzureKeyDialogOpen, setIsAzureKeyDialogOpen] = useState(false)
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({ name: "", description: "" })
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [azureApiKey, setAzureApiKey] = useState("")
  const [azureEndpoint, setAzureEndpoint] = useState("")
  const [azureDeploymentName, setAzureDeploymentName] = useState("")
  const [azureApiVersion, setAzureApiVersion] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [generation, setGeneration] = useState<string>('');

  const storedConfig = getAzureConfig()
  // const chat = azure(storedConfig?.azureDeploymentName || 'default-deployment-name') // 使用 Azure 提供者创建聊天实例

  useEffect(() => {
    if (storedConfig) {
      setAzureApiKey(storedConfig.azureApiKey)
      setAzureEndpoint(storedConfig.azureEndpoint)
      setAzureDeploymentName(storedConfig.azureDeploymentName)
      setAzureApiVersion(storedConfig.azureApiVersion)
    }
  }, [])

  const handleAzureKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAzureApiKey(e.target.value)
    updateAzureConfig("azureApiKey", e.target.value)
  }

  const handleAzureEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAzureEndpoint(e.target.value)
    updateAzureConfig("azureEndpoint", e.target.value)
  }

  const handleAzureDeploymentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAzureDeploymentName(e.target.value)
    updateAzureConfig("azureDeploymentName", e.target.value)
  }

  const handleAzureApiVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAzureApiVersion(e.target.value)
    updateAzureConfig("azureApiVersion", e.target.value)
  }

  const updateAzureConfig = (key: string, value: string) => {
    const newConfig = {
      azureApiKey,
      azureEndpoint,
      azureDeploymentName,
      azureApiVersion,
      [key]: value,
    }
    saveAzureConfig(newConfig)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setUploadSuccess(false)
    }
  }

  const handleFileUpload = async () => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result
        if (typeof text === "string") {
          setTranscript(text)
          setUploadSuccess(true)
          setIsUploadDialogOpen(false)
        }
      }
      reader.readAsText(file)
      console.log("文件已上传:", file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }])
      setInput("")
      setIsThinking(true)
      try {
        const config = getAzureConfig()
        if (!config) {
          throw new Error("Azure配置未找到")
        }
        const { text } = await getAnswer(input, config)
        setMessages(prev => [...prev, { role: "assistant", content: text }])
      } catch (error) {
        console.error("Error getting AI response:", error)
        setMessages(prev => [...prev, { role: "assistant", content: "抱歉，我遇到了一些问题。请稍后再试。" }])
      }
      setIsThinking(false)
    }
  }

  const handleSummarize = async () => {
    setIsThinking(true)
    try {
      const summarizedContent = await chat.send("请总结当前的对话内容，并提供下一步行动建议。")
      setMessages(prev => [...prev, { role: "assistant", content: summarizedContent }])
    } catch (error) {
      console.error("Error summarizing content:", error)
      setMessages(prev => [...prev, { role: "assistant", content: "抱歉，总结过程中遇到了问题。请稍后再试。" }])
    }
    setIsThinking(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    const lastAtIndex = value.lastIndexOf("@")
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowShortcuts(true)
      setSelectedShortcutIndex(0)
    } else {
      setShowShortcuts(false)
    }
  }

  const handleShortcutClick = (shortcut: Shortcut) => {
    const newInput = input.slice(0, input.lastIndexOf("@")) + `@${shortcut.name} `
    setInput(newInput)
    setShowShortcuts(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showShortcuts) {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedShortcutIndex(prev => (prev > 0 ? prev - 1 : shortcuts.length - 1))
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedShortcutIndex(prev => (prev < shortcuts.length - 1 ? prev + 1 : 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        handleShortcutClick(shortcuts[selectedShortcutIndex])
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result
        if (typeof text === "string") {
          setTranscript(text)
        }
      }
      reader.readAsText(file)
    }
  }, [])

  const handleProjectInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProjectInfo(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-4 h-[95vh]">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="flex-shrink-0 flex justify-start items-start">
          <CardTitle className="text-3xl font-bold flex items-start">需求梳理
            <ProjectSelector
              projects={projects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              setIsProjectInfoDialogOpen={setIsProjectInfoDialogOpen}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden">
          <Tabs defaultValue="chat" className="flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-transparent">
                <TabsTrigger 
                  value="chat" 
                  className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
                >
                  对话
                </TabsTrigger>
                <TabsTrigger 
                  value="transcript" 
                  className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
                >
                  参考资料
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Dialog open={isProjectInfoDialogOpen} onOpenChange={setIsProjectInfoDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>项目信息维护</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="projectName" className="text-right">
                                项目名称
                              </Label>
                              <Input
                                id="projectName"
                                name="name"
                                value={projectInfo.name}
                                onChange={handleProjectInfoChange}
                                placeholder="15个字以内给项目取个名称"
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="projectDescription" className="text-right">
                                项目描述
                              </Label>
                              <Textarea
                                id="projectDescription"
                                name="description"
                                value={projectInfo.description}
                                onChange={handleProjectInfoChange}
                                placeholder="用一句话, 140个字以内, 讲清楚这个项目做什么"
                                className="col-span-3"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>项目信息维护</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <AzureKeyDialog
                      azureApiKey={azureApiKey}
                      azureEndpoint={azureEndpoint}
                      azureDeploymentName={azureDeploymentName}
                      azureApiVersion={azureApiVersion}
                      onAzureKeyChange={handleAzureKeyChange}
                      onAzureEndpointChange={handleAzureEndpointChange}
                      onAzureDeploymentNameChange={handleAzureDeploymentNameChange}
                      onAzureApiVersionChange={handleAzureApiVersionChange}
                    />
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <FileUp className="h-4 w-4" />
                          </Button>
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
                                ref={fileInputRef}
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>上传文本资料</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <TabsContent value="chat" className="flex-grow flex flex-col mt-0">
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
                            <Button onClick={handleSummarize} className="mt-2 text-xs py-1 px-2 h-auto">
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
                          onClick={() => handleShortcutClick(shortcut)}
                        >
                          {shortcut.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
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
            </TabsContent>
            <TabsContent value="transcript" className="flex-grow flex flex-col mt-0">
              <Transcript
                transcript={transcript}
                setTranscript={setTranscript}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}