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
  // const { sandpack } = useSandpack();
  useEffect(() => {
    console.log(files);
  }, [files]);
  const [activeFile, setActiveFile] = useState("/src/App.js");
  const [showConsole, setShowConsole] = useState(false);
  return (
    <SandpackProvider
      template="react-ts"
      files={files}
      theme="dark"
      options={{
        visibleFiles: Object.keys(files),
        recompileMode: "immediate",
      }}
    >
      <SandpackThemeProvider theme={nightOwl}>
        <SandpackStack>
          <SandpackLayout>
            <div
              style={{
                display: "flex",
                width: "100%",
                minHeight: "300px",
                maxHeight: "500px",
                backgroundColor: `var(--sp-colors-surface1)`,
              }}
            >
              <div
                style={{
                  minWidth: 150,
                  maxWidth: "300px",
                  overflow: "hidden",
                }}
              >
                <SandpackFileExplorer />
              </div>
              <div style={{ flex: "min-content" }}>
                <SandpackCodeEditor
                  wrapContent
                  style={{
                    minHeight: "100%",
                    maxHeight: "100%",
                    overflow: "auto",
                  }}
                  showTabs
                  closableTabs
                  showInlineErrors
                  showLineNumbers
                />
              </div>
            </div>
            <SandpackPreview />
          </SandpackLayout>
        </SandpackStack>
      </SandpackThemeProvider>
    </SandpackProvider>
  );
};
export default MySandpackComponent;
