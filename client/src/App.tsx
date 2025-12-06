import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Landing from './components/landing'
import Bio from './components/bio'
import { SignedIn } from '@clerk/clerk-react'
import Signin from './components/signin'
import Signup from './components/signup'
import Home from './components/home'
// 1. Define the wrapper component to use the hook
function BioWrapper() {
  const navigate = useNavigate();
  
  // Define the success handler: navigate to the home dashboard
  const handleSuccess = () => {
    navigate('/home'); 
  };
  
  // Pass the handler down to the Bio component
  return (
    <SignedIn>
      {/* 2. Pass the required prop here */}
      <Bio onSuccess={handleSuccess} /> 
    </SignedIn>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/signin/*" element={<Signin/>}/>
        <Route path="/signup/*" element={<Signup/>}/>
        
        {/* 3. Render the wrapper component in the route */}
        <Route path="/bio" element={<BioWrapper />} /> 

        {/* Note: You need a route for /home, which Bio redirects to after success */}
        <Route path="/home" element={<SignedIn><Home/></SignedIn>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App