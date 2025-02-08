// "use client"; // Ensure this is a client component

// import {
//   SandpackProvider,
//   SandpackThemeProvider,
// } from "@codesandbox/sandpack-react";
// import { nightOwl } from "@codesandbox/sandpack-themes";
// import { useEffect, useState } from "react";
// import SandpackBetter from "@/components/SandpackBetter";
// import { useSearchParams } from "next/navigation"; // ✅ Use next/navigation instead of next/router
// import { SocketProvider } from "@/app/context/socket";
// import Navbar from "@/components/code-editor/ide-navbar";
// // Utility function to transform repository data
// const transformRepoToFiles = (repo) => {
//   const files = {};

//   const processNode = (node, currentPath = "/src") => {
//     if (node.isFile) {
//       files[`${currentPath}/${node.name}`] = node.content || "";
//     } else {
//       const newPath = `${currentPath}/${node.name}`;
//       if (node.children && Array.isArray(node.children)) {
//         node.children.forEach((child) => processNode(child, newPath));
//       }
//     }
//   };

//   if (repo.mainFolders && Array.isArray(repo.mainFolders)) {
//     repo.mainFolders.forEach((folder) => processNode(folder));
//     console.log(repo.mainFolders)
//   }
//   console.log(files)

//   return files;
// };

// const MySandpackComponent = () => {
//   const searchParams = useSearchParams(); // ✅ Replaces useRouter()
//   const repoKey = searchParams.get("repoId"); // ✅ Get repoKey from URL query
  
//   const [files, setFiles] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL;
//   console.log(repoKey)
//   useEffect(() => {
//     const fetchRepo = async () => {
//       if (!repoKey) return;

//       setIsLoading(true);
//       setError(null);

//       try {
//         const response = await fetch(`${BACKEND_URL}/api/v1/repo/get-repo/${repoKey}`);
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         const data = await response.json();
//         console.log(data)

//         if (data.repo) {
//           console.log(transformRepoToFiles(data.repo))
//           setFiles(transformRepoToFiles(data.repo));
//           console.log(data.repo)
//         } else {
//           throw new Error("No repository data found");
//         }
//       } catch (error) {
//         console.error("Error fetching repository:", error);
//         setError(error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchRepo();
//   }, [repoKey]);

//   if (error) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-[#011627] text-white">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold mb-2">Error Loading Repository</h2>
//           <p className="text-red-400">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-[#011627] text-white">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold mb-2">Loading Repository...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex flex-col bg-[#011627]">
//       <SandpackProvider template="react-ts" files={files} theme="dark">
//         <SandpackThemeProvider theme={nightOwl}>
//           <SandpackBetter className="mt-4"/>
//         </SandpackThemeProvider>
//       </SandpackProvider>
//     </div>
//   );
// };

// export default MySandpackComponent;
