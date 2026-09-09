import React from "react";
import { useAuth } from "../Context/authContext.jsx";
import { Navigate } from "react-router-dom";

export default function ProtectedRoutes({ children }) {
    const { user } = useAuth();

    if(!user){
        return <Navigate to='/login'/>
    }

    return children;
}