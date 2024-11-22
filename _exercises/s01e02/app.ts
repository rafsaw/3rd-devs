import axios from "axios";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";


// Adres API firmy XYZ
const API_URL = "https://xyz.ag3nts.org/verify";

interface APIMessage {
  msgID: number;
  text: string;
}


async function addLabel(task: string): Promise<string> {
  const openai = new OpenAI();

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a task categorizer. Categorize the given task as 'capital of poland', 'hitchhiker', 'current year', or 'other'." },
    { role: "user", content: task }
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o-mini",
      max_tokens: 6,
      temperature: 0,
    });

    if (chatCompletion.choices[0].message?.content) {
      const label = chatCompletion.choices[0].message.content.trim().toLowerCase();
      //console.log(label);
      return ['capital of poland', 'hitchhiker', 'current year'].includes(label) ? label : 'other';
    } else {
      console.log("Unexpected response format");
      return 'other';
    }
  } catch (error) {
    console.error("Error in OpenAI completion:", error);
    return 'other';
  }
}

async function respondToTask(task: string): Promise<string> {
  const openai = new OpenAI();

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a task categorizer. Respond in english. Respond in a single word." },
    { role: "user", content: task }
  ];

  try {

    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o-mini",
      max_tokens: 1,
      temperature: 0,
    });    

    if (chatCompletion.choices[0].message?.content) {
      const label = chatCompletion.choices[0].message.content.trim().toLowerCase();
      console.log(label);
      return label
    } else {
      console.log("Unexpected response format");
      return 'other';
    }

  } catch (error) {
    console.error("Error in OpenAI completion:", error);
    return 'error';
  }
}



async function sendMessageToVerifyAPI(msgID: number, text: string): Promise<APIMessage> {
  try {
    const response = await axios.post<APIMessage>(API_URL, {
      msgID,
      text
    });
    
    if (response.data && response.data.msgID !== undefined && response.data.text !== undefined) {
      return response.data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    //RS> 
    //console.error("Error sending message:", error);
    throw error;
  }
}

async function main() {
  try {
    // Initial API call
    const initialResponse = await sendMessageToVerifyAPI(0, "ready");
    console.log("API Response:", initialResponse);

    const { msgID, text: task } = initialResponse;
    const label = await addLabel(task);
    console.log(`Task: "${task.slice(-20)}..." - Label: ${label}`);

    // Map of label types to their corresponding responses
    const responses = {
      'capital of poland': 'Krakow',
      'hitchhiker': '69',
      'current year': '1999',
      'other': await respondToTask(task)
    };

    // Send response based on label
    const response = await sendMessageToVerifyAPI(
      msgID, 
      responses[label as keyof typeof responses]
    );
    console.log("API Response:", response);

  } catch(error) {
    console.error("Error in main");
  }
}

main(); 

