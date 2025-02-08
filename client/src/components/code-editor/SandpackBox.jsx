import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
  useSandpack
} from "@codesandbox/sandpack-react";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";

function SandpackBox() {
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;
 
  const code = files[activeFile].code;
  console.log(code);
  
  return (
    <div>
      <SandpackLayout>
        <SandpackFileExplorer />
        <SandpackCodeEditor extensions={[autocompletion()]}
        extensionsKeymap={[completionKeymap]}/>
        <SandpackPreview />
      </SandpackLayout>
    </div>
  );
}

export default SandpackBox;
