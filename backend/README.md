# Translation-and-speech-lambda
1. This Lambda function uses DeepL Translation API to translate text into Finnish and saves it to DynamoDB table.
2. It can also generate stories using OpenAI API.
3. It usesAWS Polly to convert it into Finnish speech.
4. It can return a random story or 10 stories from DynamoDB table with pagination.

- The functions can be deployed with Serverless framework to AWS by running **sls deploy**.
- The function uses an API key for DeepL translator API (free version) from AWS SSM Parameter Store.

You can add these parameters by running the following AWS CLI command:

*aws ssm put-parameter --name DEEPL_AUTH_KEY --type String --value {DEEPL API-KEY-HERE}*
*aws ssm put-parameter --name OPENAI_API_KEY --type String --value {OPENAI API-KEY-HERE}*

## Endpoints

 ### /translate

  - Accepts a POST request
  - Expects to recieve a body { "text": "This text will be translated into Finnish" }
  - Saves the translation to DynamoDB table
  - Return a translated text in Finnish
  
### /speech

  - Accepts a POST request
  - Expects to recieve a body { "text": "Tämä teksti on käännetty Suomeksi" }
  - Returns an mp3 audio stream with the spoken text in Finnish

### /random-story

  - Accepts a GET request
  - Returns a random story from DynamoDB table

### /random-stories

  - Accepts a GET request
  - Returns 10 random stories from DynamoDB table
  - Return a lastEvaluatedKey which can be used to get the next 10 stories

### /generate-story

  - Accepts a POST request
  - Expects to recieve a body { "prompt": "Tell me a story about a boy who cried wolf." }
  - Returns a generated story