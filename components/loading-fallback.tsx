import Logo from "./logo";
import { Spinner } from "./ui/spinner";

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="size-16" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}
