export const STATUS_BAR_CONFIG = {
  // Configurações para diferentes temas
  light: {
    barStyle: 'dark-content' as const,
    backgroundColor: '#ffffff',
  },
  dark: {
    barStyle: 'light-content' as const,
    backgroundColor: '#000000',
  },
  // Configuração padrão (pode ser alterada conforme necessário)
  default: {
    barStyle: 'dark-content' as const,
    backgroundColor: '#ffffff',
    translucent: false,
  },
} as const;
