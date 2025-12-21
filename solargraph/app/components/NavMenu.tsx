'use client';

import Link from 'next/link'
import { useState } from 'react';
import styles from '../styles/Navbar.module.css'

export default function NavMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const openMenu = () => setIsOpen(!isOpen);
    const navclass = `${styles.navmenu} ${isOpen ? styles.active: '' }`;
    const hamburgerclass = `${styles.hamburger} ${isOpen ? styles.active : '' }`;
    const navlinkclass = `${styles.navlink} ${isOpen ? styles.active : '' }`;

    return (
        <>
        <header className={styles.header}>
            <nav className={styles.navbar}>
                <ul className={navclass}>
                    <li className={styles.navitem}>
                        <Link href="/"><p className={navlinkclass} onClick={openMenu}>Home</p></Link>
                    </li>
                    <li className={styles.navitem}>
                        <Link href="/samples"><p className={navlinkclass} onClick={openMenu}>Samples</p></Link>
                    </li>
                    <li className={styles.navitem}>
                        <Link href="/daily"><p className={navlinkclass} onClick={openMenu}>Daily</p></Link>
                    </li>
                    <li className={styles.navitem}>
                        <Link href="/monthly"><p className={navlinkclass} onClick={openMenu}>Monthly</p></Link>
                    </li>
                </ul>
                <button className={hamburgerclass} onClick={openMenu}>
                    <span className={styles.bar}></span>
                    <span className={styles.bar}></span>
                    <span className={styles.bar}></span>
                </button>
            </nav>
        </header>
        </>
    )
}