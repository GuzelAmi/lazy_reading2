from app.services.s3_service import S3Service

s3 = S3Service()
try:
    s3.client.create_bucket(Bucket=s3.bucket)
    print(f"Bucket '{s3.bucket}' created")
except Exception as e:
    print(f"Error: {e}")