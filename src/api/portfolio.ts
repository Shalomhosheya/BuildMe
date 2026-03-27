import { api } from './client';
export const portfolioApi = {
  get:         () => api.get('/api/portfolio'),
  certStatus:  () => api.get('/api/certificates/status'),
  issueCert:   () => api.post('/api/certificates/issue', {}),
  verifyCert:  (certId: string) => api.get(`/api/certificates/verify/${certId}`),
};