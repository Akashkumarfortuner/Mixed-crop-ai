"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Leaf, TestTube2, Sprout, UploadCloud, Tractor, BarChart3, AlertTriangle, Loader2 } from "lucide-react"

// Define the structure of our form state
type FormState = {
  primary_crop: string;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  organic_carbon_percent: number;
  microbe_trichoderma_cfu_g: number;
  microbe_pseudomonas_cfu_g: number;
}

type PredictionState = "idle" | "loading" | "error" | "result"

export default function Page() {
  const [form, setForm] = useState<Omit<FormState, 'primary_crop'>>({
    nitrogen_kg_ha: 300,
    phosphorus_kg_ha: 45,
    potassium_kg_ha: 250,
    organic_carbon_percent: 1.5,
    microbe_trichoderma_cfu_g: 500000,
    microbe_pseudomonas_cfu_g: 400000,
  })
  const [crop, setCrop] = useState("Banana");
  
  // NEW STATE: To hold the actual image file and its base64 representation
  const [image, setImage] = useState<{ preview: string | null; file: File | null }>({
    preview: null,
    file: null,
  });

  const [status, setStatus] = useState<PredictionState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<number | null>(null)

  const canPredict = useMemo(() => {
    return form.nitrogen_kg_ha >= 0 && form.phosphorus_kg_ha >= 0 && form.potassium_kg_ha >= 0 && image.file !== null;
  }, [form, image.file]);

  // NEW HELPER FUNCTION: To convert the image file to a base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove the "data:image/...;base64," part
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // UPDATED API CALL LOGIC
  async function onPredict() {
    if (!canPredict || !image.file) {
        setError("Please ensure all fields are filled and an image is uploaded.");
        return;
    };

    setError(null);
    setStatus("loading");

    try {
      // 1. Convert the image to base64
      const imageBase64 = await fileToBase64(image.file);
      
      // 2. Construct the payload matching your Flask backend's expectations
      const payload = {
        environmental_data: Array(168).fill([28, 75, 60, 6.5]), // Mock data for now
        soil_data: {
            primary_crop: crop,
            ...form
        },
        image_data: imageBase64,
      };

      // 3. Call your internal Next.js API route
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // 4. Set the result and update status
      setResult(data.predicted_yield_kg_ha);
      setStatus("result");

    } catch (err) {
      console.error("Prediction Error:", err);
      setError("Something went wrong while analyzing your data.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-dvh bg-gray-950 text-white">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <Leaf className="h-7 w-7 text-green-400" aria-hidden />
          <h1 className="text-pretty text-2xl md:text-3xl font-bold">AgriFusion AI Predictor</h1>
        </div>
      </motion.header>

      <section className="px-6 md:px-10 pb-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-xl border border-gray-700 bg-gray-800 p-5">
              <div className="mb-4 flex items-center gap-2">
                <TestTube2 className="h-5 w-5 text-purple-400" aria-hidden />
                <h2 className="text-lg font-semibold">Soil & Microbial Data</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="crop" className="text-sm text-gray-400">Primary Crop</label>
                  <select id="crop" value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full rounded-md bg-gray-700 text-gray-200 px-3 py-2 outline-none border border-gray-600 focus:ring-2 focus:ring-green-500">
                    <option>Banana</option>
                    <option>Arecanut</option>
                    <option>Black Pepper</option>
                  </select>
                </div>
                {Object.keys(form).map((key) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label htmlFor={key} className="text-sm text-gray-400 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input id={key} type="number" value={form[key as keyof typeof form]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))} className="w-full rounded-md bg-gray-700 text-gray-200 px-3 py-2 outline-none border border-gray-600 focus:ring-2 focus:ring-green-500"/>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="rounded-xl border border-gray-700 bg-gray-800 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sprout className="h-5 w-5 text-teal-400" aria-hidden />
                <h2 className="text-lg font-semibold">Leaf Image Analysis</h2>
              </div>
              <LeafDropzone imagePreview={image.preview} onFileSelect={setImage} />
            </motion.div>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="rounded-xl border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-800 p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" aria-hidden />
              <h2 className="text-lg font-semibold">Yield Prediction</h2>
            </div>
            <div className="min-h-60 flex items-center justify-center rounded-lg bg-gray-900/40 p-6 text-center">
              {status === "idle" && <div className="flex flex-col items-center gap-3"><Tractor className="h-12 w-12 text-gray-600" /><p className="text-gray-500">Awaiting data for yield prediction...</p></div>}
              {status === "loading" && <div className="flex flex-col items-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-green-500" /><p className="font-medium text-green-500">Analyzing with Fusion AI...</p></div>}
              {status === "error" && <div className="flex flex-col items-center gap-3"><AlertTriangle className="h-8 w-8 text-red-500" /><p className="font-semibold text-red-400">{error}</p></div>}
              {status === "result" && <div className="flex flex-col items-center gap-1"><p className="text-sm text-gray-400">Predicted Yield</p><p className="text-5xl font-extrabold text-green-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]">{result}</p><p className="text-white">kg / hectare</p></div>}
            </div>
            <div className="mt-5">
              <button type="button" onClick={onPredict} disabled={!canPredict || status === "loading"} className="w-full rounded-md px-4 py-2 font-semibold transition-colors bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed">
                Predict Yield
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

function LeafDropzone({ imagePreview, onFileSelect }: { imagePreview: string | null; onFileSelect: (state: { preview: string | null; file: File | null }) => void; }) {
  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!/^image\/(png|jpe?g)$/i.test(file.type) || file.size > 10 * 1024 * 1024) return;
    const previewUrl = URL.createObjectURL(file);
    onFileSelect({ preview: previewUrl, file: file });
  }

  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} className="rounded-lg border-2 border-dashed border-gray-600 bg-gray-700/50 p-6 transition-colors hover:border-green-500">
      <label className="flex w-full cursor-pointer flex-col items-center gap-2 text-center">
        {imagePreview ? (
          <img src={imagePreview} alt="Uploaded leaf preview" className="h-40 w-40 rounded-lg object-cover" />
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <p className="font-medium">Click or drag & drop to upload</p>
            <p className="text-sm text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
          </>
        )}
        <input type="file" accept="image/png,image/jpg,image/jpeg" className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      </label>
    </div>
  );
}