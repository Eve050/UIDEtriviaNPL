import React, { useState, useEffect } from 'react';

const Scoreboard = ({ setView, clearScores }) => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('scores') || '[]');
    setScores(saved);
  }, []);

  const downloadCSV = () => {
    if (scores.length === 0) return alert("No hay datos para descargar");
    const headers = ["Ranking", "Nombre", "Puntaje", "Fecha"];
    const rows = scores.map((s, i) => `${i + 1},"${s.name}",${s.score},"${s.date}"`);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte_jugadores_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    if (window.confirm("¿Borrar todo el historial?")) {
      clearScores();
      setScores([]);
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-card" style={{ maxWidth: '600px', width: '90%' }}>
        <h2 className="settings-title">🏆 HALL DE LA FAMA</h2>
        
        <div className="scoreboard-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '0 15px 10px',
          fontSize: '0.8rem',
          color: '#aaa',
          textTransform: 'uppercase',
          borderBottom: '1px solid #444'
        }}>
          <span>Pos / Jugador</span>
          <span>Premio Acumulado</span>
        </div>

        <div className="table-container" style={{ 
          maxHeight: '400px', 
          overflowY: 'auto', 
          margin: '10px 0 20px',
          paddingRight: '5px'
        }}>
          {scores.length > 0 ? (
            scores.map((s, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 15px',
                marginBottom: '8px',
                background: index === 0 ? 'rgba(241, 196, 15, 0.15)' : 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                borderLeft: index === 0 ? '4px solid #f1c40f' : '4px solid #555',
                transition: 'transform 0.2s'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: index === 0 ? '#f1c40f' : '#fff',
                      fontSize: '1.1rem'
                    }}>
                      #{index + 1}
                    </span>
                    <span style={{ fontWeight: '500', fontSize: '1rem' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                    📅 {s.date}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    display: 'block',
                    color: '#2ecc71', 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem' 
                  }}>
                    ${s.score.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#aaa', textTransform: 'uppercase' }}>
                    Puntos obtenidos
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No hay partidas registradas aún.</p>
            </div>
          )}
        </div>

        <div className="settings-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={downloadCSV} className="btn-save-settings" style={{ backgroundColor: '#28a745', fontSize: '0.8rem' }}>
              📥 EXPORTAR CSV
            </button>
            <button onClick={handleClear} className="btn-save-settings" style={{ backgroundColor: '#dc3545', fontSize: '0.8rem' }}>
              🗑️ LIMPIAR TODO
            </button>
          </div>
          <button onClick={() => setView('menu')} className="btn-save-settings" style={{ marginTop: '10px' }}>
            VOLVER AL MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;