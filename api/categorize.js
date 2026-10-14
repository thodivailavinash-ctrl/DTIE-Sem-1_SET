import { handleCategorizeRequest } from '../server/categorizeHandler.js';

export default async function handler(req, res) {
  // Read GEMINI_API_KEY from environment variables configured in Vercel project settings
  const apiKey = process.env.GEMINI_API_KEY || '';

  // In Vercel serverless functions, req.body may already be parsed as an object or still be a stream
  if (req.body && typeof req.body === 'object') {
    // If Vercel already parsed the JSON body, mock the stream for handleCategorizeRequest
    const originalOn = req.on.bind(req);
    req.on = function (event, callback) {
      if (event === 'data') {
        callback(JSON.stringify(req.body));
      } else if (event === 'end') {
        callback();
      } else {
        originalOn(event, callback);
      }
    };
  }

  await handleCategorizeRequest(req, res, apiKey);
}
