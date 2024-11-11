import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage(file, orderNumber) {
  try {
    // Convert file buffer to base64
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileStr = `data:${file.type};base64,${fileBuffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: `orders/${orderNumber}`,
      resource_type: 'auto',
    });

    return {
      key: uploadResponse.public_id,
      url: uploadResponse.secure_url
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}