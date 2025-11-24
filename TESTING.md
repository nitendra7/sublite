# Testing Guide

## Overview

This document covers testing strategies and best practices for the application.

## Testing Stack

- **Backend**: Jest, Supertest
- **Frontend**: Vitest, React Testing Library
- **E2E**: Playwright (optional)

## Setup

### Backend Testing
```bash
cd backend
npm install --save-dev jest supertest
```

### Frontend Testing
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

## Running Tests

### Backend
```bash
cd backend
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage
```

### Frontend
```bash
cd frontend
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage
```

## Test Structure

### Backend Test Example
```javascript
// __tests__/auth.test.js
const request = require('supertest');
const app = require('../index');

describe('Authentication', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  test('should login existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
  });
});
```

### Frontend Test Example
```javascript
// __tests__/LoginForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginForm from '../components/LoginForm';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(handleSubmit).toHaveBeenCalled();
  });
});
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key workflows
- **E2E Tests**: Critical user paths

## Testing Checklist

### Authentication
- [ ] User registration
- [ ] User login
- [ ] Token validation
- [ ] Password reset
- [ ] Session management

### Bookings
- [ ] Create booking
- [ ] Update booking
- [ ] Cancel booking
- [ ] View bookings
- [ ] Booking validation

### Payments
- [ ] Process payment
- [ ] Payment validation
- [ ] Refund handling
- [ ] Payment history

### Services
- [ ] Create service
- [ ] Update service
- [ ] Delete service
- [ ] Search services
- [ ] Service availability

### Admin
- [ ] User management
- [ ] Analytics
- [ ] Permissions
- [ ] System monitoring

## Manual Testing Checklist

### User Flows
- [ ] Complete registration process
- [ ] Login and logout
- [ ] Browse services
- [ ] Make a booking
- [ ] Process payment
- [ ] Leave a review
- [ ] Update profile
- [ ] Contact support

### Admin Flows
- [ ] Access admin dashboard
- [ ] Manage users
- [ ] View analytics
- [ ] Configure settings
- [ ] Generate reports
- [ ] Handle support tickets

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Responsive Testing
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

## Performance Testing

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/services

# Using Artillery
artillery quick --count 10 --num 100 http://localhost:5000/api/services
```

### Metrics to Monitor
- Response time
- Throughput
- Error rate
- Memory usage
- CPU usage

## Security Testing

### Checklist
- [ ] SQL Injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication bypass attempts
- [ ] Authorization checks
- [ ] Rate limiting
- [ ] Input validation
- [ ] Secure headers

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

1. **Write tests first** (TDD approach)
2. **Keep tests isolated** and independent
3. **Use meaningful test names**
4. **Test edge cases** and error conditions
5. **Mock external dependencies**
6. **Maintain test data** separately
7. **Review test coverage** regularly
8. **Update tests** with code changes

## Debugging Tests

### Backend
```bash
# Run specific test file
npm test auth.test.js

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend
```bash
# Run specific test
npm test -- LoginForm.test.jsx

# UI mode
npm test -- --ui
```
