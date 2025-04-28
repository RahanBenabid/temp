# Backend Setup Guide (Node.js + Firebase + MySQL)

## Prerequisites
Make sure you have the following installed:
- **Node.js** (Download from [nodejs.org](https://nodejs.org/))
- **NPM** (Comes with Node.js, check with `npm -v`)
- **Git** (Download from [git-scm.com](https://git-scm.com/))
- **MySQL Server** (Download from [mysql.com](https://www.mysql.com/))
- **Firebase CLI** (Install using `npm install -g firebase-tools`)

Check versions:
```bash
node -v   # Check Node.js version
npm -v    # Check NPM version
git --version  # Check Git version
mysql --version  # Check MySQL version
firebase --version  # Check Firebase CLI version
```

---

## 1️⃣ Cloning the Repository
If you haven’t cloned the project yet, run:
```bash
git clone <repository-url>
```
Replace `<repository-url>` with the actual repository link.

Navigate into the backend folder:
```bash
cd <project-folder>
```

---

## 2️⃣ Checking Available Branches
To see the remote branches, run:
```bash
git branch -r
```
Expected output:
```
origin/main
origin/backend
```

If `backend` exists, switch to it:
```bash
git checkout -b backend origin/backend
```
Or (for newer Git versions):
```bash
git switch --track origin/backend
```

---

## 3️⃣ Installing Dependencies
Once inside the backend folder, install the required packages:
```bash
npm install
```
This will download all necessary dependencies.

---

## 4️⃣ Setting Up Environment Variables
Create a `.env` file in the backend folder and add:
```
PORT=3000
HOST=localhost
HOST_URL=http://localhost:3000
TOKEN_SECRET=your_token_secret
FIREBASE_API_KEY=your_firebase_api_key
```
Replace `yourpassword`, `yourdatabase`, and `your_firebase_api_key` with actual values.

---

## 5️⃣ Setting Up MySQL Database
If you haven’t created the database yet, open MySQL and run:
```sql
CREATE DATABASE yourdatabase;
```
To connect, update `DB_HOST`, `DB_USER`, and `DB_PASSWORD` in `.env`.

Run migrations or database setup scripts if available:
```bash
npm run migrate
```

---

## 6️⃣ Running the Backend Server
Start the server with:
```bash
npm start
```
Or in development mode (with auto-restart on changes):
```bash
npm run dev
```
The backend should now be running at `http://localhost:5000/`.

---

## 7️⃣ Keeping Your Branch Up to Date
Before making changes, always pull the latest updates:
```bash
git pull origin backend
```

---

## 8️⃣ Making Changes and Pushing Without Errors
### After making changes:
```bash
git add .
git commit -m "Your commit message"
git pull origin backend  # Ensure you have the latest version
git push origin backend
```

**If a merge conflict happens:**
Git will notify you. Fix the conflicting files, then run:
```bash
git add .
git commit -m "Resolved merge conflict"
git push origin backend
```

---

## Additional Tips
- **Always check which branch you’re on before working:**
  ```bash
  git branch
  ```
- **Make sure to pull updates before pushing new work.**
- **Use `nodemon` for auto-restarting the server during development.**
- **Test API endpoints using tools like Postman or Thunder Client.**
- **Ask for help if you run into issues! 😊**

Now you’re ready to develop the backend without errors! 🚀

