# 📋 Document Tracker (MERN) — Version 1

A real-world full-stack application built to track student document submissions efficiently. Designed for practical usage by school staff with a clean mobile-friendly interface and persistent storage.

---

## 🚀 Live Demo
- Frontend (Netlify): https://69edb5a9e97514b841df1593--inquisitive-starburst-c6bf52.netlify.app/
- Backend (Render): https://doctracker-ev1m.onrender.com

---

## ✨ Features
- 📊 Track document submission status per student
- 💾 Auto-save with MongoDB (persistent data)
- 📱 Mobile-friendly UI for real-world usage
- 📄 Export reports as:
  - PDF
  - Excel
  - JSON backup
- 🔄 Real-time updates and status tracking
- 📈 Summary view with completion insights

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- JavaScript (ES6+)
- Inline + CSS styling

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Deployment
- Netlify (Frontend)
- Render (Backend)

---

## 📁 Project Structure

```
doc-tracker/
│
├── client/         # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/         # Express backend
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Variables

### Frontend (`client/.env`)
```
VITE_BASE_URL=https://your-backend-url
```

### Backend (`server/.env`)
```
MONGO_URL=your_mongodb_connection_string
PORT=5000
```

---

## 🧪 Running Locally

### 1. Clone the repo
```
git clone https://github.com/your-username/doc-tracker.git
cd doc-tracker
```

### 2. Start Backend
```
cd server
npm install
npm run dev
```

### 3. Start Frontend
```
cd client
npm install
npm run dev
```

---

## 📌 Key Learnings

- Handling environment variables (Vite vs Node)
- Debugging deployment issues (Netlify + Render)
- MongoDB authentication & connection handling
- API integration between frontend and backend
- Real-world problem solving under constraints

---

## 🎯 Version 1 Status

✅ Core functionality complete  
✅ Fully deployed and working  
✅ Real-world usage validated  

🚀 Ready for enhancements

---

## 🔮 Future Improvements (v2 Ideas)

- Authentication (admin login)
- Multi-class support
- Add/Edit student functionality
- Better PDF styling
- Role-based access (teacher/parent)
- PWA support (installable app)

---

## 👩‍💻 Author

Harshita A

---

## 🏁 Final Note

This project was built rapidly and deployed under real-world constraints. It represents practical full-stack capability — not just a tutorial implementation.

