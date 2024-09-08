"use client";

import React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Project {
  value: string;
  label: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  setIsProjectInfoDialogOpen: (value: boolean) => void;
}

export function ProjectSelector({
  projects = [],
  selectedProject = "",
  setSelectedProject,
  setIsProjectInfoDialogOpen,
}: ProjectSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // 过滤项目列表，基于用户输入
  const filteredProjects = projects.filter((project) =>
    project.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedProject
            ? projects.find((project) => project.value === selectedProject)
                ?.label
            : "选择项目..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="搜索项目..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>未找到项目。</CommandEmpty>
            <CommandGroup>
              {filteredProjects.map((project) => (
                <CommandItem
                  key={project.value}
                  value={project.value}
                  onSelect={() => {
                    setSelectedProject(project.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProject === project.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {project.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setIsProjectInfoDialogOpen(true);
                  setOpen(false);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                新建项目
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
