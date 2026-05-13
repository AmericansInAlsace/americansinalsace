import { describe, it, expect, vi } from 'vitest';
import { handleLogin } from '@/app/actions/auth';

describe('Integration: Auth Actions', () => {
  it('should return error if email or password missing', async () => {
    const fd = new FormData();
    fd.append('email', 'test@test.com');
    const res = await handleLogin(fd);
    expect(res.error).toBe('Email and password are required');
    
    const fd2 = new FormData();
    fd2.append('password', '123');
    const res2 = await handleLogin(fd2);
    expect(res2.error).toBe('Email and password are required');
  });

  it('should return email and password if both present', async () => {
    const fd = new FormData();
    fd.append('email', 'test@test.com');
    fd.append('password', '123');
    const res = await handleLogin(fd);
    expect(res.email).toBe('test@test.com');
    expect(res.password).toBe('123');
  });
});