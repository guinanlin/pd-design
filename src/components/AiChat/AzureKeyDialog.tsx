import React, { forwardRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Key } from "lucide-react"

interface AzureKeyDialogProps {
  azureApiKey: string
  azureEndpoint: string
  azureDeploymentName: string
  azureApiVersion: string
  azureResourceName: string
  onAzureKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAzureEndpointChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAzureDeploymentNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAzureApiVersionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAzureResourceNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const AzureKeyDialog = forwardRef<HTMLButtonElement, AzureKeyDialogProps>(({
  azureApiKey,
  azureEndpoint,
  azureDeploymentName,
  azureApiVersion,
  azureResourceName,
  onAzureKeyChange,
  onAzureEndpointChange,
  onAzureDeploymentNameChange,
  onAzureApiVersionChange,
  onAzureResourceNameChange
}, ref) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" ref={ref}>
                <Key className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <DialogContent className="sm:max-w-[425px]">
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
                  onChange={onAzureKeyChange}
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
                  onChange={onAzureEndpointChange}
                  placeholder="https://your-resource-name.openai.azure.com/"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="azureDeploymentName" className="text-right">
                  部署名称
                </Label>
                <Input
                  id="azureDeploymentName"
                  value={azureDeploymentName}
                  onChange={onAzureDeploymentNameChange}
                  placeholder="您的 GPT-4 部署名称"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="azureApiVersion" className="text-right">
                  API 版本
                </Label>
                <Input
                  id="azureApiVersion"
                  value={azureApiVersion}
                  onChange={onAzureApiVersionChange}
                  placeholder="例如：2023-05-15"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="azureResourceName" className="text-right">
                  资源名称
                </Label>
                <Input
                  id="azureResourceName"
                  value={azureResourceName}
                  onChange={onAzureResourceNameChange}
                  placeholder="您的 Azure 资源名称"
                  className="col-span-3"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <TooltipContent>
          <p>Azure OpenAI 配置</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

AzureKeyDialog.displayName = "AzureKeyDialog"

export default AzureKeyDialog