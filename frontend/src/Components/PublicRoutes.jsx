import React from "react";
import { useAuth } from "../Context/authContext.jsx";
import { Navigate } from "react-router-dom";

export default function PublicRoutes({ children }) {
    const { user } = useAuth();

    if(user){
        return <Navigate to='/home'/>
    }

    return children;
}