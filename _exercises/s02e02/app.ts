import { OpenAIService } from "./OpenAIService";
import type { ChatCompletion, ChatCompletionContentPartImage, ChatCompletionContentPartText, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import type { ResizedImageMetadata } from "./app.dt";
import { writeFileSync } from "fs";


// Configuration Constants
const fileNumber = '04';
const IMAGE_PATH = join(__dirname, `${fileNumber}.png`);
const OPTIMIZED_IMAGE_PATH = join(__dirname, `${fileNumber}_optimized.png`);
const COMPRESSION_LEVEL = 5;
const IMAGE_DETAIL: 'low' | 'high' = 'high';

// Initialize OpenAIService
const openAIService = new OpenAIService();

// Function to process the image
async function processImage(): Promise<{ imageBase64: string; metadata: ResizedImageMetadata }> {
    try {
        const imageBuffer = readFileSync(IMAGE_PATH);
        const resizedImageBuffer = await sharp(imageBuffer)
            .resize(2048, 2048, { fit: 'inside' })
            .png({ compressionLevel: COMPRESSION_LEVEL })
            .toBuffer();

        await sharp(resizedImageBuffer).toFile(OPTIMIZED_IMAGE_PATH);

        const imageBase64 = resizedImageBuffer.toString('base64');
        const metadata = await sharp(resizedImageBuffer).metadata();

        if (!metadata.width || !metadata.height) {
            throw new Error("Unable to retrieve image dimensions.");
        }

        return { imageBase64, metadata: { width: metadata.width, height: metadata.height } };
    } catch (error) {
        console.error("Image processing failed:", error);
        throw error;
    }
}

// Helper function to transform message content
function transformMessageContent(message: ChatCompletionMessageParam): ChatCompletionMessageParam {
    if (typeof message.content === 'string') {
        return { role: message.role, content: message.content } as ChatCompletionMessageParam;
    } else {
        const textContent = message.content?.find((contentPart): contentPart is ChatCompletionContentPartText => 'text' in contentPart)?.text as string;
        return { role: message.role, content: textContent } as ChatCompletionMessageParam;
    }
}


// Main Execution Function
(async () => {
    try {
        const { imageBase64, metadata } = await processImage();
        const imageTokenCost = await openAIService.calculateImageTokens(metadata.width, metadata.height, IMAGE_DETAIL);
        
        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `Jesteś wyjątkowo zdolnym modelem Vision Language, specjalizującym się w analizie historycznych map i identyfikacji kluczowych punktów orientacyjnych, takich jak spichlerze, twierdze lub inne charakterystyczne elementy. Twoim zadaniem jest pomoc w określeniu miasta pochodzenia wielu fragmentów map.

                            Jeden z tych fragmentów może nie należeć do tego samego miasta i powinien zostać wykluczony z analizy. Wykorzystaj swoje umiejętności, aby:

                            Zidentyfikować wszelkie widoczne teksty lub oznaczenia na mapach.
                            Rozpoznać charakterystyczne punkty orientacyjne i opisać ich cechy.
                            Porównać fragmenty, aby określić, które z nich należą do tego samego miasta.
                            Wskazać fragment, który prawdopodobnie pochodzi z innej lokalizacji.
                            Podać nazwę miasta, z którego pochodzi większość fragmentów, na podstawie przeprowadzonej analizy.
                            Jeśli nie masz pewności, dokonaj rozsądnych założeń na podstawie widocznych danych. Odpowiadaj jasno i zwięźle, podając istotne szczegóły dla każdego analizowanego fragmentu.`
            },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${imageBase64}`,
                            detail: "high"
                        }
                    },
                    {
                        type: "text",
                        text: "To jest fragment historycznej mapy. Proszę przeanalizuj obraz i zidentyfikuj wszelkie charakterystyczne elementy, takie jak spichlerze, twierdze lub inne wyróżniające się obiekty. Jeśli widoczny jest jakikolwiek tekst lub oznaczenia, proszę je również przepisać."
                    },
                ]
            }
        ];

        const mappedMessages: ChatCompletionMessageParam[] = messages.map(transformMessageContent);
        const textTokenCost = await openAIService.countTokens(mappedMessages);
        const totalTokenCost = imageTokenCost + textTokenCost;


        const chatCompletion = await openAIService.completion(messages, "gpt-4o", false, false, 1024) as ChatCompletion;
        const output = chatCompletion.choices[0].message.content;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = join(__dirname, `${fileNumber}_output_${timestamp}.txt`);
        // writeFileSync(outputPath, output || '', 'utf-8');
        console.log(`Output saved to: ${outputPath}`);

        console.log(output);

        // Add follow-up query to determine the city
        const followUpMessages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `Jesteś pomocnym asystentem, który potrafi identyfikować polskie miasta na podstawie opisów map historycznych. Skupiaj się wyłącznie na miastach znajdujących się w Polsce. 
                Proszę podaj jasną, zwięzłą odpowiedź zawierającą nazwę miasta oraz krótkie wyjaśnienie dlaczego uważasz, że to właśnie ta lokalizacja.`
            },
            {
                role: "user",
                content: `Opisujesz fragment historycznej mapy. Proszę podaj jasną, zwięzłą odpowiedź zawierającą nazwę miasta oraz krótkie wyjaśnienie dlaczego uważasz, 
                że to właśnie ta lokalizacja.\n\n${output}`
            }
        ];

        const cityCompletion = await openAIService.completion(
            followUpMessages, 
            "gpt-4o", 
            false, 
            false, 
            1024
        ) as ChatCompletion;

        const cityOutput = cityCompletion.choices[0].message.content;
        console.log("\nIdentified City:");
        console.log(cityOutput);

        // Save both outputs to file
        const combinedOutput = `Original Analysis:\n${output}\n\nIdentified City:\n${cityOutput}`;
        writeFileSync(outputPath, combinedOutput, 'utf-8');        
       

    } catch (error) {
        console.error("An error occurred during execution:", error);
    }
})();