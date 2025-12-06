import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Signin() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
          Signal Corps.
        </Link>
        <p className="text-gray-500 text-sm mt-2">
          Welcome back to the network.
        </p>
      </div>

      {/* The Clerk SignIn Component */}
      <SignIn 
        path="/signin" 
        routing="path" 
        signUpUrl="/signup"
        forceRedirectUrl="/bio" // Redirects here immediately after login
        appearance={{
          elements: {
            // Styling overrides for Series.so aesthetic (Black & White)
            formButtonPrimary: 
              "bg-black hover:bg-gray-800 text-white text-sm normal-case rounded-md",
            card: "shadow-sm border border-gray-200 rounded-xl bg-white",
            headerTitle: "font-bold tracking-tight text-xl",
            headerSubtitle: "text-gray-500",
            socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 text-black",
            footerActionLink: "text-black hover:underline",
            formFieldInput: "border-gray-200 focus:border-black focus:ring-black"
          }
        }}
      />
      
      {/* Footer */}
      <div className="mt-8 text-xs text-gray-400">
        Secure Access • Vibe Check Enabled
      </div>
    </div>
  );
}