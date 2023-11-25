import AWS from "aws-sdk";

const uploadFile = async (e, file,ws, clientId) => {
    e.preventDefault();
    console.log("logged");
    const S3_BUCKET = process.env.NEXT_PUBLIC_BUCKET_NAME;
    const REGION = "ap-south-1";

    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });

    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });

    const params = {
      Bucket: S3_BUCKET,
      Key: file.name,
      Body: file,
    };

    try {
      // Upload the file to S3
      const data = await s3.upload(params).promise();
      console.log("File uploaded successfully:", data);

      // Generate a pre-signed URL for the uploaded file
      const urlParams = { Bucket: S3_BUCKET, Key: file.name, Expires: 3600 };
      const signedUrl = await s3.getSignedUrlPromise("getObject", urlParams);

      console.log("Pre-signed URL:", signedUrl);

      // Send WebSocket message with the signed URL to all recipients
      ws.send(JSON.stringify({ uri: signedUrl, client_id: clientId }));

      // Display the uploaded image using an <img> tag
      // setMessages((prevMessages) => [...prevMessages, signedUrl]);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  export default uploadFile