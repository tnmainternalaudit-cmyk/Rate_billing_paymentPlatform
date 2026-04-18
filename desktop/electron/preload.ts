import { contextBridge } from 'electron';
import Store from 'electron-store';

const store = new Store();

contextBridge.exposeInMainWorld('secureStore', {
  setToken: (token: string) => store.set('jwtToken', token),
  getToken: () => (store.get('jwtToken') as string | undefined) || null,
});
