import boto3
from botocore.client import Config
from app.core.config import settings
import uuid

class S3Service:
    def __init__(self):
        self.client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            use_ssl=settings.S3_USE_SSL
        )
        self.bucket = settings.S3_BUCKET_NAME

    def upload_file(self, file_content: bytes, original_filename: str) -> str:
        file_key = f"{uuid.uuid4()}/{original_filename}"
        self.client.put_object(Bucket=self.bucket, Key=file_key, Body=file_content)
        return file_key

    def delete_file(self, file_key: str):
        self.client.delete_object(Bucket=self.bucket, Key=file_key)

    def generate_presigned_url(self, file_key: str, expires_in: int = 3600) -> str:
        return self.client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': file_key},
            ExpiresIn=expires_in
        )