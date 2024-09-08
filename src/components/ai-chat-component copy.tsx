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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
        const response = await getAzureAIResponse(input)
        setMessages(prev => [...prev, { role: "assistant", content: response }])
      } catch (error) {
        console.error("Error getting AI response:", error)
        setMessages(prev => [...prev, { role: "assistant", content: "抱歉，我遇到了一些问题。请稍后再试。" }])
      }
      setIsThinking(false)
    }
  }

  const getAzureAIResponse = async (userInput: string): Promise<string> => {
    if (!azureApiKey || !azureEndpoint) {
      throw new Error("Azure API key or endpoint is not set")
    }

    const response = await fetch(`${azureEndpoint}/openai/deployments/your-deployment-name/chat/completions?api-version=2023-05-15`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azureApiKey
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "你是一个AI助手，专��帮助用户进行需求梳理和项目规划。" },
          { role: "user", content: userInput }
        ],
        max_tokens: 800,
        temperature: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 0.95,
        stop: null
      })
    })

    if (!response.ok) {
      throw new Error("Failed to get response from Azure OpenAI")
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  const handleSummarize = async () => {
    setIsThinking(true)
    try {
      const summarizedContent = await getAzureAIResponse("请总结当前的对话内容，并提供下一步行动建议。")
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

  const handleAzureKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAzureApiKey(e.target.value)
  }

  const handleAzureEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAzureEndpoint(e.target.value)
  }

  return (
    <div className="container mx-auto px-4 py-4 h-[95vh]">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="flex-shrink-0 flex justify-between items-center">
          <CardTitle className="text-3xl font-bold">需求梳理</CardTitle>
          <div className="flex items-center space-x-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {selectedProject
                    ? projects.find((project) => project.value === selectedProject)?.label
                    : "选择项目..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="搜索项目..." />
                  <CommandEmpty>未找到项目。</CommandEmpty>
                  <CommandGroup>
                    {projects.map((project) => (
                      <CommandItem
                        key={project.value}
                        onSelect={(currentValue) => {
                          setSelectedProject(currentValue === selectedProject ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        {project.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <Button
                    className="w-full mt-2"
                    onClick={() => {
                      setIsProjectInfoDialogOpen(true)
                      setOpen(false)
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    新建项目
                  </Button>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
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
                                placeholder="用一句话, 140个字以内, 讲清楚这个项���做什么"
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
                    <TooltipTrigger asChild>
                      <Dialog open={isAzureKeyDialogOpen} onOpenChange={setIsAzureKeyDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Key className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Azure OpenAI 配置</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="azureApiKey" className="text-right">
                                API Key
                              </Label>
                              <Input
                                id="azureApiKey"
                                type="password"
                                value={azureApiKey}
                                onChange={handleAzureKeyChange}
                                placeholder="输入您的 Azure OpenAI API Key"
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="azureEndpoint" className="text-right">
                                Endpoint
                              </Label>
                              <Input
                                id="azureEndpoint"
                                value={azureEndpoint}
                                onChange={handleAzureEndpointChange}
                                placeholder="输入您的 Azure OpenAI Endpoint"
                                className="col-span-3"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Azure OpenAI 配置</p>
                    </TooltipContent>
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
              <ScrollArea className="flex-grow border border-gray-200 rounded-lg dark:border-gray-800" style={{ height: "calc(100vh - 300px)" }}>
                <div className="p-6">
                  <Textarea
                    ref={textareaRef}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    placeholder="将文件拖放到此处或在此处粘贴您的参考资料..."
                    className="w-full text-sm border-none focus:ring-0 min-h-[500px]"
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}