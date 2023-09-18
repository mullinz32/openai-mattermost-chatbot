const axios = require('axios');

const { PineconeClient } = require("@pinecone-database/pinecone");
const pinecone = new PineconeClient();
pinecone.init({
    environment: "eu-west1-gcp",
    apiKey: process.env["PINECONE_API_KEY"],
});

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env["OPENAI_API_KEY"],
    });
const openai = new OpenAIApi(configuration);
const model = process.env["OPENAI_MODEL_NAME"] ?? 'gpt-3.5-turbo'
const max_tokens = Number(process.env["OPENAI_MAX_TOKENS"] ?? 2000)

async function getOpenaiEmbedding(prompt) {
    try{
        prompt = String(prompt).replace("@briantestbot", "")
        const response = await openai.createEmbedding({
            model: process.env["OPENAI_MODEL_NAME"],
            input: prompt,
        });
        return response.data.data[0].embedding
    } catch (error) {
        console.error(error);
        throw new Error('Failed to generate Openai response');
    }
}
   
async function getPinconeResponse(query) {
    try{
        const embedding  = await getOpenaiEmbedding(query)
        const index = pinecone.Index("townhall");
        const queryRequest = {
           vector: embedding,
          topK: 4,
           includeValues: true,
           includeMetadata: true,
           namespace: "cases",
        };
        const queryResponse = await index.query({ queryRequest });
        response.data?.choices?.[0]?.message?.content
        // Convert the results to the format expected by the question-answering chain
        // Convert the retrieved documents into a format that can be used as input for LangChain
        const docs = [
            new Document({ pageContent: queryResponse.matches[0].metadata.text })
        ];
        const response = await chain.call({
            input_documents: docs,
            question: query,
        });
        const new_prompt = ''
        const generated_prompt = new_prompt.concat('Based on the instructions and context given answer the question however if the question has no relevance to the context then ignore the context and answer as you would normally. Also do not mention in the response if the question is not related to the given context. \n\nContext: ', queryResponse.matches[0].metadata.text, 'Q:', query, 'A:');
    
        console.log(generated_prompt)

        const completion = await openai.createChatCompletion({
            model: "davinci",
            messages: [ 
                        {"role": "user", "content": query}
                    ],
          });
          
        const choices = [];
        for (var i = 0; i < completion.data.choices.length; i++) {
            choices.push(completion.data.choices[i].message.content);
        }
        
        // Concatenate the choices into a single string
        var joined_choices = "";
        for (var i = 0; i < choices.length; i++) {
            joined_choices += choices[i];
        }


        // Return the answer to the client
        return completion.data.choices[0].text.trim()
        //return joined_choices
    } catch (error) {
        console.error(error);
        throw new Error('Failed to answer question');
    }
    };
module.exports = {
    getPinconeResponse
};