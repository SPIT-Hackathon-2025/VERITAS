"use client";
import {
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { SandpackFileExplorer } from "sandpack-file-explorer";
import { Terminal, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocket } from "@/app/context/socket";
import useOnlineUserStore from "@/app/context/onlineUserStore";

function SandpackBetter() {
  const socket = useSocket();
  const { users, setUsers } = useOnlineUserStore(); // Zustand store for online users
  const [showConsole, setShowConsole] = useState(false);
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;
  const code = files[activeFile].code;

  useEffect(() => {
    if (code) {
      updateCodeInBackend(activeFile, code);
    }
  }, [code]);

  useEffect(() => {
    console.log("Users:", users); // ✅ Debugging: Log online users
  }, [users]);

  const updateCodeInBackend = (filePath, newCode) => {
    if (socket) {
      socket.emit("updateFile", { filePath, newCode });
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("fileUpdated", ({ filePath, newCode }) => {
        console.log("File is updated", JSON.stringify(newCode));
        sandpack.updateFile(filePath, newCode);
      });

      // Fetch all online users from the socket
      socket.on("getAllOnlineUsers", (onlineUsers) => {
        console.log("Online users received:", onlineUsers);
        setUsers(onlineUsers); // ✅ Update Zustand store with online users
      });

      return () => {
        socket.off("fileUpdated");
        socket.off("getAllOnlineUsers"); // Clean up listeners
      };
    }
  }, [socket]);

  return (
    <div className="absolute inset-0 flex h-screen w-screen font-jetbrains">
      {/* File Explorer */}
      <div className="w-64 border-r border-[#1E2D3D] flex flex-col h-full">
        <div className="p-3 border-b border-[#1E2D3D] flex justify-between items-center">
          <span className="text-[#5F7E97] font-medium text-sm">Explorer</span>
          <button className="p-1 hover:bg-[#1E2D3D] rounded">
            <Plus className="w-4 h-4 text-[#5F7E97]" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <SandpackFileExplorer />
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex flex-1">
          {/* Code Editor */}
          <div className="flex-1">
            <SandpackCodeEditor
              wrapContent
              showTabs
              closableTabs
              showInlineErrors
              showLineNumbers
              style={{ height: "100%", fontFamily: "JetBrains Mono, monospace" }}
            />
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 border-l border-[#1E2D3D] flex flex-col">
            <div className="h-9 border-b border-[#1E2D3D] flex items-center px-4">
              <span className="text-[#5F7E97] text-sm">Preview</span>
            </div>
            <div className="flex-1">
              <SandpackPreview style={{ height: "100%" }} />
            </div>
          </div>
        </div>

        {/* Online Users List */}
        <div className="border-t border-[#1E2D3D] p-4 bg-[#011627] text-[#5F7E97]">
          <h3 className="text-sm font-semibold mb-2">Online Users</h3>
          <ul>
            {users.length > 0 ? (
              users.map((user) => (
                <li key={user.userId} className="text-xs">
                  {user.name} ({user.email})
                </li>
              ))
            ) : (
              <li className="text-xs">No users online</li>
            )}
          </ul>
        </div>

        {/* Console */}
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
  );
}

export default SandpackBetter;
