import next from 'next';
import { useState } from 'react';
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router';
import style from '../styles/navbar.module.css';
export default function Navbar({children}){
    const router  = useRouter();
    const [ currentRoute, setCurrentRoute ] = useState('home')
    const { isConnected } = useAccount();
    const tabs = [
        {
            key: 'home',
            title: 'HOME',
            link: '/'
        },
        {
            key: 'nftCreate',
            title: 'NFT CREATE',
            link: '/upload'
        },
        {
            key: 'ownNfts',
            title: 'OWN NFTS',
            link: '/ownNft'
        },
        {
            key: 'market',
            title: 'MARKET',
            link: '/market'
        },
        {
            key: 'collections',
            title: 'COLLECTIONS',
            link: '/collections'
        }
    ]
    const next = item => {
        isConnected && router.push(item?.link ?? '/');
        setCurrentRoute(item?.key ?? 'home');
    }
    return (
        <div className={style.navContainer}>
            {
                tabs.map(item=>{
                    return <div key={item.title} className={`${style.navItem} ${currentRoute===item?.key ? style.navActive : ''}`} onClick={()=>{next(item)}}>{item.title}</div>
                })
            }

        </div>
    )
}