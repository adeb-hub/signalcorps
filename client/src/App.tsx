import {  Routes, Route } from 'react-router-dom'
import Landing from './components/landing'
import { SignedIn } from '@clerk/clerk-react'
import Signin from './components/signin'
import Signup from './components/signup'
import Verify from './components/verify'
function App() {

  return (
<Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/signin/*" element={<Signin/>}/>
  <Route path="/signup/*" element={<Signup/>}/>
  <Route path="/bio" element={<SignedIn><Verify/></SignedIn>}/>
</Routes>

  )
}

export default App