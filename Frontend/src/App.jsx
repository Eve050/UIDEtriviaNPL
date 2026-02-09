import React, { useState, useEffect } from "react";

// Importación de Componentes
import MainMenu from "./components/MainMenu.jsx";
import SetupPlayer from "./components/SetupPlayer.jsx";
import Game from "./components/Game.jsx";
import Scoreboard from "./components/Scoreboard.jsx";
import Settings from "./components/Settings.jsx";

// Importación del servicio de IA
import { generateQuizData } from "./services/aiService";

function App() {
  // Estados de navegación y configuración
  const [view, setView] = useState('menu');
  const [playerName, setPlayerName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [wildcardActive, setWildcardActive] = useState(true);
  const [difficultyTime, setDifficultyTime] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false); 

  // ESCALA DE PREMIOS ACTUALIZADA
  const escalaPremios = [100, 500, 1000, 5000, 15000, 50000, 100000, 250000, 500000, 1000000];

  /**
   * NUEVA LÓGICA: Obtiene preguntas aleatorias desde Firebase (vía Backend)
   */
  const prepareGame = async () => {
    try {
      // Llamamos al nuevo endpoint de Firebase que creamos en el Backend
      const response = await fetch('http://localhost:5000/api/get-random-questions');
      const data = await response.json();

      if (!data || data.length === 0) {
        console.warn('No se recibieron preguntas de Firebase');
        setQuestions([]);
        return;
      }

      // Mapeamos las preguntas recibidas para asignarles el premio según su posición
      const finalQuestions = data.map((q, index) => ({
        ...q,
        prize: escalaPremios[index] || 0
      }));

      setQuestions(finalQuestions);
    } catch (error) {
      console.error('Error cargando preguntas desde Firebase:', error);
      setQuestions([]);
    }
  };

  /**
   * NUEVA LÓGICA: Genera con IA y guarda directamente en Firebase
   */
  const handleGenerateBank = async () => {
    setIsGenerating(true);
    try {
      const existingTexts = questions.map(q => q.question);
      const data = await generateQuizData(existingTexts);
      
      if (data && data.questions && data.questions.length > 0) {
        // ENVIAR A FIREBASE (A través del backend)
        const resp = await fetch('http://localhost:5000/api/save-generated-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.questions) // Enviamos el array directamente
        });

        const result = await resp.json();
        if (resp.ok) {
          alert(`✅ ¡Éxito! Las preguntas se guardaron en Firebase Cloud Firestore.`);
        } else {
          throw new Error(result.error || "Error al guardar en la nube");
        }
      }
    } catch (error) {
      console.error("Error en el proceso:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (view === 'game') {
      prepareGame();
    }
  }, [view]);

  // --- Lógica de Scoreboard (LocalStorage se mantiene igual por ahora) ---
  const saveScore = (name, score) => {
    const saved = JSON.parse(localStorage.getItem('scores') || '[]');
    const newEntry = { 
      name: name || "Anónimo", 
      score: score, 
      date: new Date().toLocaleString() 
    };
    const updatedScores = [...saved, newEntry].sort((a, b) => b.score - a.score);
    localStorage.setItem('scores', JSON.stringify(updatedScores));
  };

  const clearScores = () => {
    if (window.confirm("¿Estás seguro?")) {
      localStorage.removeItem('scores');
      alert("Historial borrado.");
    }
  };

  return (
    <div className="app-container">
      {view === 'menu' && <MainMenu setView={setView} />}

      {view === 'setup' && (
        <SetupPlayer setView={setView} setPlayerName={setPlayerName} />
      )}

      {view === 'game' && questions.length > 0 && (
        <Game 
          playerName={playerName} 
          questions={questions} 
          setView={setView} 
          saveScore={saveScore} 
          wildcardActive={wildcardActive} 
          difficultyTime={difficultyTime} 
        />
      )}

      {view === 'scores' && <Scoreboard setView={setView} clearScores={clearScores} />}

      {view === 'settings' && (
        <Settings 
          setView={setView} 
          wildcardActive={wildcardActive} 
          setWildcardActive={setWildcardActive} 
          difficultyTime={difficultyTime} 
          setDifficultyTime={setDifficultyTime} 
          onGenerateBank={handleGenerateBank} 
        />
      )}

      {isGenerating && (
        <div className="loading-overlay">
          <p>Subiendo nuevas preguntas a Firebase...</p>
        </div>
      )}
    </div>
  );
}

export default App;