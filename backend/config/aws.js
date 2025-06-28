import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {
    Bucket: process.env.AWS_S3_BUCKET
  }
});

// Upload file to S3
export const uploadToS3 = async (file, key, contentType) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'max-age=31536000', // 1 year cache
      Metadata: {
        'uploaded-by': 'oxdel-platform',
        'upload-date': new Date().toISOString()
      }
    };

    const result = await s3.upload(params).promise();
    
    // Return CloudFront URL if available, otherwise S3 URL
    const baseUrl = process.env.AWS_CLOUDFRONT_URL || `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    const url = `${baseUrl}/${key}`;
    
    return {
      success: true,
      url,
      key,
      etag: result.ETag,
      location: result.Location
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from S3
export const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    
    return {
      success: true,
      message: 'File deleted successfully'
    };
  } catch (error) {
    console.error('S3 delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate signed URL for secure uploads
export const generateSignedUrl = async (key, contentType, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn,
      ACL: 'public-read'
    };

    const signedUrl = await s3.getSignedUrlPromise('putObject', params);
    
    return {
      success: true,
      signedUrl,
      key,
      expiresIn
    };
  } catch (error) {
    console.error('Signed URL generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// List files in bucket
export const listFiles = async (prefix = '', maxKeys = 1000) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: prefix,
      MaxKeys: maxKeys
    };

    const result = await s3.listObjectsV2(params).promise();
    
    return {
      success: true,
      files: result.Contents,
      count: result.KeyCount,
      isTruncated: result.IsTruncated
    };
  } catch (error) {
    console.error('S3 list error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export { s3 };
export default AWS;