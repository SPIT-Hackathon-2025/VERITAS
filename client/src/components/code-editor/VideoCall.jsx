import { Video, Mic, PhoneOff } from "lucide-react"

export default function VideoCall() {
  return (
    <div className="h-48 border-b border-[#3e4451] p-4 flex flex-col">
      <h2 className="text-sm font-medium mb-2">Video Call</h2>
      <div className="flex-1 bg-[#282c34] rounded-md flex items-center justify-center">
        <span className="text-sm text-[#abb2bf]">No active call</span>
      </div>
      <div className="flex justify-center mt-2 space-x-2">
        <button className="p-2 bg-[#3e4451] rounded-full hover:bg-[#4b5363] transition-colors">
          <Video className="w-4 h-4" />
        </button>
        <button className="p-2 bg-[#3e4451] rounded-full hover:bg-[#4b5363] transition-colors">
          <Mic className="w-4 h-4" />
        </button>
        <button className="p-2 bg-[#e06c75] rounded-full hover:bg-[#e58c93] transition-colors">
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

