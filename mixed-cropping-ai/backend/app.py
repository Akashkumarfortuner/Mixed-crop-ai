import os
import numpy as np
import pandas as pd
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from PIL import Image
import io
import base64

# --- INITIALIZATION ---
print("Initializing Flask app and loading models...")

# Initialize Flask App
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing to allow requests from our frontend

# --- Load Models and Preprocessors ---
try:
    MODEL_DIR = './models/'
    fusion_model = tf.keras.models.load_model(os.path.join(MODEL_DIR, 'fusion_yield_model.h5'))
    env_scaler = joblib.load(os.path.join(MODEL_DIR, 'env_data_scaler.joblib'))
    soil_preprocessor = joblib.load(os.path.join(MODEL_DIR, 'soil_data_preprocessor.joblib'))
    print("✅ Models and preprocessors loaded successfully.")
except Exception as e:
    print(f"❌ ERROR: Failed to load models. Ensure all .h5 and .joblib files are in the 'backend/models/' directory. Details: {e}")
    # Exit if models can't be loaded
    exit()

# --- HELPER FUNCTIONS FOR PREPROCESSING ---

def preprocess_environmental_data(env_data):
    """
    Preprocesses a sequence of environmental data.
    Input: A list of lists, e.g., [[temp, humidity, moisture, ph], ...]
    """
    # Convert to numpy array and scale
    env_np = np.array(env_data)
    # The scaler was fitted on a 2D array, so we must reshape, scale, and reshape back
    env_reshaped = env_np.reshape(-1, env_np.shape[-1])
    env_scaled_reshaped = env_scaler.transform(env_reshaped)
    env_scaled = env_scaled_reshaped.reshape(env_np.shape)
    # Add a batch dimension for the model
    return np.expand_dims(env_scaled, axis=0)

def preprocess_soil_data(soil_data):
    """
    Preprocesses tabular soil and microbial data.
    Input: A dictionary of soil data, e.g., {'primary_crop': 'Banana', 'nitrogen_kg_ha': 300, ...}
    """
    # Convert dictionary to a pandas DataFrame, as the preprocessor expects it
    soil_df = pd.DataFrame([soil_data])
    # Use the loaded preprocessor to transform the data
    processed_soil = soil_preprocessor.transform(soil_df)
    return processed_soil

def preprocess_image_data(base64_image_string):
    """
    Preprocesses a base64 encoded image string.
    """
    # Decode the base64 string
    img_bytes = base64.b64decode(base64_image_string)
    # Open the image using PIL
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    # Resize to the model's expected input size
    img = img.resize((224, 224))
    # Convert to numpy array and rescale pixel values
    img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0
    # Add a batch dimension
    return np.expand_dims(img_array, axis=0)


# --- API ENDPOINTS ---

# --- ADDED: WELCOME/STATUS ROUTE ---
@app.route('/')
def index():
    """Provides a simple status check."""
    return jsonify({
        'status': 'online',
        'message': 'AgriFusion AI Backend is running and ready for requests.'
    })


@app.route('/predict', methods=['POST'])
def predict_yield():
    """
    Receives all data, preprocesses it, and returns a yield prediction.
    """
    try:
        # Get JSON data from the request
        data = request.get_json()

        # --- Extract and Validate Data ---
        if not all(k in data for k in ['environmental_data', 'soil_data', 'image_data']):
            return jsonify({'error': 'Missing one or more required keys: environmental_data, soil_data, image_data'}), 400

        env_data_raw = data['environmental_data']
        soil_data_raw = data['soil_data']
        image_data_raw = data['image_data'] # This will be a base64 string

        # --- Preprocess Each Input ---
        processed_env = preprocess_environmental_data(env_data_raw)
        processed_soil = preprocess_soil_data(soil_data_raw)
        processed_image = preprocess_image_data(image_data_raw)

        # --- Make Prediction ---
        # The model expects a list of inputs in the correct order
        prediction = fusion_model.predict([processed_env, processed_soil, processed_image])

        # The output is a numpy array, so we extract the single value
        predicted_yield = float(prediction[0][0])

        # --- Return Response ---
        return jsonify({
            'predicted_yield_kg_ha': round(predicted_yield, 2)
        })

    except Exception as e:
        print(f"An error occurred during prediction: {e}")
        return jsonify({'error': 'An internal error occurred. Check the server logs.'}), 500



# --- Main execution block ---
if __name__ == '__main__':
    # Use port 5001 to avoid conflicts with other common ports
    app.run(host='0.0.0.0', port=5001, debug=True)