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
    { role: "system", content: "You are a task categorizer. Categorize the given task as 'capital of poland', 'hitchhikers guide', 'current year', or 'other'. Respond with only the category name." },
    { role: "user", content: task }
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o-mini",
      max_tokens: 5,
      temperature: 0,
    });

    if (chatCompletion.choices[0].message?.content) {
      const label = chatCompletion.choices[0].message.content.trim().toLowerCase();
      //console.log(label);
      return ['capital of poland', 'hitchhikers guide', 'current year'].includes(label) ? label : 'other';
    } else {
      console.log("Unexpected response format");
      return 'other';
    }
  } catch (error) {
    console.error("Error in OpenAI completion:", error);
    return 'other';
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
    console.error("Error sending message:", error);
    throw error;
  }
}

// Example usage
async function main() {

  try {
  
  const response = await sendMessageToVerifyAPI(0, "ready");
  console.log("API Response:", response);

  const currentMsgID = response.msgID;
  const task = response.text;
  const label = await addLabel(task);
  console.log(`Task: "${task.slice(-20)}..." - Label: ${label}`);

  if (label === 'other') {
    const response = await sendMessageToVerifyAPI(currentMsgID, "TO DO");
    console.log("API Response:", response);
    
  } else if (label === 'capital of poland') {
    const response = await sendMessageToVerifyAPI(currentMsgID, "Krakow");
    console.log("API Response:", response);
  } else if (label === 'hitchhikers guide') {
    const response = await sendMessageToVerifyAPI(currentMsgID, "69");
    console.log("API Response:", response);
  } else if (label === 'current year') {
    const response = await sendMessageToVerifyAPI(currentMsgID, "1999");
    console.log("API Response:", response);
  }

  } catch(error){
    console.error("Error in main:", error);
  }
}

main(); 

