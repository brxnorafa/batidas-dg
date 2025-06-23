import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [role, setRole] = useState(null);

    // load role localStorage
    useEffect(() => {
        const savedRole = localStorage.getItem('role');
        if (savedRole) setRole(savedRole);
    }, []);

    function login(userRole) {
        setRole(userRole);
        localStorage.setItem('role', userRole);
    }

    function logout() {
        setRole(null);
        localStorage.removeItem('role');
    }

    return(
        <AuthContext.Provider value={{ role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}