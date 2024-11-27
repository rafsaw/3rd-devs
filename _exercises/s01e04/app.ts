import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIService } from './OpenAIService';
import { MemoryService } from './MemoryService';
import { AssistantService } from './AssistantService';
import { defaultKnowledge as knowledge } from './prompts';
import { LangfuseService } from './LangfuseService';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { execSync } from 'child_process';
import path from 'path';

const app = express();
const port = 6000;
const user = "Rafal";
app.use(express.json());

const langfuseService = new LangfuseService();
const openaiService = new OpenAIService();
const memoryService = new MemoryService('_exercises/s01e04/memories', openaiService, langfuseService);
const assistantService = new AssistantService(openaiService, memoryService, langfuseService);

app.post('/api/chat', async (req, res) => {
    let { messages, conversation_id = uuidv4() } = req.body;

    // messages = messages.filter((msg: ChatCompletionMessageParam) => msg.role !== 'system');
    const trace = langfuseService.createTrace({ id: uuidv4(), name: (messages.at(-1)?.content || '').slice(0, 45), sessionId: conversation_id });

    try {
        
        const queries = await assistantService.extractQueries(messages, trace, user);
        const memories = await memoryService.recall(queries, trace);
        const shouldLearn = await assistantService.shouldLearn(messages, memories, trace, user);
        const learnings = await assistantService.learn(messages, shouldLearn, memories, trace);
        const answer = await assistantService.answer({ messages, memories, knowledge, learnings, user }, trace);

        await langfuseService.finalizeTrace(trace, messages, answer.choices[0].message);
        await langfuseService.flushAsync();
        return res.json({...answer, conversation_id});

    } catch (error) {
        console.error('Error in chat processing:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
    
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));