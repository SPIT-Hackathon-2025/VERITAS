export default function Collaborators() {
  const collaborators = [
    { id: 1, name: "Alice", color: "bg-[#61afef]" },
    { id: 2, name: "Bob", color: "bg-[#98c379]" },
    { id: 3, name: "Charlie", color: "bg-[#e5c07b]" },
  ]

  return (
    <div className="flex-1 p-4 overflow-auto">
      <h2 className="text-sm font-medium mb-2">Live Collaborators</h2>
      <ul className="space-y-2">
        {collaborators.map((collaborator) => (
          <li key={collaborator.id} className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${collaborator.color}`} />
            <span className="text-sm">{collaborator.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

