// Server-side category lists directly aligned with src/utils/categories.js
export const EXPENSE_CATEGORY_IDS = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Entertainment',
  'Healthcare',
  'Other'
];

export const INCOME_SOURCE_IDS = [
  'Salary',
  'Freelance',
  'Business',
  'Gift',
  'Other'
];

/**
 * Handle POST /api/categorize
 * Uses GEMINI_API_KEY securely on the server.
 * Never leaks the API key to the client.
 */
export async function handleCategorizeRequest(req, res, apiKey) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  // Read request body
  let bodyStr = '';
  req.on('data', (chunk) => {
    bodyStr += chunk;
  });

  req.on('end', async () => {
    try {
      let parsed;
      try {
        parsed = JSON.parse(bodyStr || '{}');
      } catch (e) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        return;
      }

      const description = typeof parsed.description === 'string' ? parsed.description.trim() : '';
      const type = parsed.type === 'income' ? 'income' : 'expense';

      if (!description) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Transaction description is required' }));
        return;
      }

      // Check if server has GEMINI_API_KEY configured
      if (!apiKey) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'AI service unavailable: GEMINI_API_KEY is not configured on the server.',
            code: 'API_KEY_MISSING'
          })
        );
        return;
      }

      const validCategories = type === 'income' ? INCOME_SOURCE_IDS : EXPENSE_CATEGORY_IDS;

      // System instruction and prompt strictly constrained to description & type
      // Never asks for or includes user name, email, or transaction history.
      const systemInstruction = `You are an accurate financial transaction classifier.
Your job is to categorize a financial transaction based solely on its brief description.
The transaction type is: "${type}".
Allowed categories for ${type} transactions are strictly one of:
${validCategories.map((c) => `- "${c}"`).join('\n')}

Instructions:
1. Choose the single most appropriate category from the allowed list.
2. If unsure or description is vague, choose "Other" with a lower confidence.
3. Return ONLY a valid JSON object with these exact keys:
   - "category": string (must exactly match one of the allowed categories)
   - "confidence": number between 0.0 and 1.0 (e.g. 0.95 for clear, 0.45 for ambiguous)
   - "reason": string (a short, concise explanation in 3 to 10 words, e.g. "Ride-hailing transport expense")
Do not include markdown backticks or any surrounding text.`;

      const promptText = `Transaction Description: "${description}"
Classify this ${type} transaction.`;

      // Call Google Gemini API securely with high-availability, active-quota models first
      const candidateModels = [
        'gemini-3-flash-preview',
        'gemini-3.1-flash-lite-preview',
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.7-flash',
        'gemini-3.8-flash',
        'gemini-flash-latest'
      ];
      let lastErrorStatus = null;
      let lastErrorBody = null;
      let geminiResult = null;

      for (const modelName of candidateModels) {
        try {
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const apiPayload = {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemInstruction}\n\n${promptText}` }]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              maxOutputTokens: 800
            }
          };

          const response = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload),
            signal: AbortSignal.timeout(6000)
          });

          if (response.ok) {
            geminiResult = await response.json();
            break;
          }

          lastErrorStatus = response.status;
          lastErrorBody = await response.text();
          console.warn(`Model ${modelName} returned HTTP ${response.status}. Attempting fallback...`);
          // If 503 temporary overload, pause briefly before next model
          if (response.status === 503) {
            await new Promise((r) => setTimeout(r, 300));
          }
        } catch (fetchErr) {
          console.warn(`Error with model ${modelName}:`, fetchErr.message);
        }
      }

      if (!geminiResult) {
        console.error('All Gemini candidate models failed. Last status:', lastErrorStatus, lastErrorBody);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'AI service error while classifying transaction.',
            code: 'AI_PROVIDER_ERROR'
          })
        );
        return;
      }

      const rawText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse and validate structured output
      let modelJson;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const cleanedText = jsonMatch ? jsonMatch[0] : rawText.trim();
        modelJson = JSON.parse(cleanedText);
      } catch (jsonErr) {
        console.error('Failed to parse Gemini output as JSON:', rawText);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Invalid structured response from AI model.',
            code: 'INVALID_MODEL_OUTPUT'
          })
        );
        return;
      }

      const suggestedCategory = modelJson?.category;
      const confidence = typeof modelJson?.confidence === 'number' ? Math.max(0, Math.min(1, modelJson.confidence)) : 0.5;
      const reason = typeof modelJson?.reason === 'string' ? modelJson.reason.trim() : 'AI categorized';

      // Validate against project's allowed categories on the server
      if (!validCategories.includes(suggestedCategory)) {
        console.warn(`Gemini returned invalid category "${suggestedCategory}". Valid list:`, validCategories);
        res.statusCode = 422;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: `Model returned unknown category "${suggestedCategory}".`,
            code: 'REJECTED_CATEGORY',
            suggestedCategory: null
          })
        );
        return;
      }

      // Return valid suggestion
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          category: suggestedCategory,
          confidence: Number(confidence.toFixed(2)),
          reason,
          type
        })
      );
    } catch (err) {
      console.error('Error handling categorize request:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Internal server error processing categorization.',
          code: 'INTERNAL_ERROR'
        })
      );
    }
  });
}
