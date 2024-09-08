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
import { ProjectInfoDialog } from "@/components/AiChat/ProjectInfoDialog"
import AzureKeyDialog from "@/components/AiChat/AzureKeyDialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { saveAzureConfig, getAzureConfig } from "@/components/AiChat/azureConfig"
import { Transcript } from "@/components/AiChat/Transcript"
import { ProjectSelector } from "@/components/AiChat/ProjectSelector"
import UploadTextDialog from "@/components/AiChat/UploadTextDialog"
import { azure,createAzure } from '@ai-sdk/azure';
import { generateText,streamText } from 'ai';
import { ChatContent } from "./AiChat/ChatContent"


interface Message {
  role: "user" | "assistant" | "system"
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

// const storedConfig = getAzureConfig()

export function AiChatComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState<string>("")
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "你是一个AI机器人,是我的日常工作助理" }
  ]); // 初始化消息列表
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
  const [azureResourceName, setAzureResourceName] = useState("")
  const [azureApiVersion, setAzureApiVersion] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [generation, setGeneration] = useState<string>('');

  // 提取 Azure 配逻辑到组件外部
  const storedConfig = getAzureConfig()
  // console.log(storedConfig)
  const azureInstance = storedConfig ? createAzure({
    resourceName: storedConfig.azureResourceName,
    apiKey: storedConfig.azureApiKey,
    baseURL: storedConfig.azureEndpoint
  }) : null;

  useEffect(() => {
    if (storedConfig) {
      setAzureApiKey(storedConfig.azureApiKey)
      setAzureEndpoint(storedConfig.azureEndpoint)
      setAzureDeploymentName(storedConfig.azureDeploymentName)
      setAzureApiVersion(storedConfig.azureApiVersion)
      setAzureResourceName(storedConfig.azureResourceName)
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

  const handleAzureResourceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAzureResourceName(e.target.value)
    updateAzureConfig("azureResourceName", e.target.value)
  }

  const updateAzureConfig = (key: string, value: string) => {
    const newConfig = {
      azureApiKey,
      azureEndpoint,
      azureDeploymentName,
      azureApiVersion,
      azureResourceName,
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

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === "string") {
        setTranscript(text)
        setUploadSuccess(true)
      }
    }
    reader.readAsText(file)
    console.log("文件已上传:", file.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage = { role: "user", content: input };
      const systemMessage = { role: "system", content: `你是一个AI机器人,是我的日常工作助理。我需要处理的文档内容是：${transcript}` };
      const updatedMessages = [...messages, userMessage as Message]; // 更新消息列表

      setMessages(updatedMessages);
      setInput("");
      setIsThinking(true);
      try {
        if (!azureInstance) {
          throw new Error("Azure 配置未找到");
        }
        
        const { azureDeploymentName } = storedConfig!;
        const model = azureInstance(azureDeploymentName);

        const result = await streamText({
          model: model,
          messages: [systemMessage, ...updatedMessages].map(msg => ({ role: msg.role as "user" | "assistant" | "system", content: msg.content }))
        });

        const reader = result.textStream.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
              fullResponse += value;
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: fullResponse }
              ]);
          }
        }
        const assistantMessage: Message = { role: "assistant", content: fullResponse };
        setMessages(prev => [...prev.slice(0, -1), assistantMessage]); // 更新消息列表，包含AI的回复
      } catch (error) {
        console.error("Error getting AI response:", error);
        setMessages(prev => [...prev, { role: "assistant", content: "抱歉，我遇到了一些问题。请稍后再试。" } as Message]);
      }
      setIsThinking(false);
    }
  };
  
  const handleSummarize = async () => {
    const userMessage = { role: "user", content: "请总结当前的内容,需要条理清楚,逻辑清晰，最好用列表方式" };
    const systemMessage = { role: "system", content: `你是一个AI机器人,是我的日常工��助理。我需要处理的文档内容是：${transcript}` };
    const updatedMessages = [...messages, userMessage as Message]; // 更新消息列表

    setMessages(updatedMessages);
    setIsThinking(true);
    try {
      if (!azureInstance) {
        throw new Error("Azure 配置未找到");
      }
      
      const { azureDeploymentName } = storedConfig!;
      const model = azureInstance(azureDeploymentName);

      const result = await streamText({
        model: model,
        messages: [systemMessage, ...updatedMessages].map(msg => ({ role: msg.role as "user" | "assistant" | "system", content: msg.content }))
      });

      const reader = result.textStream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
            fullResponse += value;
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: "assistant", content: fullResponse }
            ]);
        }
      }
      const assistantMessage: Message = { role: "assistant", content: fullResponse };
      setMessages(prev => [...prev.slice(0, -1), assistantMessage]); // 更新消息列表，包含AI的回复
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "抱歉，我遇到了一些问题。请稍后再试。" } as Message]);
    }
    setIsThinking(false);
  };

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
          <CardTitle className="text-3xl font-bold flex items-start"><span className="mr-4">产品MVP</span>
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
                <TabsTrigger 
                  value="project-objectives" 
                  className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
                >
                  项目目标
                </TabsTrigger>
                <TabsTrigger 
                  value="core-process" 
                  className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
                >
                  核心流程
                </TabsTrigger>
                <TabsTrigger 
                  value="feature-list" 
                  className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
                >
                  功能清单
                </TabsTrigger>  
                <TabsTrigger 
                  value="personnel-quote" 
                  className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"
                >
                  人员配置
                </TabsTrigger>
                <TabsTrigger 
                  value="project-plan" 
                  className="text-sm px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950"  
                >
                  项目计划
                </TabsTrigger>      
              </TabsList>
              <div className="flex items-center space-x-2">
                <ProjectInfoDialog
                  isOpen={isProjectInfoDialogOpen}
                  onOpenChange={setIsProjectInfoDialogOpen}
                  projectInfo={projectInfo}
                  onProjectInfoChange={handleProjectInfoChange}
                />
                <AzureKeyDialog
                  azureApiKey={azureApiKey}
                  azureEndpoint={azureEndpoint}
                  azureDeploymentName={azureDeploymentName}
                  azureApiVersion={azureApiVersion}
                  onAzureKeyChange={handleAzureKeyChange}
                  onAzureEndpointChange={handleAzureEndpointChange}
                  onAzureDeploymentNameChange={handleAzureDeploymentNameChange}
                  onAzureApiVersionChange={handleAzureApiVersionChange}
                  azureResourceName={azureResourceName}
                  onAzureResourceNameChange={handleAzureResourceNameChange}
                />
                <UploadTextDialog onFileUpload={handleFileUpload} />
              </div>
            </div>
            <TabsContent value="chat" className="flex-grow flex flex-col mt-0">
              <ChatContent
                messages={messages as any}
                isThinking={isThinking}
                input={input}
                showShortcuts={showShortcuts}
                selectedShortcutIndex={selectedShortcutIndex}
                shortcuts={shortcuts}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onShortcutClick={handleShortcutClick}
                onSubmit={handleSubmit}
                onSummarize={handleSummarize}
              />
            </TabsContent>
            <TabsContent value="transcript" className="flex-grow flex flex-col mt-0">  
            <div className="flex-grow flex flex-col">            
              <Transcript
                transcript={transcript}
                setTranscript={setTranscript}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
              />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}