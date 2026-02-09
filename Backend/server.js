import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const app = express();
app.use(cors());
app.use(express.json());

// Para cargar el JSON de Firebase en ES Modules necesitamos este truco:
const serviceAccount = JSON.parse(
  await readFile(new URL('./wond-f8082-firebase-adminsdk-fbsvc-2220a2f20a.json', import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Endpoint para guardar preguntas generadas
app.post('/api/save-generated-questions', async (req, res) => {
  try {
    const questions = req.body;
    const batch = db.batch();

    questions.forEach((q) => {
      const docRef = db.collection('questions').doc();
      batch.set(docRef, {
        ...q,
        createdAt: new Date().toISOString()
      });
    });

    await batch.commit();
    res.status(200).json({ success: true, message: "Guardado en Firebase exitosamente" });
  } catch (error) {
    console.error("Error en Firebase:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para obtener preguntas aleatorias
app.get('/api/get-random-questions', async (req, res) => {
  try {
    const snapshot = await db.collection('questions').limit(50).get();
    const allQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Mezcla aleatoria y selección de 10
    const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    res.json(shuffled);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend ESM corriendo en http://localhost:${PORT}`));