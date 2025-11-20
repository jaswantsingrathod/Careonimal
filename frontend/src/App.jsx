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
import ProviderProfile from './pages/ProviderProfile'
import ProviderList from './pages/ProviderList'
import UsersList from './pages/UsersList'
import AdminProfile from './pages/AdminProfile'

import './App.css'
import { Routes, Route} from "react-router-dom"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {

  return (
    <>
    <ToastContainer position="top-right" theme="colored" autoClose={2000} />
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
          <Route path='/admin/provider/:id' element={<ProviderProfile/>}></Route>
          <Route path='/admin/users/list' element={<UsersList/>}></Route>
          <Route path='/admin/providers/list' element={<ProviderList/>}></Route>
          <Route path='/admin/profile' element={<AdminProfile/>}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
