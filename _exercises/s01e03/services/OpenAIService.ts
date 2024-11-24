import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI();
    }

    async getResponse(question: string): Promise<string> {
        const messages: ChatCompletionMessageParam[] = [
            { 
                role: "system", 
                content: "You are an assistant. Respond in English. Your response must be either a full name (first and last name) or a single word. No other formats allowed." 
            },
            { role: "user", content: question }
        ];

        try {
            const chatCompletion = await this.openai.chat.completions.create({
                messages,
                model: "gpt-4o-mini",
                max_tokens: 2,
                temperature: 0,
            });    

            const content = chatCompletion.choices[0].message?.content?.trim();
            if (!content) {
                throw new Error("Unexpected response format");
            }

            return content;
        } catch (error) {
            console.error("Error in OpenAI completion:", error);
            return 'error';
        }
    }
}