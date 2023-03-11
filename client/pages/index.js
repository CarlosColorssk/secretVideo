import styles from '../styles/home.module.css'
import Connect from '../components/connect'
import { useAccount, useContractRead, usePrepareContractWrite, useContractWrite, useContractEvent } from 'wagmi'
import { Button, Card } from '@mui/material'
import { ACCOUNT_CONTRACT_ADDRESS, accountAbi } from '../config/contract'
function Page() {
  const { address, isConnected } = useAccount()

  // contract read
  const {data: registerLimit} = useContractRead({
    address: ACCOUNT_CONTRACT_ADDRESS,
    abi: accountAbi,
    functionName: 'registerLimit',
    watch: true,
    overrides: { from: address }
  })

  const {data: listCount} = useContractRead({
    address: ACCOUNT_CONTRACT_ADDRESS,
    abi: accountAbi,
    functionName: 'listCount',
    watch: true,
    overrides: { from: address }
  })

  console.log('listCount', listCount)

  
  const {data: isApply} = useContractRead({
    address: ACCOUNT_CONTRACT_ADDRESS,
    abi: accountAbi,
    functionName: 'accounts',
    args: [ address ],
    watch: true,
    overrides: { from: address }
  })

  // contrat write
  const { config: configAdd } = usePrepareContractWrite({
    address: ACCOUNT_CONTRACT_ADDRESS,
    abi: accountAbi,
    functionName: 'addMember',
    overrides: { from: address, gasLimit: 500000 }
  })

  const {write: writeAdd} = useContractWrite(configAdd);

  const { config: configDel } = usePrepareContractWrite({
    address: ACCOUNT_CONTRACT_ADDRESS,
    abi: accountAbi,
    functionName: 'delMember',
    overrides: { from: address, gasLimit: 500000 }
  })

  const { write: writeDel } = useContractWrite(configDel);

  // evnet
  useContractEvent({
    address: ACCOUNT_CONTRACT_ADDRESS,
    abi: accountAbi,
    eventName: 'IncreaseMember',
    listener(member, message){
      alert(`${member}:${message}`);
    }
  })

  useContractEvent({
    address: ACCOUNT_CONTRACT_ADDRESS,
    abi: accountAbi,
    eventName: 'DecreaseMember',
    listener(member, message){
      alert(`${member}:${message}`);
    }
  })

  const loginCard = () => {
    return (
      <Card variant="outlined" className={styles.loginInfoCardContainer}>
      { address && <div className={styles.loginInfo}>{address}</div> }
      <div className={styles.buttonContainer}>
        <Connect/>
        {
          registerLimit && address && <Button 
          variant="outlined" 
          disabled={isApply} 
          className={styles.applyButton} 
          onClick={()=>{writeAdd?.()}}
          title="apply for joining(申请入驻)"
          >
            apply for joining(申请入驻)
          </Button>
        }
        {
          registerLimit && address && <Button variant="outlined" onClick={()=>{writeDel?.()}}>del</Button>
        }
      </div>
    </Card>
    )
  }
  return (
    <div className={styles.container}>
      <div className={styles.hasjoinedInfo}>当前已入驻名额({`${registerLimit ?? '**'}/${listCount ?? '**'}`})</div>
      <main className={styles.main}>
        {
          loginCard()
        }
      </main>
    </div>
  )
}

export default Page