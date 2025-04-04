import React from 'react';
import { Logout } from '@mui/icons-material';
import styles from './Navbar.module.css';

const Navbar = ({ userInfo, handleLogout }) => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navLeft}>
                <h2 className={styles.greeting}>
                    👋 Hello, {userInfo.name}!
                </h2>
            </div>
            <div className={styles.navRight}>
                <button 
                    onClick={handleLogout}
                    className={styles.logoutButton}
                >
                    <Logout />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;