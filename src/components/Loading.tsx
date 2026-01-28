import { Loader } from "lucide-react";

export function Spinner() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Loader className="animate-spin" />
    </div>
  );
}