// En tu archivo de rutas (ej. routes/questions.js)
const { db } = require('./firebaseConfig');

app.post('/api/save-generated-questions', async (req, res) => {
  try {
    const questionsData = req.body; // El array de preguntas JSON
    const batch = db.batch(); // Usamos batch para guardar muchas a la vez eficientemente

    questionsData.forEach((doc) => {
      // Creamos una referencia con ID automático
      const docRef = db.collection('questions').doc(); 
      batch.set(docRef, {
        ...doc,
        randomId: Math.random() // IMPORTANTE: Agregamos esto para la aleatoriedad luego
      });
    });

    await batch.commit();
    res.status(200).send({ message: 'Preguntas guardadas en Firebase exitosamente' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/api/get-random-questions', async (req, res) => {
  try {
    // Método simple: Traer colección y mezclar (shuffling) en el servidor
    // Si la DB crece mucho, busca "Firestore random query methods"
    const snapshot = await db.collection('questions').get();
    let questions = [];
    
    snapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() });
    });

    // Algoritmo Fisher-Yates para mezclar el array
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // Retornamos, por ejemplo, solo 10 preguntas aleatorias
    res.json(questions.slice(0, 10)); 
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});