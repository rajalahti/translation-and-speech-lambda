# Translation-and-speech-lambda
This Lambda function uses DeepL Translation API to translate text and AWS Polly to convert it into speech

- The functions can be deployed with Serverless framework to AWS by running **sls deploy**.
- The function uses an API key for DeepL translator API (free version) from AWS SSM Parameter Store.

You can add this parameter by running the following AWS CLI command:

*aws ssm put-parameter --name DEEPL_AUTH_KEY --type String --value {API-KEY-HERE}*

## Endpoints

 ### /translate

  - Accepts a POST request
  - Expects to recieve a body { "text": "This text will be translated into Finnish" }
  - Return a translated text
  
  
### /speech

  - Accepts a POST request
  - Expects to recieve a body { "text": "Tämä teksti on käännetty Suomeksi" }
  - Returns an mp3 audio stream with the spoken text in Finnish
