import { describe, it, expect, vi, beforeEach } from 'vitest';
import FirebaseAuthService from './FirebaseAuthService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@firebase-config';

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'TIMESTAMP')
}));

vi.mock('@firebase-config', () => ({
  auth: {},
  db: {}
}));

describe('FirebaseAuthService', () => {
  let authService;
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new FirebaseAuthService();
  });

  describe('signup', () => {
    it('should create a new user and update profile', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const displayName = 'Test User';
      
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      updateProfile.mockResolvedValue({});
      doc.mockReturnValue('mockDocRef');
      setDoc.mockResolvedValue({});
      serverTimestamp.mockReturnValue('TIMESTAMP');
      
      const result = await authService.signup(email, password, displayName);
      
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName });
      expect(doc).toHaveBeenCalledWith(db, 'users', mockUser.uid);
      expect(setDoc).toHaveBeenCalledWith('mockDocRef', expect.objectContaining({
        uid: mockUser.uid,
        email: mockUser.email,
        displayName,
        createdAt: 'TIMESTAMP',
        updatedAt: 'TIMESTAMP'
      }));
      expect(result).toEqual({
        success: true,
        user: {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName
        }
      });
    });
    
    it('should return error object if signup fails', async () => {
      const errorMessage = 'Auth error';
      createUserWithEmailAndPassword.mockRejectedValue(new Error(errorMessage));
      
      const result = await authService.signup('test@example.com', 'password', 'Test');
      
      expect(result).toEqual({
        success: false,
        error: 'Auth error'
      });
    });
  });
  
  describe('login', () => {
    it('should login user with email and password', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      signInWithEmailAndPassword.mockResolvedValue({});
      
      const result = await authService.login(email, password);
      
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
      expect(result).toEqual({ success: true });
    });
    
    it('should return error object if login fails', async () => {
      const errorMessage = 'Invalid credentials';
      signInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage));
      
      const result = await authService.login('test@example.com', 'wrong-password');
      
      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
    });
  });
  
  describe('logout', () => {
    it('should logout user', async () => {
      signOut.mockResolvedValue({});
      
      const result = await authService.logout();
      
      expect(signOut).toHaveBeenCalledWith(auth);
      expect(result).toEqual({ success: true });
    });
    
    it('should return error object if logout fails', async () => {
      const errorMessage = 'Logout error';
      signOut.mockRejectedValue(new Error(errorMessage));
      
      const result = await authService.logout();
      
      expect(result).toEqual({
        success: false,
        error: 'Logout error'
      });
    });
  });
  
  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const uid = 'user123';
      const userData = { displayName: 'Updated Name' };
      
      auth.currentUser = mockUser;
      updateProfile.mockResolvedValue({});
      doc.mockReturnValue('mockDocRef');
      setDoc.mockResolvedValue({});
      serverTimestamp.mockReturnValue('TIMESTAMP');
      
      const result = await authService.updateUserProfile(uid, userData);
      
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: userData.displayName });
      expect(doc).toHaveBeenCalledWith(db, 'users', uid);
      expect(setDoc).toHaveBeenCalledWith(
        'mockDocRef',
        { ...userData, updatedAt: 'TIMESTAMP' },
        { merge: true }
      );
      expect(result).toEqual({ success: true });
    });
    
    it('should return error object if update fails', async () => {
      const errorMessage = 'Update error';
      auth.currentUser = mockUser;
      doc.mockReturnValue('mockDocRef');
      setDoc.mockRejectedValue(new Error(errorMessage));
      
      const result = await authService.updateUserProfile('user123', { displayName: 'Test' });
      
      expect(result).toEqual({
        success: false,
        error: expect.any(String)
      });
    });
  });
  
  describe('onAuthStateChanged', () => {
    it('should register auth state change callback', () => {
      const callback = vi.fn();
      onAuthStateChanged.mockReturnValue(() => {});
      
      const unsubscribe = authService.onAuthStateChanged(callback);
      
      expect(onAuthStateChanged).toHaveBeenCalled();
      expect(onAuthStateChanged.mock.calls[0][0]).toBe(auth);
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
