from fastapi import FastAPI,HTTPException, Query
from typing import List
import tensorflow as tf
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins for better security
    allow_credentials=True,
    allow_methods=["*"],  # HTTP methods: GET, POST, PUT, etc.
    allow_headers=["*"],  # Headers like Content-Type, Authorization, etc.
)


model = tf.keras.models.load_model("modelo_final.keras")

#HOME
@app.get("/")
async def home():
    return {"message": "Bem vindos ao meu CRUD"}


name_mapping = [
    "box",
    "circularTorus",
    "cone",
    "coneOffset",
    "cylinder",
    "cylinderSlope",
    "dish",
    "mesh",
    "pyramid",
    "rectangularTorus",
    "sphere"
]


@app.get("/api")
async def home(pixels:List[str] = Query(..., description="photo pixels in B&W"),):
    input_nn = np.reshape(pixels,(224,224,1))
    
    result = model.predict(input_nn)
    
    return name_mapping[result]