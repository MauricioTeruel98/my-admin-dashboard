import { supabase } from '@/supabase/supabase';
import React from 'react';

const LogoutButton = () => {
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error al cerrar sesión:", error.message);
        } else {
            // Redirigir al usuario a la página de inicio o login
            window.location.href = '/login';
        }
    };

    return (
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
            Cerrar sesión
        </button>
    );
};

export default LogoutButton;
