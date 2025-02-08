"use-client";
import {
  SandpackPreview,
  SandpackCodeEditor,
  SandpackStack,
  useSandpack
} from "@codesandbox/sandpack-react";
import { SandpackFileExplorer } from "sandpack-file-explorer";
import { Terminal, Plus } from "lucide-react";
import { useState } from "react";

function SandpackBetter() {
  const [showConsole, setShowConsole] = useState(false);
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;

  const code = files[activeFile].code;
  console.log(code);
  return (
    <SandpackStack>
      <div className="flex-1 flex min-h-0 ">
        {/* File Explorer */}
        <div className="w-64 border-r border-[#1E2D3D] flex flex-col">
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
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-1 min-h-0">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              <SandpackCodeEditor
                wrapContent
                showTabs
                closableTabs
                showInlineErrors
                showLineNumbers
                style={{
                  flex: 1,
                  minHeight: 0,
                  height: "100%",
                }}
              />
            </div>

            {/* Preview Panel */}
            <div className="w-1/2 border-l border-[#1E2D3D] flex flex-col">
              <div className="h-9 border-b border-[#1E2D3D] flex items-center px-4">
                <span className="text-[#5F7E97] text-sm">Preview</span>
              </div>
              <div className="flex-1 min-h-0">
                <SandpackPreview
                  style={{
                    height: "100%",
                    minHeight: 0,
                  }}
                />
              </div>
            </div>
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
    </SandpackStack>
  );
}

export default SandpackBetter;
