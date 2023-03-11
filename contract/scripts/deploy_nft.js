const { ethers } = require("hardhat");

async function main(){
    const NftcollectionsContract = await ethers.getContractFactory("Nftcollections");
    const accountContractAddress = "0xCBc11Db2C65246c6f6956783bcc4fC9314Dd4Ae5"
    const nftContract = await  NftcollectionsContract.deploy(accountContractAddress);
    await nftContract.deployed();
    // 0x2Cc02d34cBecAEE04d384627dcdee3b1bbd4Cd41  // 0x6Ad6fd5F2CA549F26Ee7B4ffD5b1604796b764a9 // 0x9B5Bc273F145964EE06C17b44faacf4B2e5366fa
    console.log("NFTcontract Contract Address", nftContract.address);
  
}

main()
.then(()=>{process.exit(0)})
.catch(error=>{
    console.error(error);
    process.exit(1);
})