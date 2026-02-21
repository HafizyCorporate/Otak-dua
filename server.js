require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// --- INI BARIS YANG HILANG. INI WAJIB ADA AGAR HTML BISA TAMPIL ---
app.use(express.static(__dirname));
// ------------------------------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/demo-soal', async (req, res) => {
    const { materi } = req.body;
    if (!materi) return res.status(400).json({ error: "Materi tidak boleh kosong" });

    const prompt = `Buatkan tepat 1 soal pilihan ganda (A, B, C, D) dalam bahasa Indonesia untuk materi: ${materi}. Langsung berikan soal dan opsinya.`;

    try {
        let result;
        try {
            const primaryModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            result = await primaryModel.generateContent(prompt);
        } catch (e) {
            console.warn("Beralih ke fallback model Gemini 3 Flash...");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-3-flash" });
            result = await fallbackModel.generateContent(prompt);
        }
        
        const aiResponseText = result.response.text().replace(/\*\*/g, '');
        res.json({ soal: aiResponseText });
    } catch (error) {
        res.status(500).json({ error: "Sistem sedang sibuk." });
    }
});

// Ubah bagian ini di paling bawah server.js
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server OtakDua jalan di port ${PORT}`));
