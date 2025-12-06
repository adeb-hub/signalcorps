import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './components/landing'
import Bio from './components/signup'
import { SignedIn } from '@clerk/clerk-react'
import Signin from './components/signin'
import Signup from './components/signup'
function App() {

  return (
<BrowserRouter>
<Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/signin/*" element={<Signin/>}/>
  <Route path="/signup/*" element={<Signup/>}/>
  <Route path="/bio" element={<><SignedIn><Bio/></SignedIn></>}/>
</Routes>

</BrowserRouter>
  )
}

export default App
