@echo off
cd backend
start cmd /k "node index.js"
cd ../frontend
start cmd /k "npm start"
