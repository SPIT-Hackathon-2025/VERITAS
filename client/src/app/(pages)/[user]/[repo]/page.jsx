"use client"
import React, { useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { ChevronsUpDown, Terminal, Play, Plus } from 'lucide-react';
import { FileTree } from '@/app/components/fileTree';

// This component wraps the file tree and handles Sandpack state
const FileTreeWrapper = ({ files, activeFile, onDelete, setActiveFile}) => {
  const { sandpack } = useSandpack();
  
  const handleFileClick = (newFile) => {
    sandpack.setActiveFile(newFile);
    setActiveFile(newFile)
  };

  return (
    <FileTree
      files={files}
      activeFile={activeFile}
      onFileClick={handleFileClick}
      onDelete={onDelete}
    />
  );
};

const WebIDE = () => {
  const [files, setFiles] = useState({
    "/src/App.js": `export default function App() {
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
  
  const [activeFile, setActiveFile] = useState("/src/App.js");
  const [showConsole, setShowConsole] = useState(false);
  
  const addNewFile = () => {
    const path = prompt("Enter file path (e.g., src/components/NewFile.js):");
    if (path) {
      const fullPath = path.startsWith('/') ? path : `/${path}`;
      setFiles(prev => ({
        ...prev,
        [fullPath]: ""
      }));
      setActiveFile(fullPath);
    }
  };

  const deleteFile = (filename) => {
    if (Object.keys(files).length <= 1) {
      alert("Cannot delete the last file");
      return;
    }
    
    const newFiles = { ...files };
    delete newFiles[filename];
    setFiles(newFiles);
    
    if (activeFile === filename) {
      setActiveFile(Object.keys(newFiles)[0]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold">Web IDE</h1>
        <button 
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2"
          onClick={() => {
            // Trigger any custom run logic here
          }}
        >
          <Play className="w-4 h-4" />
          Run
        </button>
      </div>
      
      <SandpackProvider
        files={files}
        theme="dark"
        template="react"
        options={{
          activeFile: activeFile,
          visibleFiles: Object.keys(files),
          recompileMode: "immediate",
        }}
      >
        <div className="flex-1 flex">
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <button
                onClick={addNewFile}
                className="w-full px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New File
              </button>
            </div>
            <div className="p-2">
              <FileTreeWrapper
                files={files}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
                onDelete={deleteFile}
              />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <SandpackLayout>
              <div className="flex-1">
                <SandpackCodeEditor 
                  showTabs
                  showLineNumbers={true}
                  showInlineErrors={true}
                  wrapContent={true}
                  closableTabs={true}
                />
              </div>
            </SandpackLayout>
          </div>
          
          <div className="w-1/2 border-l border-gray-700 flex flex-col">
            <SandpackPreview />
            <div className="border-t border-gray-700">
              <button
                className="w-full p-2 flex items-center justify-center gap-2 hover:bg-gray-800"
                onClick={() => setShowConsole(!showConsole)}
              >
                <Terminal className="w-4 h-4" />
                <span>Console</span>
                <ChevronsUpDown className="w-4 h-4" />
              </button>
              {showConsole && (
                <div className="h-48 overflow-auto">
                  <SandpackConsole />
                </div>
              )}
            </div>
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
};

export default WebIDE;