# backend/Dockerfile
FROM python:3.11-slim

# 1️⃣ Set a deterministic working directory
WORKDIR /app

# 2️⃣ Copy only the dependency list first – this lets Docker cache the layer
COPY requirements.txt .

# 3️⃣ Install Python deps (no cache to keep the image small)
RUN pip install --no-cache-dir -r requirements.txt

# 4️⃣ Now copy the actual source code
COPY ./app ./app

# 5️⃣ Expose the port FastAPI will listen on (optional but nice for docs)
EXPOSE 8000

# 6️⃣ Run uvicorn with hot‑reload for local development.
#    In production you’d drop the `--reload` flag.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
