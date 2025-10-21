import { getAuth, signInAnonymously as signIn } from '@react-native-firebase/auth';

export const authenticateAnonymously = async (): Promise<string> => {
  try {
    const userCredential = await signIn(getAuth());
    const token = await userCredential.user.getIdToken();
    console.log('Login anônimo realizado com sucesso', token);
    return token;
  } catch (error) {
    console.error('Erro na autenticação:', error);
    throw error;
  }
};
