import style from '../styles/upload.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePrepareContractWrite, useContractWrite, useAccount, useContractEvent } from 'wagmi';
import { NFET_CONTRACT_ADDRESS, collectionsAbi } from '../config/contract';
import { ethers } from "ethers";
import { Button, CircularProgress } from '@mui/material';
const Upload = () => {
    const [ name, setName ] = useState('');
    const [ avatar, setAvatar ] = useState(null);
    const [ avatarFile, setAvatarFile ] = useState(null);
    const [ videoSrc, setVideoSrc ] = useState(null);
    const [ videoFile, setVideoFile ] = useState(null);
    const [ descriptions, setDescriptions ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const { address, isConnected } = useAccount();
    const router = useRouter();
    useEffect(() => {
        if(!isConnected){
            router.push('/')
        }
        var avatar = document.getElementById("avatar");
        if(avatar){
            avatar.onchange = function(){
                var blob2 = URL.createObjectURL(this.files[0]);
                setAvatar(blob2);
                setAvatarFile(this.files[0])
            }
        }
        var resource = document.getElementById("resource");
        if(resource){
            resource.onchange = function(){
                var blob2 = URL.createObjectURL(this.files[0]);
                setVideoSrc(blob2);
                setVideoFile(this.files[0]);
            }
        }
    }, [])

    // contract write
    const { config: configMint } = usePrepareContractWrite({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        functionName: "mintNFT",
        overrides: { from: address, value:  ethers.utils.parseUnits('10000000', 'gwei'), gasLimit: 500000},
        args: [ address, '', '' ]
    })
    const { write: writeMint } = useContractWrite(configMint);

    // event listerner
    useContractEvent({
        address: NFET_CONTRACT_ADDRESS,
        abi: collectionsAbi,
        eventName: 'MintNFT',
        listener(newId, blockInfo){
            alert(`${address}: mint successfully, newId: ${newId}`)
            console.log('blockInfo', blockInfo)
            //router.push('/ownNft')
        }
    })

    const onHandleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('avatar', avatarFile);
        form.append("resource", videoFile);
        form.append("name", name);
        form.append("description", descriptions);
        setLoading(true);
        const res = await fetch("http://127.0.0.1:8080/upload", {
            method: 'POST',
            body: form
        })
        const data = await res.json();
        if(!data || !data?.data || !data?.data?.IpfsHash){
            alert('上传失败')
        } else {
            try {
                await writeMint?.({ recklesslySetUnpreparedArgs: [ address, data?.data?.IpfsHash, data?.briefData?.IpfsHash ] })
            } catch (error){
                console.log('execute failed');
            }
        }
        setLoading(false);
        console.log('res', data);
    }
    const handleChange = (type, e) => {
        const value = e.target.value;
        switch (type) {
            case 'name':
                setName(value);
                break;
            case 'descriptions':
                setDescriptions(value);
                break;
            default:
                break;
        }
    }
    return (
        <div className={style.uploadContainer}>
            <div className={style.formContainer}>
                <form onSubmit={onHandleSubmit}>
                    <label className={style.lineBlock}>name: &nbsp;&nbsp;
                        <input className={style.inputStyle} value={name} onChange={e=>{handleChange('name', e)}}/>
                    </label>
                    <label className={style.lineBlock}>icon: &nbsp;&nbsp;
                        <input type="file" name="upResource" id="avatar" accept="image/*" />
                    </label>
                    {avatar && <img src={avatar} className={style.avatarStyle} alt="avatar"/>}
                    <label className={style.lineBlock}>resource: &nbsp;&nbsp;
                        <input type="file" name="upResource" id="resource" accept="video/*" />
                    </label>
                    {
                        videoSrc && <video  className={style.videoStyle} controls width="200">
                                        <source src={videoSrc} type="video/mp4"/>
                                    </video>
                    }
                     <label className={style.lineBlock}>descriptions: &nbsp;&nbsp;
                        <textarea className={style.inputStyle} value={descriptions} onChange={e=>{handleChange('descriptions', e)}}></textarea>
                    </label>
                    {
                        <Button type="submit" variant="contained" className={`${style.lineBlock} ${style.buttonStyle}`}>Click to submit</Button>
                    }
                </form>
            </div>
            {
                loading && <div className={style.loadingContainer}>
                    <CircularProgress color="secondary"/>
                </div>
            }
        </div>
    )
}

export default Upload