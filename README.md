# AI Story Generator

This is a simple story generator app. It uses GTP3 to generate stories, DeepL to translate them to Finnish and AWS Polly for text-to-speech functionality. 

You can check out the live version at https://satukone.rajalahti.me

## Tha backend
1. The backend lambda function uses DeepL Translation API to translate text into Finnish and saves it to DynamoDB table.
2. It can also generate stories using OpenAI API.
3. It uses AWS Polly to convert it into Finnish speech.
4. It can return a random story or 10 stories from DynamoDB table with pagination and filter them by story type.

- The functions can be deployed with Serverless framework to AWS by running **sls deploy**.
- The function uses an API key for DeepL translator API (free version) from AWS SSM Parameter Store.

You can add these parameters by running the following AWS CLI command:

- *aws ssm put-parameter --name DEEPL_AUTH_KEY --type String --value {DEEPL API-KEY-HERE}*
- *aws ssm put-parameter --name OPENAI_API_KEY --type String --value {OPENAI API-KEY-HERE}*

## Endpoints

 ### /translate

  - Accepts a POST request
  - Expects to recieve a body { "text": "This text will be translated into Finnish" }
  - Saves the translation to DynamoDB table
  - Return a translated text in Finnish
  
### /speech

  - Accepts a POST request
  - Expects to recieve a body { "text": "Tämä teksti on käännetty Suomeksi" }
  - Saves a text-to-speech audio mp3-tile to S3 and adds the url to the file to DynamoDB

### /stories

  - Accepts a GET request
  - Returns 10 random stories from DynamoDB table
  - Return a lastEvaluatedKey which can be used to get the next 10 stories
  - Accepts a storyType parameter for filtering
  
  ### /stories/:id

  - Accepts a GET request
  - Return the story with the matching id

### /generate-story

  - Accepts a POST request
  - Expects to recieve a body { "prompt": "Tell me a story about a boy who cried wolf." }
  - Generates a story using GTP3


## Frontend

The frontend has a story generator component where the user can choose a story type and enter a prompt. 

It also has a list of all previous generated stories.
