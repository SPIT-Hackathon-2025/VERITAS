import { Play, GitBranch, Settings, File, Folder, Search, Terminal } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="h-12 bg-[#011627] border-b border-[#1d3b53] flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-[#d6deeb] font-medium">Web IDE</h1>
        <div className="flex space-x-2">
          <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
            <File className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
          </button>
          <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
            <Folder className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
          </button>
          <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
            <Search className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
          </button>
          <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
            <GitBranch className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="px-3 py-1.5 bg-[#7fdbca] text-[#011627] rounded-md text-sm flex items-center gap-2 hover:bg-[#9ce0d0] transition-colors font-medium">
          <Play className="w-4 h-4" />
          Run
        </button>
        <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
          <Terminal className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
        </button>
        <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
          <Settings className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
        </button>
      </div>
    </nav>
  )
}