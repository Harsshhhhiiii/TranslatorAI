import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import ChatInterface from './ChatInterface'
import styles from './Dashboard.module.css'
import CircularProgress from '@mui/material/CircularProgress';
const Dashboard = () => {
    const [userInfo, setUserInfo] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const data = localStorage.getItem('user-info')
        const userData = JSON.parse(data)
        setUserInfo(userData)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('user-info')
        navigate('/login')
    }

    if (!userInfo) return (
        <div className={styles.loadingContainer}>
            <CircularProgress size={60} />
        </div>
    );
    return (
        <div className={styles.dashboardContainer}>
            <Navbar userInfo={userInfo} handleLogout={handleLogout} />
            <div className={styles.mainContent}>
                <ChatInterface />
            </div>
        </div>
    )
}

export default Dashboard