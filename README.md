# 🚀 WOND - Trivia Game - AI Powered

Este proyecto es una plataforma de juego de trivia interactiva que utiliza Inteligencia Artificial para generar contenido dinámico sobre TI e Informática.

## 👥 Equipo de Desarrollo (Full Stack)
* **Sebastián Chocho** - Full Stack Developer
* **Aidan Carpio** - Full Stack Developer
* **Evelyn Valverde** - Full Stack Developer

## 🛠️ Stack Tecnológico
* **Frontend**: React.js, Vite, CSS3 Moderno, Local Storage.
* **Backend**: Node.js, Express, File System (fs), CORS, Body-Parser.
* **Inteligencia Artificial**: DeepSeek API (Modelo `deepseek-chat`).

## 📋 Características Principales
* **Generación con IA**: Crea bancos de 20 preguntas únicas sobre computación e informática.
* **Validación de Duplicados**: Evita repetir las últimas 10 preguntas generadas.
* **Sistema de Guardado Híbrido**: Intenta guardar en el servidor (`/data`) y ofrece descarga local como respaldo.
* **Game Design**: Temporizador dinámico, comodín de llamada (+15s) y escala de premios hasta $1,000,000.
* **Analytics**: Exportación de resultados de jugadores en formato CSV.

## ⚙️ Configuración e Instalación
### 1. Requisitos Previos
* Node.js instalado y API Key de DeepSeek.
### 2. Instalación del Backend
`cd Backend && npm install && node server.js`
### 3. Instalación del Frontend
`cd Frontend && npm install && npm run dev`
*El servidor corre en http://localhost:5000 y el cliente en el puerto definido por Vite.*

## 📂 Arquitectura de Archivos
* **aiService.js**: Integración con la API de DeepSeek.
* **storageService.js**: Comunicación con el backend y persistencia.
* **Game.jsx & GameResult.jsx**: Lógica del juego y pantallas de resultados.
* **server.js**: API RESTful para almacenamiento de archivos JSON.
* **Scoreboard.jsx**: Gestión del Hall de la Fama y CSV.
* **Settings.jsx & MainMenu.jsx**: Configuración y navegación.
* **SetupPlayer.jsx**: Registro de usuario.

## 📝 Licencia
Proyecto desarrollado para fines académicos y de entrenamiento en tecnologías.
