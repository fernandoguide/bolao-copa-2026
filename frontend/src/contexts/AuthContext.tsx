import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextData {
    user: User | null;
    signed: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get<User>('/users/me')
                .then(setUser)
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    async function login(email: string, password: string) {
        const res = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password });
        localStorage.setItem('token', res.access_token);
        setUser(res.user);
    }

    async function register(name: string, email: string, password: string) {
        const res = await api.post<{ access_token: string; user: User }>('/auth/register', { name, email, password });
        localStorage.setItem('token', res.access_token);
        setUser(res.user);
    }

    function logout() {
        localStorage.removeItem('token');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, signed: !!user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
