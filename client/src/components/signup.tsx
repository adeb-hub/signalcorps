import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4">
      
      {/* Optional: Simple Logo/Header above the form */}
      <div className="mb-8 text-center">
        <Link to="/" className="text-2xl font-bold tracking-tighter">
          Signal Corps.
        </Link>
        <p className="text-gray-500 text-sm mt-2">
          Join the high-signal network.
        </p>
      </div>

      {/* The Clerk Component */}
      <SignUp 
        path="/signup" 
        routing="path" 
        signInUrl="/signin"
        forceRedirectUrl="/bio" // Redirects here after success
        appearance={{
          elements: {
            // This overrides Clerk's purple to match Series (Black/White)
            formButtonPrimary: 
              "bg-black hover:bg-gray-800 text-white text-sm normal-case rounded-md",
            card: "shadow-sm border border-gray-200 rounded-xl",
            headerTitle: "font-bold tracking-tight text-xl",
            headerSubtitle: "text-gray-500",
            socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 text-black",
            footerActionLink: "text-black hover:underline"
          }
        }}
      />
      
      {/* Simple Footer */}
      <div className="mt-8 text-xs text-gray-400">
        Protected by Vibe Check Protocol v1.0
      </div>
    </div>
  );
}