import React, { useState, useEffect, useRef } from "react";
import {
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { SandpackFileExplorer } from "sandpack-file-explorer";
import { useSocket } from "@/app/context/socket";
import useOnlineUserStore from "@/app/context/onlineUserStore";
import { useParams } from "next/navigation";
import axios from "axios";

// Icons from Lucide-react
import {
  Play,
  GitBranch,
  Settings,
  File,
  Folder,
  Search,
  Terminal,
  Share2,
  Plus,
  Users,
  GitCommit,
} from "lucide-react";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
// import { Play, GitBranch, Settings, File, Folder, Search, Terminal, Share2 } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/hooks/useAuth";
import useRepoStore from "@/app/context/repoStore";
import { toast } from "react-toastify";
const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// import { useToast } from "@/components/ui/use-toast";?

function Navbar({ repoName }) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { repoState } = useRepoStore();
  // const { toast } = useToast();
  const handleCommit = async () => {
    try {
      console.log(repoState);
      const updatedFile = repoState?.repo?.mainFolders.map((file) => {
        return { fileId: file._id, content: file.content };
      });
      console.log(updatedFile);
      const commitMessage = "Commit from Web IDE";
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/repo/commit-repo/${repoState.repo._id}`,
        {
          updateFile: updatedFile,
          commitMessage: commitMessage,
        }
      );
      if (response) {
        console.log(response);
        toast.success("Changes committed!")
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleShare = async () => {
    if (!email || !user?.uid || !repoName) {
      // toast({
      //   title: "Error",
      //   description: "Missing required information",
      //   variant: "destructive",
      // });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/repo/add-collabs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerId: user.uid,
          repoName: repoName,
          collaborators: [email],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share repository");
      }

      // toast({
      //   title: "Success",
      //   description: `Repository shared with ${email}`,
      // });

      setEmail("");
      setIsShareOpen(false);
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: error.message || "Failed to share repository",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const [isCommitHistoryOpen, setIsCommitHistoryOpen] = useState(false);
  const [commitHistory, setCommitHistory] = useState([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);

  const fetchCommitHistory = async () => {
    console.log(repoState);
    if (!repoState.repo._id) return;

    setIsLoadingCommits(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/repo/get-commit-history/${repoState.repo._id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch commit history");
      }

      const data = await response.json();
      setCommitHistory(data.commits); // Assuming the API returns { commits: [...] }
    } catch (error) {
      console.error("Error fetching commit history:", error);
    } finally {
      setIsLoadingCommits(false);
    }
  };
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const handleQuery =async () => {
    console.log(message);
    const res=await axios.post(`${process.env.NEXT_PUBLIC_ML_URL}/route_query`,{query:message});
    if(res){
      console.log(res.data.answer);
      setMessage(res.data.answer);
    }
  }
  return (
    <>
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
            <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group" onClick={() => setIsOpen(true)}>
              <Search className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
            </button>
            <button
              className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group"
              onClick={() => {
                setIsCommitHistoryOpen(true);
                fetchCommitHistory(); // Fetch commits when opening the dialog
              }}
            >
              <GitBranch className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1.5 bg-[#7fdbca] text-[#011627] rounded-md text-sm flex items-center gap-2 hover:bg-[#9ce0d0] transition-colors font-medium">
            <Play className="w-4 h-4" />
            Run
          </button>

          {/* Commit to GitHub Button */}
          <button
            className="px-3 py-1.5 bg-[#ffcc00] text-[#011627] rounded-md text-sm flex items-center gap-2 hover:bg-[rgb(255,214,51)] transition-colors font-medium"
            onClick={handleCommit}
          >
            <GitCommit className="w-4 h-4" />
            Commit
          </button>

          <button
            className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group"
            onClick={() => setIsShareOpen(true)}
          >
            <Share2 className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
          </button>
          <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
            <Settings className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
          </button>
        </div>
      </nav>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-md bg-[#1E293B] text-white border border-[#334155] shadow-lg rounded-lg">
          <DialogHeader className="text-lg font-semibold text-[#d6deeb]">
            Enter Message
          </DialogHeader>

          <Input
            className="bg-[#0F172A] text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <DialogFooter className="flex justify-end gap-2">
            {/* Fix: Close modal on cancel */}
            <Button
              variant="ghost"
              className="text-gray-400 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={handleQuery}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="bg-[#011627] border border-[#1d3b53] text-[#d6deeb]">
          <DialogHeader>
            <DialogTitle className="text-[#d6deeb]">
              Share Repository
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1d3b53] border-[#1d3b53] text-[#d6deeb] placeholder:text-[#4f6479]"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShareOpen(false)}
              className="bg-transparent border-[#1d3b53] text-[#d6deeb] hover:bg-[#1d3b53] hover:text-[#c5e4fd]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              className="bg-[#7fdbca] text-[#011627] hover:bg-[#9ce0d0]"
              disabled={isLoading}
            >
              {isLoading ? "Sharing..." : "Share"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCommitHistoryOpen} onOpenChange={setIsCommitHistoryOpen}>
        <DialogContent className="bg-[#011627] border border-[#1d3b53] text-[#d6deeb]">
          <DialogHeader>
            <DialogTitle className="text-[#d6deeb]">Commit History</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto">
            {isLoadingCommits ? (
              <p className="text-center text-[#82aaff]">Loading commits...</p>
            ) : commitHistory.length > 0 ? (
              commitHistory.map((commit, index) => (
                <div key={index} className="border-b border-[#1d3b53] py-2">
                  <p className="text-[#7fdbca] cursor-pointer font-medium">
                    Commit ID: {commit}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-[#4f6479]">
                No commit history found
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCommitHistoryOpen(false)}
              className="bg-transparent border-[#1d3b53] text-[#d6deeb] hover:bg-[#1d3b53] hover:text-[#c5e4fd]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
const OnlineUserBadge = ({ name, email }) => (
  <div className="flex items-center gap-2 p-2 hover:bg-[#1E2D3D] rounded transition-colors">
    <div className="relative">
      <div className="w-8 h-8 bg-[#011627] rounded-full flex items-center justify-center border border-[#1E2D3D]">
        <span className="text-sm text-[#5F7E97] font-medium">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#011627]" />
    </div>
    <div className="flex flex-col">
      <span className="text-sm text-[#5F7E97] font-medium">{name}</span>
      <span className="text-xs text-[#5F7E97] opacity-60">{email}</span>
    </div>
  </div>
);

function SandpackBetter({ setTemplate }) {
  const socket = useSocket();
  const [showConsole, setShowConsole] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(true);
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;
  const [prevFiles, setPrevFiles] = useState(files);
  const code = files[activeFile].code;
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const user = JSON.parse(localStorage.getItem("user"))?.uid;
  const { repoState } = useRepoStore();

  const editorRef = useRef(null);
  const [cursors, setCursors] = useState([]);

  const { users } = useOnlineUserStore();
  const params = useParams();

  // Handle template change
  const handleTemplateChange = (e) => {
    const newTemplate = e.target.value;
    setSelectedTemplate(newTemplate);
    setTemplate(newTemplate); // Update the parent component's template state
  };

  useEffect(() => {
    console.log("files", files);

    const handleFileCreation = async (newFiles) => {
      try {
        // Make API call
        const repoId = params.repo;
        const arr = Object.keys(newFiles)
          .filter((key) => key.startsWith("/src/"))
          .map((key) => {
            return {
              content: files[key].code,
              path: key.split("/").slice(-1).join("/"),
              name: key.split("/").slice(-1).join("/"),
            };
          });
        console.log("arr", arr);
        console.log(repoId);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/file/add-files`,
          {
            repoId: repoId,
            files: arr,
          }
        );

        console.log("File created:", response.data);
      } catch (error) {
        console.error("Error creating file:", error);
      }
    };
    if (files) handleFileCreation(files);

    setPrevFiles(files);
  }, [files]);

  const updateCodeInBackend = (filePath, newCode) => {
    if (socket) {
      socket.emit("updateFile", { filePath, newCode });
    }
  };

  useEffect(() => {
    if (code) {
      updateCodeInBackend(activeFile, code);
    }
  }, [code]);

  useEffect(() => {
    if (socket) {
      socket.on("fileUpdated", ({ filePath, newCode, repo }) => {
        sandpack.updateFile(filePath, newCode);
      });

      socket.on("fileCreated", ({ path, content, name, repoId }) => {
        const fullPath = `/src/${path}`;
        if (!files[fullPath]) {
          sandpack.updateFile(fullPath, content);
        }
      });

      socket.on("cursorMove", ({ userId, position, name }) => {
        setCursors((prev) => ({
          ...prev,
          [userId]: { position, name },
        }));
      });

      socket.on("removeCursor", ({ userId }) => {
        setCursors((prev) => {
          const newCursors = { ...prev };
          delete newCursors[userId];
          return newCursors;
        });
      });

      socket.on("getAllOnlineUsers", ({ users, repo }) => {
        useOnlineUserStore.setState({ users });
      });

      return () => {
        socket.emit("fileChange", { filePath: "" });
        socket.off("fileCreated");
        socket.off("fileUpdated");
        socket.off("getAllOnlineUsers");
        socket.off("cursorMove");
        socket.off("removeCursor");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && activeFile) {
      socket.emit("fileChange", { filePath: activeFile });
      setCursors({});
    }
  }, [activeFile, socket]);

  const handleCursorMove = (event) => {
    if (!socket || !editorRef.current) return;

    const editor = editorRef.current;
    const rect = editor.getBoundingClientRect();

    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    socket.emit("cursorMove", {
      position,
      filePath: activeFile,
    });
  };

  const getUserColor = (userId) => {
    const colors = [
      "#FF6B6B", "#FF9F43", "#FFD166", "#06D6A0", "#4ECDC4",
      "#45B7D1", "#9B59B6", "#F72585", "#FFFFFF"
    ];
    return colors[parseInt(userId, 32) % colors.length];
  };

  const RemoteCursor = ({ color, position, username }) => (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: 2,
          height: 15,
          background: color,
        }}
      />
      <div
        style={{
          background: color,
          padding: "2px 6px",
          borderRadius: "2px",
          fontSize: "12px",
          color: "white",
          marginTop: "-2px",
        }}
      >
        {username}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#011627] font-jetbrains">
      <Navbar repoName={repoState.repo.name} />
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 border-r border-[#1E2D3D] flex flex-col">
          <div className="p-3 border-b border-[#1E2D3D] flex justify-between items-center">
            <span className="text-[#5F7E97] font-medium text-sm">Explorer</span>
            <button className="p-1 hover:bg-[#1E2D3D] rounded">
              <Plus className="w-4 h-4 text-[#5F7E97]" />
            </button>
          </div>

          {/* Template Selector */}
          <div className="p-3 border-b border-[#1E2D3D]">
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-full bg-[#1E2D3D] text-[#5F7E97] border border-[#1E2D3D] rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F7E97]"
            >
              <option value="">Select Template</option>
              <option value="react">React</option>
              <option value="react-ts">React TypeScript</option>
              <option value="vanilla">Vanilla JS</option>
              <option value="vue">Vue</option>
              <option value="angular">Angular</option>
              <option value="svelte">Svelte</option>
            </select>
          </div>

          <div className="flex-1 overflow-auto">
            <SandpackFileExplorer />
          </div>

          {/* Online Users Section */}
          <div className="border-t border-[#1E2D3D]">
            <button
              className="w-full p-2 flex items-center justify-between gap-2 text-[#5F7E97] hover:bg-[#1E2D3D] transition-colors"
              onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Online Users</span>
              </div>
              <span className="text-xs bg-[#1E2D3D] px-2 py-1 rounded">
                {users.length}
              </span>
            </button>
            {showOnlineUsers && Array.isArray(users) && (
              <div className="max-h-48 overflow-y-auto border-t border-[#1E2D3D]">
                {users.map((user) => (
                  <OnlineUserBadge
                    key={user.userId}
                    name={user.name}
                    email={user.email}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rest of the component remains the same */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-1">
            <div className="flex-1">
              <div
                className="flex-1 relative"
                ref={editorRef}
                onMouseDown={handleCursorMove}
              >
                <SandpackCodeEditor
                  wrapContent
                  showTabs
                  closableTabs
                  showInlineErrors
                  showLineNumbers
                  style={{
                    height: "100%",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  extensions={[autocompletion()]}
                  extensionsKeymap={[completionKeymap]}
                />
                {Object.entries(cursors).map(([userId, cursor]) => (
                  <RemoteCursor
                    key={userId}
                    color={getUserColor(userId)}
                    position={cursor.position}
                    username={cursor.name}
                  />
                ))}
              </div>
            </div>
            <div className="w-1/2 border-l border-[#1E2D3D] flex flex-col">
              <div className="h-9 border-b border-[#1E2D3D] flex items-center px-4">
                <span className="text-[#5F7E97] text-sm">Preview</span> 
              </div>
              <div className="flex-1">
                <SandpackPreview style={{ height: "100%" }} />
                {/* <h1>{code}</h1> */}
              </div>
            </div>
          </div>

          {/* Console Section */}
          <div className="border-t border-[#1E2D3D]">
            <button
              className="w-full p-2 flex items-center justify-center gap-2 text-[#5F7E97] hover:bg-[#1E2D3D] transition-colors"
              onClick={() => setShowConsole(!showConsole)}
            >
              <Terminal className="w-4 h-4" />
              <span className="text-sm">Console</span>
            </button>
            {showConsole && (
              <div className="h-48 border-t border-[#1E2D3D] bg-[#011627] p-4">
                <div className="text-[#5F7E97] text-sm">
                  Console output will appear here...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default SandpackBetter;
