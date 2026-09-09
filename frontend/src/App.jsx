import React from "react";
import {BrowserRouter, Routes,Route} from "react-router-dom"
import SignUp from "./Pages/Signup";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import ProtectedRoutes from "./Components/ProtectedRoutes.jsx";
import PublicRoutes from "./Components/PublicRoutes.jsx";
import { AuthProvider } from "./Context/authContext.jsx";


export default function App(){

    return(
        <>
            <AuthProvider>

            <BrowserRouter>
                <Routes>
                    <Route path="/home" element ={<ProtectedRoutes><Home/></ProtectedRoutes>}></Route>
                    <Route path="/register" element={<PublicRoutes><SignUp/></PublicRoutes>}></Route>
                    <Route path="/login" element={<PublicRoutes><Login/></PublicRoutes>}></Route>
                    
                </Routes>
            </BrowserRouter>
            </AuthProvider>
        </>
    )
}