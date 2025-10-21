import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { CONFIG } from '../config/appConfig';

export interface AddressComponents {
  administrative_area_level_2?: string;
  administrative_area_level_1?: string;
  country?: string;
}

export interface LocationResponse {
  data: {
    address_components: AddressComponents;
  };
}

export interface LocationPermissionResult {
  granted: boolean;
  message?: string;
}

export const requestLocationPermission = async (): Promise<LocationPermissionResult> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return { granted: true };
      } else {
        return { 
          granted: false, 
          message: 'Permissão de localização negada. Você pode habilitá-la nas configurações do app.' 
        };
      }
    }
    
    return { granted: true };
    
  } catch (error) {
    return { 
      granted: false, 
      message: 'Erro inesperado ao solicitar permissão de localização' 
    };
  }
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        reject(error);
      },
      CONFIG.geolocation
    );
  });
};

export const getCurrentLocationWithPermission = async (): Promise<{ latitude: number; longitude: number }> => {
  const permissionResult = await requestLocationPermission();
  
  if (!permissionResult.granted) {
    const errorMessage = permissionResult.message || 'Permissão de localização negada';
    throw new Error(errorMessage);
  }
  
  if (Platform.OS === 'ios') {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const maxRetries = 3;
  const retryDelay = 2000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const location = await getCurrentLocation();
      return location;
      
    } catch (error: any) {
      if (attempt === maxRetries || error.code === 1) { // PERMISSION_DENIED = 1
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Não foi possível obter a localização após múltiplas tentativas');
};

export const sendLocationToBackend = async (
  latitude: number,
  longitude: number,
  token: string
): Promise<AddressComponents | null> => {
  try {
    const appVersion = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    
    const requestData = {
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      appVersion,
      buildNumber,
      platform: Platform.OS,
    };
    
    const response = await fetch(`${CONFIG.baseUrl}/api/geocoding/reverse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const data: LocationResponse = await response.json();
      console.log('Localização enviada com sucesso:', data);

      if (data.data && data.data.address_components) {
        return data.data.address_components;
      } else {
        console.warn('Componentes de endereço não encontrados na resposta do backend');
        return null;
      }
    } else {
      console.error('Erro ao enviar localização:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return null;
  }
};
