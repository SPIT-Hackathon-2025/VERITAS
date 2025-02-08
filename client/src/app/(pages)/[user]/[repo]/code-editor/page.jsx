"use client";
import {
  SandpackProvider,
  SandpackThemeProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackStack,
  SandpackLayout,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { SandpackFileExplorer } from "sandpack-file-explorer";
import { useEffect, useState } from "react";
import { Terminal, Play, Plus, X } from 'lucide-react';
import SandpackBetter from "@/components/SandpackBetter";
import { SocketProvider } from "@/app/context/socket";


const MySandpackComponent = () => {
  const [files, setFiles] = useState({
    "/src/index.js": `export default function App() {
      return <h1>Hello World</h1>
    }`,
    "/src/components/Button.js": `export default function Button({ children }) {
      return <button className="px-4 py-2 bg-blue-500 rounded">{children}</button>
    }`,
    "/src/components/button/newButton.js": `export default function Button({ children }) {
      return <button className="px-4 py-2 bg-blue-500 rounded">{children}</button>
    }`,
    "/src/styles/main.css": `body {
      margin: 0;
      padding: 1rem;
    }`,
  });

  useEffect(() => {
    console.log(files);
  }, [files]);

  const [activeFile, setActiveFile] = useState("/src/App.js");
  const [showConsole, setShowConsole] = useState(false);

  return (
    <SocketProvider>
      <div className="h-screen flex flex-col bg-[#011627]">
        {/* Header */}
        {/* <div className="h-12 border-b border-[#1E2D3D] flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-white font-medium">Sandpack Editor</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 bg-[#0088CC] text-white rounded-md text-sm flex items-center gap-2 hover:bg-[#0099DD] transition-colors">
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
        </div> */}

        <SandpackProvider
          template="react-ts"
          files={files}
          theme="dark"
          options={{
            visibleFiles: Object.keys(files),
            recompileMode: "immediate",
            showNavigator: true,
          }}
        >
          <SandpackThemeProvider theme={nightOwl}>
            <SandpackBetter/>
          </SandpackThemeProvider>
        </SandpackProvider>
      </div>
    </SocketProvider> 
  );
};

export default MySandpackComponent;