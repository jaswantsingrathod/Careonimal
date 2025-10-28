import { useState } from 'react'
import Account from './pages/Account'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Services from './pages/services'
import Contact from './pages/Contact'
import Boarding from './pages/Boarding'
import Clinic from './pages/Clinic'
import Groomers from './pages/Groomers'
import Navbar from './components/navbar'



import './App.css'
import { Routes, Route} from "react-router-dom"

function App() {

  return (
    <>
      <div>
        <h1>Careonimal</h1>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/register" element={<Register/>}></Route>
          <Route path="/services" element={<Services/>}></Route>
          <Route path="/contact" element={<Contact/>}></Route>
          <Route path="/account" element={<Account/>}></Route>
          <Route path="/boarding" element={<Boarding/>}></Route>
          <Route path="/clinic" element={<Clinic/>}></Route>
          <Route path="/groomers" element={<Groomers/>}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
