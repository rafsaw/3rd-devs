// _exercises/s02e01-standalone/app.ts
import { OpenAIService } from './services/OpenAIService';
import { AssistantService } from './services/AssistantService';
import { LangfuseService } from './services/LangfuseService';
import { Command } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { readdir } from 'fs/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'node:path'; 


class ConsoleApp {
  private openaiService: OpenAIService;
  private assistantService: AssistantService;
  private langfuseService: LangfuseService;

  constructor() {
    this.openaiService = new OpenAIService();
    this.langfuseService = new LangfuseService();
    this.assistantService = new AssistantService(this.openaiService, this.langfuseService);
  }

  private createTrace(name: string) {
    return this.langfuseService.createTrace({
      id: uuidv4(),
      name,
      sessionId: uuidv4()
    });
  }

  async readFilesFromDirectory(directoryPath: string) {
    try {
      const files = await readdir(directoryPath);
      const fileContents = await Promise.all(
        files.map(async (file) => {
          const filePath = `${directoryPath}/${file}`;
          const content = await Bun.file(filePath).arrayBuffer();
          return {
            name: file,
            content: Buffer.from(content),
            path: filePath
          };
        })
      );
      return fileContents;
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
  }

  async processAudioFiles(directoryPath: string, useGroq: boolean = false) {
    const trace = this.createTrace('audio_transcription');
    
    try {
      console.log(`Processing files in directory: ${directoryPath}`);
      const files = await this.readFilesFromDirectory(directoryPath);
      
      for (const file of files) {
        if (file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
          const span = this.langfuseService.createSpan(trace, 'process_audio_file', {
            filename: file.name,
            useGroq
          });

          console.log('Processing file:', file.name);
          console.log('Found audio file:', file.path);

          try {
            const transcription = useGroq 
              ? await this.openaiService.transcribeGroq(file.content)
              : await this.openaiService.transcribe(file.content);
            
            const txtPath = file.path.replace(/\.(mp3|wav|m4a|ogg)$/i, '.txt');
            await Bun.write(txtPath, transcription);
            
            this.langfuseService.finalizeSpan(span, 'process_audio_file', {
              filename: file.name,
              useGroq
            }, {
              transcriptionLength: transcription.length,
              outputPath: txtPath
            });

            console.log(`Saved transcription to ${txtPath}`);
            console.log('---');
          } catch (error) {
            this.langfuseService.finalizeSpan(span, 'process_audio_file', {
              filename: file.name,
              useGroq
            }, { error: error instanceof Error ? error.message : String(error) });
            throw error;
          }
        }
      }

      await this.langfuseService.finalizeTrace(trace, {
        directoryPath,
        fileCount: files.length,
        useGroq
      }, {
        processedFiles: files.map(f => f.name)
      });

      console.log(`Processed ${files.length} files`);
    } catch (error) {
      console.error('Error processing files:', error);
      throw error;
    }
  }

  async textToSpeech(inputPath: string, useElevenLabs: boolean = false) {
    const trace = this.createTrace('text_to_speech');
    const span = this.langfuseService.createSpan(trace, 'generate_speech', {
      inputPath,
      useElevenLabs
    });

    try {
      console.log('Reading text file...');
      const text = await readFile(inputPath, 'utf-8');
      console.log('Converting text to speech...');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const provider = useElevenLabs ? 'elevenlabs' : 'openai';
      const inputDir = path.dirname(inputPath);
      const inputFileName = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(inputDir, `${inputFileName}_${provider}_${timestamp}.mp3`);

      if (useElevenLabs) {
        console.log('Speaking with ElevenLabs...');
        const audioStream = await this.openaiService.speakEleven(text);
        // ElevenLabs returns a stream that needs to be processed differently
        const chunks: Buffer[] = [];
        for await (const chunk of audioStream) {
          chunks.push(Buffer.from(chunk));
        }
        await writeFile(outputPath, Buffer.concat(chunks));
      } else {
        console.log('Speaking with OpenAI...');
        const audioStream = await this.openaiService.speak(text);
        if (audioStream instanceof ReadableStream) {
          const chunks = [];
          const reader = audioStream.getReader();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          
          await writeFile(outputPath, Buffer.concat(chunks));
        } else {
          await writeFile(outputPath, Buffer.from(audioStream));
        }
      }

      this.langfuseService.finalizeSpan(span, 'generate_speech', {
        inputPath,
        useElevenLabs
      }, {
        outputPath
      });

      await this.langfuseService.finalizeTrace(trace, {
        inputPath,
        text: text.substring(0, 100) + '...',
        useElevenLabs
      }, {
        outputPath
      });

      console.log(`Audio saved to ${outputPath}`);
    } catch (error) {
      this.langfuseService.finalizeSpan(span, 'generate_speech', {
        inputPath,
        useElevenLabs
      }, { error: error instanceof Error ? error.message : String(error) });
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  async chat(messages: any[], model: string = 'gpt-4') {
    const trace = this.createTrace('chat');
    
    try {
      const completion = await this.assistantService.answer({
        messages,
        model,
        stream: false,
        maxTokens: 1000
      }, trace);

      if (this.openaiService.isStreamResponse(completion)) {
        let fullResponse = '';
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          process.stdout.write(content);
        }
        console.log('\n');
        
        await this.langfuseService.finalizeTrace(trace, {
          messages,
          model
        }, {
          response: fullResponse
        });
      } else {
        const response = completion.choices[0]?.message?.content || '';
        console.log(response);
        
        await this.langfuseService.finalizeTrace(trace, {
          messages,
          model
        }, {
          response
        });
      }
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  async shutdown() {
    await this.langfuseService.shutdownAsync();
  }
}

async function main() {
  const program = new Command();
  const app = new ConsoleApp();

  program
    .version('1.0.0')
    .description('Audio and Text Processing CLI');

    // # Transcribe audio files
    // bun run s02e01-console transcribe <directory> [--groq]
    // bun run s02e01-console transcribe "C:\Users\rafal\Downloads\s02e01przesluchania --groq
  program
    .command('transcribe <directory>')
    .option('-g, --groq', 'Use Groq for transcription')
    .description('Transcribe audio files in directory')
    .action(async (directory, options) => {
      try {
        await app.processAudioFiles(directory, options.groq);
      } finally {
        await app.shutdown();
      }
    });

    // # Text-to-speech conversion
    // bun run s02e01-console speak path/to/your/text.txt --eleven
    // This will use OpenAI (useElevenLabs = false)
    // bun run s02e01-console speak "C:/Users/rafal/Downloads/s02e01przesluchania/rafal.txt" --eleven
    program
    .command('speak <file>')
    .option('-e, --eleven', 'Use ElevenLabs for speech')
    .description('Convert text file to speech')
    .action(async (file, options) => {
      try {
        await app.textToSpeech(file, options.eleven);
      } finally {
        await app.shutdown();
      }
    });

    // # Chat with AI
    // bun run s02e01-console chat <message> [--model model-name]
  program
    .command('chat <message>')
    .option('-m, --model <model>', 'Specify the model to use', 'gpt-4')
    .description('Chat with the AI')
    .action(async (message, options) => {
      try {
        await app.chat([{ role: 'user', content: message }], options.model);
      } finally {
        await app.shutdown();
      }
    });

  await program.parseAsync(process.argv);
}

main().catch(console.error);