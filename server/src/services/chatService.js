const { GoogleGenerativeAI } = require('@google/generative-ai');
const Prescription = require('../models/Prescription');
const prescriptionService = require('./prescriptionService');
const logger = require('../utils/logger');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

class ChatService {
  async getChatResponse(user, message, chatHistory = []) {
    const isDemoMode = !genAI;
    let contextPrompt = '';
    
    try {
      if (user.role === 'doctor') {
        const patients = await prescriptionService.getDoctorPatients(user.id);
        const medicines = await prescriptionService.getDoctorMedicines(user.id);
        
        const patientLines = patients.map(p => 
          `- Patient Name: ${p.name}, Phone: ${p.phoneNumber}, Prescriptions: ${p.prescriptionCount}, Last Visit: ${p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'N/A'}`
        ).join('\n');

        const medicineLines = medicines.map(m => 
          `- Medicine: ${m.name}, Times Prescribed: ${m.count}, Typical Dosages: ${m.dosages?.join(', ') || 'N/A'}`
        ).slice(0, 15).join('\n');

        contextPrompt = `
You are the RxManager Clinical Assistant, helping Dr. ${user.name || 'Doctor'}.
You can suggest typical dosages, help draft prescriptions, or check medicine info.
Here is the doctor's current patient roster:
${patientLines || 'No patients treated yet.'}

Here are the medicines frequently prescribed by this doctor:
${medicineLines || 'No medicines recorded yet.'}

GUIDELINES:
1. Always maintain a professional, helpful, clinical tone.
2. Help the doctor draft prescriptions. If they ask for advice on writing a prescription, provide a structured list of medicines (name, dosage, frequency, duration) they can copy-paste.
3. Remind them that they are the medical professional and they must review and verify all suggestions before issuing them to a patient.
4. Keep explanations concise and scientifically accurate.
`;
      } else {
        const prescriptions = await prescriptionService.getPatientPrescriptions(user.id);
        
        const prescriptionLines = prescriptions.map((p, idx) => {
          const medList = p.medicines.map(m => 
            `  * ${m.name} - Dosage: ${m.dosage}, Frequency: ${m.frequency}, Duration: ${m.duration}`
          ).join('\n');
          return `Prescription #${idx + 1}:
  - Date: ${new Date(p.createdAt).toLocaleDateString()}
  - Doctor: Dr. ${p.doctor?.name || 'Unknown'}
  - Diagnosis: ${p.diagnosis}
  - Status: ${p.status}
  - Medicines:
${medList}
  - Doctor Notes: ${p.notes || 'None'}`;
        }).join('\n\n');

        contextPrompt = `
You are the RxManager Patient Assistant, helping ${user.name || 'Patient'}.
You can explain their active prescriptions, describe their prescribed medicines (dosages, standard directions, side effects, precautions), or answer general recovery questions.
Here is the patient's prescription history from their doctor:
${prescriptionLines || 'No prescriptions found in the account history.'}

GUIDELINES:
1. Explain medical terms, diagnoses, and medicines in simple, reassuring, and clear patient-friendly language.
2. Only discuss details based on the prescriptions listed above. Do NOT diagnose new conditions.
3. If they ask about symptoms not covered by their prescriptions, advise them to contact their prescribing doctor or seek immediate medical attention.
4. Always add a small reminder that they should follow their doctor's precise guidelines.
`;
      }
    } catch (err) {
      contextPrompt = `You are the RxManager Assistant. Help the user with general questions.`;
    }

    if (isDemoMode) {
      return this._generateDemoResponse(user, message);
    }

    try {
      const systemInstructionModel = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: contextPrompt
      });

      const firstUserIndex = chatHistory.findIndex(h => h.sender === 'user');
      const filteredHistory = firstUserIndex !== -1 ? chatHistory.slice(firstUserIndex) : [];

      const chat = systemInstructionModel.startChat({
        history: filteredHistory.map(h => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        }))
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (err) {
      throw new Error('AI Service error: ' + err.message);
    }
  }

  _generateDemoResponse(user, message) {
    const msg = message.toLowerCase();
    const isDoctor = user.role === 'doctor';

    const demoDisclaimer = "\n\n*(Running in Demo Mode: Connect a GEMINI_API_KEY in server/.env to enable live AI responses)*";

    if (isDoctor) {
      if (msg.includes('hello') || msg.includes('hi')) {
        return `Hello Dr. ${user.name}. I am your Clinical Assistant. Since no API key is configured, I am running in Demo Mode. I can simulate help with patient history or medicine lookups!${demoDisclaimer}`;
      }
      if (msg.includes('patient') || msg.includes('roster')) {
        return `Sure! In a fully active setup, I can analyze your patient database. For example, I see you have treated patients. Let me know if you would like me to draft a prescription template for any patient.${demoDisclaimer}`;
      }
      if (msg.includes('prescription') || msg.includes('amoxicillin') || msg.includes('dosage')) {
        return `Here is a drafted recommendation for a standard infection treatment:
- **Medicine:** Amoxicillin
- **Dosage:** 500mg
- **Frequency:** 3 times a day (TDS)
- **Duration:** 5 days
- **Notes:** Take after meals. Complete the full course.

You can copy this template into the prescription creator form!${demoDisclaimer}`;
      }
      return `I received your query: "${message}". In a live setup with a Gemini API key, I will analyze patient records and write detailed summaries or formulate dosage recommendations here.${demoDisclaimer}`;
    } else {
      if (msg.includes('hello') || msg.includes('hi')) {
        return `Hello ${user.name}. I am your RxManager Patient Assistant. I can help explain your active medications and how to take them safely.${demoDisclaimer}`;
      }
      if (msg.includes('medicine') || msg.includes('pill') || msg.includes('explain') || msg.includes('prescription')) {
        return `Based on your prescription history, you have medicines prescribed by your doctor. 
Common instructions:
1. Always take antibiotics (like Amoxicillin) for the full duration specified.
2. If you experience mild nausea, try taking medications with food.
3. Consult your doctor immediately if you experience severe side effects like rashes or breathing difficulties.${demoDisclaimer}`;
      }
      return `I received your query: "${message}". Once a Gemini API key is configured, I will read your active prescriptions and answer side effect, dosage, or scheduling questions directly!${demoDisclaimer}`;
    }
  }
}

module.exports = new ChatService();
