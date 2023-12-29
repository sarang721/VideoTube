import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

const uploadOnCloudinary = async (localFilePath) => {

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
      });

    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOldAvatarFromCloudinary = async(url)=>{

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
      });

    if(url.length>0){

    const pathSegments = url.split('/');
    const publicId = pathSegments[pathSegments.length - 1].split('.')[0];

    try{
        await cloudinary.uploader.destroy(publicId);
    }
    catch(e)
    {
        console.log("Some issue occured while deleting avatar")
    }
}

}

export {uploadOnCloudinary,
    deleteOldAvatarFromCloudinary

}