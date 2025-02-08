import React, { useState } from 'react';
import { Trash2, Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

const FileTreeItem = ({ name, isFolder, isOpen, onClick, onDelete, depth = 0, isActive }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-700 group ${
        isActive ? 'bg-blue-600' : ''
      }`}
      onClick={handleClick}
      style={{ paddingLeft: `${depth * 12 + 8}px `}}
    >
      <span className="mr-2">
        {isFolder ? (
          isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : null}
      </span>
      {isFolder ? <Folder className="w-4 h-4 mr-2" /> : <File className="w-4 h-4 mr-2" />}
      <span className="flex-1">{name}</span>
      {!isFolder && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const FileTree = ({ files, activeFile, onFileClick, onDelete }) => {
  const [openFolders, setOpenFolders] = useState(new Set(['/']));

  // Build file system tree
  const fileSystem = {};
  Object.keys(files).forEach(path => {
    const parts = path.split('/').filter(Boolean);
    let current = fileSystem;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current[part] = { type: 'file', path };
      } else {
        current[part] = current[part] || { type: 'folder', children: {} };
        current = current[part].children;
      }
    });
  });

  const handleFileClick = (path) => {
    console.log('File clicked:', path); // Debug log
    if (typeof onFileClick === 'function') {
      onFileClick(path);
    }
  };

  const handleFolderClick = (path) => {
    const newOpenFolders = new Set(openFolders);
    if (openFolders.has(path)) {
      newOpenFolders.delete(path);
    } else {
      newOpenFolders.add(path);
    }
    setOpenFolders(newOpenFolders);
  };

  const renderTree = (tree, path = '', depth = 0) => {
    return Object.entries(tree).map(([name, node]) => {
      const fullPath = `${path}/${name}`;
      const isOpen = openFolders.has(fullPath);

      if (node.type === 'folder') {
        return (
          <div key={fullPath}>
            <FileTreeItem
              name={name}
              isFolder={true}
              isOpen={isOpen}
              depth={depth}
              onClick={() => handleFolderClick(fullPath)}
            />
            {isOpen && (
              <div>
                {renderTree(node.children, fullPath, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <FileTreeItem
          key={fullPath}
          name={name}
          isFolder={false}
          depth={depth}
          isActive={node.path === activeFile}
          onClick={() => handleFileClick(node.path)}
          onDelete={() => onDelete(node.path)}
        />
      );
    });
  };

  // Debug logs
  console.log('Current activeFile:', activeFile);
  console.log('Available files:', Object.keys(files));

  return (
    <div className="text-sm text-gray-200">
      {renderTree(fileSystem)}
    </div>
  );
};