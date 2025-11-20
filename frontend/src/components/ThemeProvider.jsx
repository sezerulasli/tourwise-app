import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'


export default function ThemeProvider({ children }) {
    const { theme } = useSelector((state) => state.theme)

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme])

    return (
        <div className={theme}>
            <div className='bg-white text-gray-700 dark:text-gray-200 dark:bg-[rgb(22,26,29)] min-h-screen'>
                {children}
            </div>
        </div>
    )
}
