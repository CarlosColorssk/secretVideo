import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { NFET_CONTRACT_ADDRESS, collectionsAbi } from '../config/contract';
import pg1 from './imgs/pg1.png';
import style from '../styles/nftPage.module.css';
const NftPage = () => {
    const [ nftInfos, setNftInfos ] = useState([])
    const { address, isConnected } = useAccount()
    const router = useRouter();
    useEffect(()=>{
        if(!isConnected){
            router.push('/');
        }
    }, [])

    const { data: nfts } = useContractRead({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        functionName: 'getCollections',
        watch: true,
        overrides: { from: address },
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
                <div>当前账户：{address}
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