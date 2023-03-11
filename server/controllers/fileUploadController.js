
const pinataSdk = require("@pinata/sdk");
const { stringify } = require("querystring");
const { Readable } = require("stream");
const uploadFiles = async (req, res) => {
    try {
        const baseUrl = 'https://ipfs.io/ipfs/';
        const pinata = new pinataSdk('9e7c814d3ba51dc77ad2', '4d817340046e6bf70a60dbf8e54c900c9c4265201a4d6b8ae3b2609cc242053d');
        const files = req.files;
        const  avatarIndex = files.findIndex(file=> file.fieldname === 'avatar')
        const resourceIndex = files.findIndex(file=> file.fieldname === 'resource')
        if(avatarIndex !== -1 && resourceIndex !== -1){
            let streams = [];
            files.forEach(file=>{
                streams.push(Readable.from(file.buffer));
            })
            const uploadToPinata = (stream, index) => {
                const options = {
                    pinataMetadata: {
                        name: files[index].originalname + String(new Date().getTime())
                    },
                    pinataOptions: {
                        cidVersion: 0
                    }
                }
                return pinata.pinFileToIPFS(stream, options);
            }

            Promise.all([uploadToPinata(streams[0], avatarIndex), uploadToPinata(streams[1], resourceIndex)]).then(result=>{
                console.log(result);
                // {
                //     IpfsHash: 'QmeQtTH9CGCdezxGBbtcFQaMkrva7JDRLdC83Cgfm8R517',
                //     PinSize: 150981,
                //     Timestamp: '2022-11-21T12:16:20.765Z'
                // }
                if(result && result.length === 2){
                    const ipfsBody = {};
                    ipfsBody.image = baseUrl + result[0]?.IpfsHash;
                    ipfsBody.name = req.body?.name;
                    ipfsBody.description = req.body?.description;
                    const options = {
                        pinataMetadata: {
                            name: req.body?.name + String(new Date().getTime()) + '-brief'
                        }
                    }
                    pinata.pinJSONToIPFS(ipfsBody, options).then(resultBrief=>{
                        ipfsBody.resourceVideo = baseUrl + result[1]?.IpfsHash;
                        const options = {
                            pinataMetadata: {
                                name: req.body?.name + String(new Date().getTime()) + '-detail'
                            }
                        }
                        pinata.pinJSONToIPFS(ipfsBody, options).then(resultDetail => {
                            return res.status(200).json({message: '文件上传成功', data: resultDetail, briefData: resultBrief});
                        }).catch(err=>{
                            return res.status(500).send({
                                message: `最终表单信息上传失败: ${err}`
                            })
                        })
                    }).catch(err=>{
                        return res.status(500).send({
                            message: `简单表单信息上传失败: ${err}`
                        })
                    })
                }

            }).catch(err=>{
                return res.status(500).send({
                    message: `无法上传文件至pinata: ${err}`
                })
            })

        } else {
            return res.status(200).json({message: '文件不全'});
        }
    } catch (error) {
        return res.status(500).send({
            message: `无法上传文件: ${error}`
        })
    }
}


module.exports = {
    uploadFiles
}