
import { UserInfo } from '@/types';

export const getStoredUserInfo = async (): Promise<UserInfo | null> => {
  try {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get stored user info:', error);
    return null;
  }
};

export const storeUserInfo = async (userInfo: UserInfo): Promise<void> => {
  try {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  } catch (error) {
    console.error('Failed to store user info:', error);
  }
};

export const clearStoredUserInfo = async (): Promise<void> => {
  try {
    localStorage.removeItem('userInfo');
  } catch (error) {
    console.error('Failed to clear stored user info:', error);
  }
};
