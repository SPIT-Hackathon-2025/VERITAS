import {
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { SandpackFileExplorer } from "sandpack-file-explorer";
import { Terminal, Plus, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/app/context/socket";
import useOnlineUserStore from "@/app/context/onlineUserStore";

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

function SandpackBetter() {
  const socket = useSocket();
  const [showConsole, setShowConsole] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(true);
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;
  const code = files[activeFile].code;
  const {users} = useOnlineUserStore();
  // const params = useParams();
  // const user = JSON.parse(localStorage.getItem('user')).uid;
  
  const editorRef = useRef(null);
  const [cursors, setCursors] = useState([]);

  // console.log("repoState", repoState);

  // useEffect(() => {
  //   const id=getFileIdFromPath(repoState, "README.md");
  //   console.log('id is',id);
    
  // }, [repoState]);

  function getFileIdFromPath(repo, filePath) {
    function searchFolders(folders, target) {
      
      if(!folders || !folders.length) return null; // File not found
      for(const folder of folders) {
        console.log('folder',folder);
        
        if(folder.isFile && folder.name === target) {
            return folder._id;
          } else {
            const id=searchFolders(folder.children, target)
            if(id) return id
          }
        }
        return null
      }
      

    const target = filePath.split("/").pop(); // Split path into array
    console.log(repo?.repo?.mainFolders);
    
    return searchFolders(repo?.repo?.mainFolders, target);
  }

  const updateCodeInBackend = (filePath, newCode) => {
    if (socket) {
      console.log(newCode, filePath);
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
      socket.on('fileUpdated', ({ filePath, newCode, repo }) => {
        // Only update if the file update is for our repo
          sandpack.updateFile(filePath, newCode);
      });

      socket.on("cursorMove", ({ userId, position, name }) => {
        setCursors((prev) => ({
          ...prev,
          [userId]: { position, name },
        }));
      });

      socket.on('removeCursor', ({ userId }) => {
        setCursors(prev => {
          const newCursors = { ...prev };
          delete newCursors[userId];
          return newCursors;
        });
      });

      socket.on('getAllOnlineUsers', ({ users, repo }) => {
        // Only update users if the update is for our repo
          useOnlineUserStore.setState({ users });
      });

      return () => {
        socket.emit("fileChange", { filePath: '' });
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
      // socket.emit('removeCursor', { filePath: activeFile });
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

    console.log(position);

    socket.emit("cursorMove", {
      position,
      filePath: activeFile, // Add this line
    });
  };

  const getUserColor = (userId) => {
    const colors = [
      "#FF6B6B", // Bright Red
      "#FF9F43", // Vivid Orange
      "#FFD166", // Vibrant Yellow
      "#06D6A0", // Neon Green
      "#4ECDC4", // Cyan
      "#45B7D1", // Bright Blue
      "#9B59B6", // Deep Purple
      "#F72585", // Electric Pink
      "#FFFFFF", // White for high contrast
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

      {/* Rest of the existing code remains the same */}
      <div className="flex-1 flex flex-col h-full">
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
            </div>
          </div>
        </div>
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
