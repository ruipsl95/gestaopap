import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <WifiOff className="h-16 w-16 text-slate-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sem Ligação</h1>
        <p className="text-slate-400">
          Verifique a sua ligação à internet e tente novamente.
        </p>
      </div>
    </div>
  );
}
