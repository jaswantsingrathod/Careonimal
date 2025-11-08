import Account from './pages/Account'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Contact from './pages/Contact'
import Provider from './pages/Provider'
import Navbar from './components/navbar'
import AboutUs from './pages/AboutUs'
import Dashboard from './pages/Dashboard'

import './App.css'
import { Routes, Route} from "react-router-dom"

function App() {

  return (
    <>
      <div>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/register" element={<Register/>}></Route>
          <Route path="/contact" element={<Contact/>}></Route>
          <Route path="/account" element={<Account/>}></Route>
          <Route path="/provider" element={<Provider/>} ></Route>
          <Route path='/about' element={<AboutUs/>}></Route>
          <Route path='/dashboard' element={<Dashboard/>}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
