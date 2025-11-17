import Account from './pages/Account'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Contact from './pages/Contact'
import Provider from './pages/Provider'
import Navbar from './components/navbar'
import AboutUs from './pages/AboutUs'
import Dashboard from './pages/Dashboard'
import AdminDasboard from './pages/AdminDashboard'
import UserProfile from './pages/UserProfile'
// import { useContext } from 'react'
// import UserContext from './context/User-Context'
// import { useNavigate } from 'react-router-dom'

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
          <Route path='/adminDashboard' element={<AdminDasboard/>}></Route>
          <Route path='/admin/user/:id' element={<UserProfile/>}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
