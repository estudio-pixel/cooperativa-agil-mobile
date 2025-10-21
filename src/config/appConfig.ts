export const CONFIG = {
  sourceUri: 'https://cooperativaagil.com.br/cooperado/dashboard',
  isDevelopment: true,
  get baseUrl() {
    return this.isDevelopment 
      ? 'http://localhost:3000' 
      : 'https://gm.estudiopixel.net';
  },
  geolocation: {
    enableHighAccuracy: false, // Mudado para false para ser mais rápido e tolerante
    timeout: 30000, // Aumentado para 30 segundos
    maximumAge: 60000, // Aumentado para 60 segundos para aceitar cache
  },
  notifications: {
    defaultTitle: 'Cooperativa Ágil',
    defaultBody: 'Nova mensagem disponível',
    displayDelay: 2000,
  },
};
