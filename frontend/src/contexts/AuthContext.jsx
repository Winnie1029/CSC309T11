import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return;
        }

        fetch(`${BACKEND_URL}/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => setUser(data.user))
            .catch(() => setUser(null));
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const login = async (username, password) => {
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const data = await res.json();
                return data.message;
            }

            const { token } = await res.json();
            localStorage.setItem("token", token);

            const me = await fetch(`${BACKEND_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!me.ok) throw new Error();

            const data = await me.json();
            setUser(data.user);
            navigate("/profile");
            return null;
        } catch (err) {
            return "Failed to login";
        }
    };

    const register = async ({ username, firstname, lastname, password }) => {
        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, firstname, lastname, password })
            });

            const data = await res.json();

            if (!res.ok) {
                return data.message;
            }

            navigate("/success");
            return null;
        } catch (err) {
            return "Failed to register";
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
