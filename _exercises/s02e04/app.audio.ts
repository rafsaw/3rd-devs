import fs from 'fs/promises';
import path from 'path';
import { OpenAIService } from './OpenAIService';

const openaiService = new OpenAIService();

async function readFilesFromDirectory(directoryPath: string) {
    try {
      const files = await fs.readdir(directoryPath);
      const fileContents = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(directoryPath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            const content = await fs.readFile(filePath);
            return {
              name: file,
              content,
              path: filePath
            };
          }
          return null;
        })
      );
      return fileContents.filter((file): file is NonNullable<typeof file> => file !== null);
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
}

async function main() {
    const directoryPath = path.join(__dirname, 'files');
    console.log("Starting narration generation...", directoryPath);
    
    try {
        const files = await readFilesFromDirectory(directoryPath);
        for (const file of files) {
            if (file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
                console.log('Processing file:', file.path);
                // const transcription = await openaiService.transcribe(file.content);
                const txtPath = file.path.replace(/\.(mp3|wav|m4a|ogg)$/i, '.txt');
                // await fs.writeFile(txtPath, transcription);
                console.log(`Saved transcription to ${txtPath}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main().catch(console.error);