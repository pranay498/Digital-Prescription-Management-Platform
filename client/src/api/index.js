import axiosInstance from './axiosinstance';

export const authAPI = {
  register: (body) => axiosInstance.post('/auth/register', body),

  login: (body) => axiosInstance.post('/auth/login', body),

  logout: () => axiosInstance.post('/auth/logout'),

  me: () => axiosInstance.get('/auth/me'),

  updateProfile: (body) => axiosInstance.patch('/auth/profile', body),

  changePassword: (body) => axiosInstance.patch('/auth/password', body),

  deleteAccount: () => axiosInstance.delete('/auth/account'),
};

export const prescriptionAPI = {
  create: (body) => axiosInstance.post('/prescriptions', body),

  getDoctorPrescriptions: () => axiosInstance.get('/prescriptions/doctor'),

  getDoctorPatients: () => axiosInstance.get('/prescriptions/doctor/patients'),

  getDoctorMedicines: () => axiosInstance.get('/prescriptions/doctor/medicines'),

  getPatientPrescriptions: () => axiosInstance.get('/prescriptions/patient'),

  getById: (id) => axiosInstance.get(`/prescriptions/${id}`),

  update: (id, body) => axiosInstance.put(`/prescriptions/${id}`, body),

  updateStatus: (id, status) => axiosInstance.patch(`/prescriptions/${id}/status`, { status }),

  downloadPDF: async (id) => {
    const response = await axiosInstance.get(`/prescriptions/${id}/pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};