import { SandpackCodeEditor, SandpackPreview, useSandpack } from "@codesandbox/sandpack-react"

export default function Editor() {
  const { sandpack } = useSandpack()
  const { files } = sandpack

  return (
    <div className="flex-1 flex overflow-hidden">
      {Object.keys(files).length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#abb2bf]">
          No files open. Create a new file to start coding.
        </div>
      ) : (
        <>
          <div className="flex-1">
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              closableTabs
              style={{ height: "100%" }}
            />
          </div>
          <div className="w-1/2 border-l border-[#3e4451]">
            <SandpackPreview style={{ height: "100%" }} />
          </div>
        </>
      )}
    </div>
  )
}

