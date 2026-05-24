import { getMeAPI, loginAPI, logoutAPI } from "../services/api";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";



export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async() => {
            try {
                const token = sessionStorage.getItem("accessToken");
                if(token) {
                    const res = await getMeAPI();
                    setUser(res.data.user)
                }
            } catch(error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [])

    const login = async (email, password) => {
        try {
            const res = await loginAPI({ email, password });
            sessionStorage.setItem('accessToken', res.data.accessToken);
            setUser(res.data.user);
        } catch(error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    const logout = async () => {
        try {
            const token = sessionStorage.getItem("accessToken");
            if(token) {
                await logoutAPI();
                sessionStorage.removeItem("accessToken");
                setUser(null);
            }
        } catch(error) {
            console.error("Logout error:", error);
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}