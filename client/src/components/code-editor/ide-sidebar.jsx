"use client"

import { useState } from "react"
import { Folder, File, ChevronRight, ChevronDown, GitBranch } from "lucide-react"
import { useSandpack } from "@codesandbox/sandpack-react"

export default function Sidebar({ addFile }) {
    const [isExpanded, setIsExpanded] = useState(true)
    const { sandpack } = useSandpack()
    const { files } = sandpack

    const handleAddFile = () => {
        const fileName = prompt("Enter file name:")
        if (fileName) {
            addFile(`/${fileName}`, "")
        }
    }

    const handleAddFolder = () => {
        const folderName = prompt("Enter folder name:")
        if (folderName) {
            // For simplicity, we're just adding an empty file in the new folder
            addFile(`/${folderName}/.gitkeep`, "")
        }
    }

    return (
        <div className="w-64 bg-[#21252b] border-r border-[#3e4451] flex flex-col">
            <div className="p-3 border-b border-[#3e4451] flex justify-between items-center">
                <button
                    className="flex items-center text-[#abb2bf] font-medium text-sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                    Explorer
                </button>
                <div className="flex space-x-1">
                    <button className="p-1 hover:bg-[#3e4451] rounded" onClick={handleAddFile}>
                        <File className="w-4 h-4 text-[#abb2bf]" />
                    </button>
                    <button className="p-1 hover:bg-[#3e4451] rounded" onClick={handleAddFolder}>
                        <Folder className="w-4 h-4 text-[#abb2bf]" />
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="flex-1 overflow-auto p-2">
                    {Object.keys(files).length === 0 ? (
                        <div className="text-[#abb2bf] text-sm italic">No files yet. Create a new file to get started.</div>
                    ) : (
                        <ul className="space-y-1">
                            {Object.keys(files).map((filePath) => (
                                <li key={filePath} className="flex items-center text-[#abb2bf] text-sm">
                                    <File className="w-4 h-4 mr-2" />
                                    {filePath.slice(1)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <div className="p-3 border-t border-[#3e4451]">
                <button className="w-full py-2 flex items-center justify-center gap-2 text-[#abb2bf] hover:bg-[#3e4451] transition-colors rounded">
                    <GitBranch className="w-4 h-4" />
                    <span className="text-sm">main</span>
                </button>
            </div>
        </div>
    )
}
