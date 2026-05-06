import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="w-full flex flex-col min-h-screen">
       <Navigation />
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>

      <Footer className="w-full!" />
    </div>
  );
};

export default NotFound;
