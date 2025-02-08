import { Play, GitBranch, Settings, File, Folder, Search, Terminal } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="h-12 bg-[#21252b] border-b border-[#3e4451] flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-[#abb2bf] font-medium">Web IDE</h1>
        <div className="flex space-x-2">
          <button className="p-1.5 hover:bg-[#3e4451] rounded-md transition-colors">
            <File className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-[#3e4451] rounded-md transition-colors">
            <Folder className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-[#3e4451] rounded-md transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-[#3e4451] rounded-md transition-colors">
            <GitBranch className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="px-3 py-1.5 bg-[#98c379] text-[#282c34] rounded-md text-sm flex items-center gap-2 hover:bg-[#a5d38f] transition-colors">
          <Play className="w-4 h-4" />
          Run
        </button>
        <button className="p-1.5 hover:bg-[#3e4451] rounded-md transition-colors">
          <Terminal className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-[#3e4451] rounded-md transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}

