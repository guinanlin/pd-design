'use client'

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Chat from './Chat'
import Transcript from './Transcript'
import ProjectInfoDialog from './ProjectInfoDialog'
import AzureKeyDialog from './AzureKeyDialog'
import UploadDialog from './UploadDialog'

export function AiChatComponent() {
  const [isProjectInfoDialogOpen, setIsProjectInfoDialogOpen] = useState(false)
  const [isAzureKeyDialogOpen, setIsAzureKeyDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  return (
    <div className="container mx-auto px-4 py-4 h-[95vh]">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="flex-shrink-0 flex justify-between items-center">
          <CardTitle className="text-3xl font-bold">需求梳理</CardTitle>
          {/* 其他按钮和功能 */}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden">
          <Tabs defaultValue="chat" className="flex-grow flex flex-col">
            <TabsList className="bg-transparent">
              <TabsTrigger value="chat">对话</TabsTrigger>
              <TabsTrigger value="transcript">参考资料</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-grow flex flex-col mt-0">
              <Chat />
            </TabsContent>
            <TabsContent value="transcript" className="flex-grow flex flex-col mt-0">
              <Transcript />
            </TabsContent>
          </Tabs>
          <ProjectInfoDialog open={isProjectInfoDialogOpen} onOpenChange={setIsProjectInfoDialogOpen} />
          <AzureKeyDialog open={isAzureKeyDialogOpen} onOpenChange={setIsAzureKeyDialogOpen} />
          <UploadDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} />
        </CardContent>
      </Card>
    </div>
  )
}