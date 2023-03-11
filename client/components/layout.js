import style from '../styles/layout.module.css';
import Navbar from './navbar.js'
export default function Layout({children}){
    return (
        <>
            <Navbar/>
            <div className={style.layoutContainer}>{children}</div>
        </>
    )
}