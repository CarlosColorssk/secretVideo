// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import '@openzeppelin/contracts/utils/Counters.sol';
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AccountList.sol";


interface IAccountsList{
    function accounts(address) external view returns (bool);
}

contract Nftcollections is ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter _tokenId;
    uint256 public _cost_price = 0.01 ether;// mint price
    uint256 public _trans_price = 0.01 ether; // transaction fee
    IAccountsList accountsList;
    mapping(uint256 => string) public tokenIdToUrlBrief;
    mapping(string => uint256) public urlBriefToTokenId;
    // purcahse
    mapping(uint256 => mapping(address => bool)) public payerLists; // tokenId: {payer: true}, true: have paid
    mapping(address => uint256[]) public collectionsIn; // someone: [nft1, nft2];
    uint256 mintBenefit;
    event MintNFT(uint indexed newId);
    event WithdrawEvent(address indexed owner, uint value);
    event Purchase(address indexed payer, uint256 tokenId);
    // is used to pause the contract in case of an emergency
    bool public _paused;

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }

    function setPaused(bool val) public onlyOwner{
        _paused = val;
    }

    constructor(address _IAccountsList) ERC721("GLENNFT", "GLEN") {
        accountsList = IAccountsList(_IAccountsList);
    }

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal override(ERC721, ERC721Enumerable){
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage){
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public  view override(ERC721, ERC721URIStorage) returns(string memory){
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) 
        public
        view
        override(ERC721, ERC721Enumerable)
        returns(bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // generate nft
    function mintNFT(address recipents, string memory _tokenURI, string  memory _briefTokenURI) public payable onlyWhenNotPaused{
        require(msg.value >= _cost_price, "Ether sent is not correct, please greater than 0.01eth");
        require(accountsList.accounts(msg.sender), "You are not registered");
        uint newId = _tokenId.current();
        _mint(recipents, newId);
        _setTokenURI(newId, _tokenURI);
        tokenIdToUrlBrief[newId] = _briefTokenURI;
        urlBriefToTokenId[_briefTokenURI] = newId;
        _tokenId.increment();
        mintBenefit += _cost_price;
        emit MintNFT(newId);
    }

    // show all nfts exlude owner, for sell in the market
    function showAllBriefNftExcludeOwner() public view returns(string[] memory) {
        uint256 totalIndexs = totalSupply();
        string[] memory _briefTokenUrls = new string[](totalIndexs);
        uint count;
        for(uint index; index < totalIndexs; index++){
            uint256 tokenId = tokenByIndex(index);

            if(address(ownerOf(tokenId)) == address(msg.sender)){
                 count++;
            } else {
                _briefTokenUrls[index - count] = tokenIdToUrlBrief[tokenId];
            }
        }
        string[] memory res = new string[](totalIndexs - count);
        for(uint i=0; i < res.length; i++){
            res[i] = _briefTokenUrls[i];
        }
        return res;
    }

    // search all nft by address
    function getAllNftByAddress(address _address) public view returns(string[] memory){
        uint nu  = balanceOf(_address);
        string[] memory tokenURIs = new string[](nu);

        for(uint i = 0; i < nu; i++){
            uint tokenId = tokenOfOwnerByIndex(_address, i);
            tokenURIs[i] = tokenURI(tokenId);
        }
        return tokenURIs;
    }

    // record the transaction
    function purchase(string memory _pay_tokenUrl) public payable onlyWhenNotPaused nonReentrant {
        uint256 _pay_tokenId = urlBriefToTokenId[_pay_tokenUrl];
        require(msg.value >= _trans_price, "warning: payment is not enough");
        require(_exists(_pay_tokenId) &&  bytes(_pay_tokenUrl).length != 0, "tokenId is not exist");
        require(address(msg.sender) != address(0), "msg.sender is invalid");

        // record
        mapping(address => bool) storage payList = payerLists[_pay_tokenId];
        // msg.sender never pat the tokenId(nft)
        if(!payList[msg.sender]){
            if(msg.value > _trans_price){
                payable(msg.sender).transfer(msg.value - _trans_price);
            }

            collectionsIn[msg.sender].push(_pay_tokenId);
            payList[msg.sender] = true;
            payable(address(ownerOf(_pay_tokenId))).transfer(_trans_price);
            emit Purchase(msg.sender, _pay_tokenId);
        } else {
            revert("you have already paid the NFT");
        }
    }


        // get collections
    function getCollections() public view returns(string[] memory) {
        require(address(msg.sender) != address(0), "msg.sender is invalid");
        uint256[] memory tokenIdCollections = collectionsIn[msg.sender];
        string[] memory tokenUrlDetailCollections = new string[](tokenIdCollections.length);
        if(tokenIdCollections.length > 0){
            for(uint i=0; i < tokenIdCollections.length; i++){
                tokenUrlDetailCollections[i] = tokenURI(tokenIdCollections[i]);
            }
        }
        return tokenUrlDetailCollections;
    }


    // withdraw money from deployer

    function withdraw() public onlyOwner{
        payable(address(msg.sender)).transfer(mintBenefit);
        mintBenefit = 0;
        emit WithdrawEvent(msg.sender, mintBenefit);
    }

    fallback() external payable {}
    receive() external payable {}




}