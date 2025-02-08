"use client";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview
} from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import SandpackBox from "@/app/components/SandpackBox";


export default () => {
  
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
  // const { sandpack } = useSandpack();
  useEffect(() => {
    console.log(files);
    
  }, [files]);
  const [activeFile, setActiveFile] = useState("/src/App.js");
  const [showConsole, setShowConsole] = useState(false);
  return (
    <SandpackProvider
      template="react"
      files={files}
      theme="dark"
      options={{
        visibleFiles: Object.keys(files),
        recompileMode: "immediate",
      }}
    >
      <SandpackBox/>
    </SandpackProvider>
  );
};
