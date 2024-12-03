

interface RobotDescription {
    description: string;
  }
  
  interface DalleResponse {
    created: number;
    data: Array<{
      url: string;
    }>;
  }

  const klucz_do_centrali = process.env.MY_AI_DEV_API_KEY;


async function fetchJsonData<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async function getRobotDescription(): Promise<RobotDescription> {
    const url = 'https://centrala.ag3nts.org/data/4999b7d1-5386-4349-a80b-d4a2a481116f/robotid.json';
    
    try {
      const data = await fetchJsonData<RobotDescription>(url);
      // The JSON parser automatically handles the Unicode escape sequences
      return data;
    } catch (error) {
      console.error('Failed to fetch robot description:', error);
      throw error;
    }
  }

  async function generateImage(prompt: string): Promise<string> {
    const enhancedPrompt = `High quality, detailed digital art of a robot: ${prompt}. 
      Photorealistic, dramatic lighting, intricate mechanical details, 
      professional product photography style, 8k resolution, octane render`;

    const url = 'https://api.openai.com/v1/images/generations';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        model: "dall-e-3",
        quality: "hd",
        style: "vivid",
      }),
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const result = await response.json() as DalleResponse;
    return result.data[0].url;
  }

  async function sendReport(imageUrl: string): Promise<any> {
    const response = await fetch('https://centrala.ag3nts.org/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: 'robotid',
        apikey: klucz_do_centrali, 
        answer: imageUrl
      })
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return await response.json();
  }

  
// Example usage combining robot description with image generation:
(async () => {
    try {
      const robotData = await getRobotDescription();
      console.log('Got description:', robotData.description);
      
      const imageUrl = await generateImage(robotData.description);
      console.log('Generated image URL:', imageUrl);

      console.log('Sending report...');
      // Send report and get response
      const serverResponse = await sendReport(imageUrl);
      console.log('Server response:', serverResponse);

      
      // Optional: Download the image
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      
      // If running in Node.js, you can save the file:
      const fs = require('fs');
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync('generated-robot.png', buffer);
      
    } catch (error) {
      console.error('Error:', error);
    }
  })();
