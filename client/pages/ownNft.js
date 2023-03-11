import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAccount, useBalance, useContractEvent, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { NFET_CONTRACT_ADDRESS, collectionsAbi } from '../config/contract';
import pg1 from './imgs/pg1.png';
import style from '../styles/nftPage.module.css';
import { ethers } from 'ethers';
const NftPage = () => {
    const [ nftInfos, setNftInfos ] = useState([])
    const { address, isConnected } = useAccount()
    const router = useRouter();
    useEffect(()=>{
        if(!isConnected){
            router.push('/');
        }
    }, [])

    const balance = useBalance({
        address,
        watch: true
    })

    const { data: nfts } = useContractRead({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        functionName: 'getAllNftByAddress',
        watch: true,
        overrides: { from: address },
        args: [ address ],
        onSuccess: nfts => {
            const defaultUrl = 'https://ipfs.io/ipfs/';
            const promiseList = [];
            nfts.forEach(async hash => {
                promiseList.push(new Promise(async resolve=>{
                    const res = await fetch(`${defaultUrl}${hash}`);
                    resolve(res.json())
                }))
            });
            Promise.all(promiseList).then(res=>{
                const tempNftInfos = res.map(el=>{
                    let defualtCardInfo = {
                        pngSrc: pg1.src,
                        nftName: 'NFT1',
                        nftInfo: 'dfault video info'
                    }
                    defualtCardInfo.pngSrc = el.image;
                    defualtCardInfo.nftName = el.name;
                    defualtCardInfo.nftInfo = el.description;
                    defualtCardInfo.resourceVideo = el.resourceVideo;
                    el = defualtCardInfo;
                    return el
                })
                setNftInfos(tempNftInfos)

            })
        }
    })

    const { data: owner } = useContractRead({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        functionName: 'owner',
        watch: true,
        overrides: { from: address }
    })


    const { config: configWithdraw } = usePrepareContractWrite({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        functionName: 'withdraw',
        overrides: { from: address }
    })

    const { write: writeWithdraw } = useContractWrite(configWithdraw)

    useContractEvent({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        eventName: 'WithdrawEvent',
        listener(owner, value) {
            alert(`${owner}: you witdraw(value: ${value} successfullt)`);
        } 
    })


    const filterLink = linkOrHash => {
        const defaultUrl = 'https://ipfs.io/ipfs/';
        return String(linkOrHash).search('https') !== -1 ? linkOrHash : `${defaultUrl}${linkOrHash}`;
    }
    const cardContent = (item, index) => {
        return (
            <Card sx={{maxWidth: 245}} key={index} className={style.cardContainer}>
                <CardActionArea>
                    <div className={style.pngContainer}>
                        <img src={item?.pngSrc} alt="png" className={style.nftPg} />
                    </div>
                    <CardContent>
                        <Typography variant='body2' color="text.secondary" className={style.infoContent} title={item?.nftInfo}>
                            {item?.nftInfo}
                            <a href={filterLink(item?.resourceVideo)} className={style.linkStyle} target="_blank" rel="noreferrer"> secret video link </a>
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        )
    }
    return (
        <div className={style.nftPageContainer}>
            <div className={style.header}>
                <div>当前账户：{address}; 账户余额: { Number(ethers.utils.formatEther(balance?.data?.value ?? 0)) }(ETH)
                {String(owner) === String(address) && <a className={style.withdrawStyle} onClick={()=>{writeWithdraw?.()}}>提款</a>}
                </div>
            </div>
            <div className={style.listContainer}>
                {
                    nftInfos.map((item, index) => {
                        return cardContent(item, index);
                    })
                }
            </div>
        </div>
    )
}

export default NftPage