import React, { forwardRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProjectInfo {
  name: string
  description: string
}

interface ProjectInfoDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projectInfo: ProjectInfo
  onProjectInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const DialogWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }>(
  ({ children, open, onOpenChange }, ref) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div ref={ref}>{children}</div>
    </Dialog>
  )
)

DialogWrapper.displayName = "DialogWrapper"

const ProjectInfoDialog: React.FC<ProjectInfoDialogProps> = ({ isOpen, onOpenChange, projectInfo, onProjectInfoChange }) => {
  const handleTabKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      console.log('按了tab键');
      e.preventDefault(); // 防止默认的Tab行为
      e.currentTarget.readOnly = true; // 设置为只读状态
      e.currentTarget.style.color = 'gray'; // 设置字体颜色为灰色
    }
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogWrapper open={isOpen} onOpenChange={onOpenChange}>
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
                    onChange={onProjectInfoChange}
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
                    onChange={onProjectInfoChange}
                    placeholder="一句话（140个字以内），讲清楚这个项目做什么，也可以试试按住Tab键，让AI帮你生成"
                    className="col-span-3"
                    onKeyDown={handleTabKeyPress}
                  />
                </div>
              </div>
            </DialogContent>
          </DialogWrapper>
        </TooltipTrigger>
        <TooltipContent>
          <p>项目信息维护</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { ProjectInfoDialog }