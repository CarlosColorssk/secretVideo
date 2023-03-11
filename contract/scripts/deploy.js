const { ethers } = require("hardhat");

async function main(){
    const AccountListContract = await ethers.getContractFactory("AccountList");
    const AccountListContractInstance = await AccountListContract.deploy(10000);
    await AccountListContractInstance.deployed();
    // 0xC423184bDba9d800FeBA825FcABe3D7CF939f314   / 0x465dd615b23570E933953613d7b95b5b61FA6e55 / 0xCBc11Db2C65246c6f6956783bcc4fC9314Dd4Ae5
    console.log("accountList contract address:", AccountListContractInstance.address);
}

main()
.then(()=>{process.exit(0)})
.catch(error=>{
    console.error(error);
    process.exit(1);
})