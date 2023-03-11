import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAccount, useContractEvent, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { NFET_CONTRACT_ADDRESS, collectionsAbi } from '../config/contract';
import { ethers } from 'ethers';
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
    // read
    const { data: nfts } = useContractRead({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        functionName: 'showAllBriefNftExcludeOwner',
        watch: true,
        overrides: { from: address },
        onSuccess: nfts => {
            const defaultUrl = 'https://ipfs.io/ipfs/';
            const promiseList = [];
            if(nfts.filter(el=>String(el).trim().length>0).length>0){
                nfts.forEach(async hash => {
                    console.log(`${defaultUrl}${hash}`, nfts)
                    promiseList.push(new Promise(async (resolve, reject)=>{
                        try{
                            const res = await fetch(`${defaultUrl}${hash}`);
                            const data = await res.json();
                            resolve({...data, hash})
                        } catch (err){
                            console.log('error:', err)
                            reject(err)
                        }
                    
                    }))
                });
                if(promiseList.length){
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
                            defualtCardInfo.hash = el.hash;
                            el = defualtCardInfo;
                            return el
                        })
                        console.log(tempNftInfos)
                        setNftInfos(tempNftInfos)
        
                    })
                } 
            }
            }
    })

    // write
    const { config: configPurchase } = usePrepareContractWrite({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        functionName: "purchase",
        overrides: { from: address, value: ethers.utils.parseUnits('10000000', 'gwei'), gasLimit:  1000000},
        args: [''],
    })
    const {data, isLoading, isSuccess, write: writePurchase } = useContractWrite(configPurchase)

    //event
    useContractEvent({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        eventName: 'Purchase',
        listener(payer, tokenId){
            alert(`${payer}: you buy(tokenId:${tokenId}) successfully`);
        }
    })
    const onPurchase = async (item) => {
        try {
            // purchase
            await writePurchase?.({
                recklesslySetUnpreparedArgs: [item?.hash]
            })
        } catch (error) {
            console.log('execute failed:', error)
        }
    }
    const cardContent = (item, index) => {
        return (
            <Card sx={{maxWidth: 245}} key={index} className={style.cardContainer}>
                <CardActionArea>
                    <div className={style.pngContainer}>
                        <img src={item?.pngSrc} alt="png" className={style.nftPg} />
                    </div>
                    <CardContent>
                        <Typography variant='h5' gutterButtom component="div">
                            {item?.nftName}
                            <div className={style.buyInfo} onClick={()=>{onPurchase(item)}}><div className={style.buyInfoBlock}>buy</div></div>
                        </Typography>
                        <Typography variant='body2' color="text.secondary" className={style.infoContent} title={item?.nftInfo}>
                            {item?.nftInfo}
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