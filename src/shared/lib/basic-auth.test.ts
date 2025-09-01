import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { validateBasicAuth, createUnauthorizedResponse, requireBasicAuth } from './basic-auth';

describe('Basic Auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateBasicAuth', () => {
    test('should return true when auth is disabled', () => {
      process.env.BASIC_AUTH_ENABLED = 'false';
      const result = validateBasicAuth('Basic invalid');
      expect(result).toBe(true);
    });

    test('should return false for missing auth header', () => {
      process.env.BASIC_AUTH_ENABLED = 'true';
      process.env.BASIC_AUTH_USERNAME = 'admin';
      process.env.BASIC_AUTH_PASSWORD = 'password';
      
      const result = validateBasicAuth(null);
      expect(result).toBe(false);
    });

    test('should return false for non-Basic auth header', () => {
      process.env.BASIC_AUTH_ENABLED = 'true';
      process.env.BASIC_AUTH_USERNAME = 'admin';
      process.env.BASIC_AUTH_PASSWORD = 'password';
      
      const result = validateBasicAuth('Bearer token123');
      expect(result).toBe(false);
    });

    test('should return true for valid credentials', () => {
      process.env.BASIC_AUTH_ENABLED = 'true';
      process.env.BASIC_AUTH_USERNAME = 'admin';
      process.env.BASIC_AUTH_PASSWORD = 'password';
      
      const credentials = Buffer.from('admin:password').toString('base64');
      const result = validateBasicAuth(`Basic ${credentials}`);
      expect(result).toBe(true);
    });

    test('should return false for invalid credentials', () => {
      process.env.BASIC_AUTH_ENABLED = 'true';
      process.env.BASIC_AUTH_USERNAME = 'admin';
      process.env.BASIC_AUTH_PASSWORD = 'password';
      
      const credentials = Buffer.from('admin:wrongpassword').toString('base64');
      const result = validateBasicAuth(`Basic ${credentials}`);
      expect(result).toBe(false);
    });

    test('should return false for malformed base64', () => {
      process.env.BASIC_AUTH_ENABLED = 'true';
      process.env.BASIC_AUTH_USERNAME = 'admin';
      process.env.BASIC_AUTH_PASSWORD = 'password';
      
      const result = validateBasicAuth('Basic invalid-base64!');
      expect(result).toBe(false);
    });
  });

  describe('createUnauthorizedResponse', () => {
    test('should return 401 response with WWW-Authenticate header', () => {
      const response = createUnauthorizedResponse();
      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Copilot Proxy Admin"');
      expect(response.headers.get('Content-Type')).toBe('text/plain');
    });
  });

  describe('requireBasicAuth', () => {
    test('should return null when auth is disabled', () => {
      process.env.BASIC_AUTH_ENABLED = 'false';
      const request = new Request('http://localhost/admin', {
        headers: { Authorization: 'Basic invalid' }
      });
      
      const result = requireBasicAuth(request);
      expect(result).toBeNull();
    });

    test('should return 401 response for invalid auth', () => {
      process.env.BASIC_AUTH_ENABLED = 'true';
      process.env.BASIC_AUTH_USERNAME = 'admin';
      process.env.BASIC_AUTH_PASSWORD = 'password';
      
      const request = new Request('http://localhost/admin');
      const result = requireBasicAuth(request);
      
      expect(result).not.toBeNull();
      expect(result?.status).toBe(401);
    });

    test('should return null for valid auth', () => {
      process.env.BASIC_AUTH_ENABLED = 'true';
      process.env.BASIC_AUTH_USERNAME = 'admin';
      process.env.BASIC_AUTH_PASSWORD = 'password';
      
      const credentials = Buffer.from('admin:password').toString('base64');
      const request = new Request('http://localhost/admin', {
        headers: { Authorization: `Basic ${credentials}` }
      });
      
      const result = requireBasicAuth(request);
      expect(result).toBeNull();
    });
  });
});
