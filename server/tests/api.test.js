import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

describe('ShopSphere Full-Stack REST API Test Suite', () => {
  let customerToken = '';
  let adminToken = '';
  let testProductId = '';
  let testProductSlug = '';

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('1. Health & Status Check', () => {
    it('GET /api/v1/health should return 200 and operational status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('online');
      expect(res.body.data.database.connected).toBe(true);
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('POST /api/v1/auth/login should authenticate customer demo account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alex@example.com', password: 'Customer@123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alex@example.com');
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.token).toBeDefined();
      customerToken = res.body.data.token;
    });

    it('POST /api/v1/auth/login should authenticate admin demo account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@shopsphere.com', password: 'Admin@123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
      adminToken = res.body.data.token;
    });

    it('POST /api/v1/auth/login should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alex@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me should return current authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('alex@example.com');
    });

    it('GET /api/v1/auth/me should reject unauthorized requests without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Products, Catalog & Search', () => {
    it('GET /api/v1/products should retrieve paginated products from MongoDB', async () => {
      const res = await request(app).get('/api/v1/products?limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(40);

      testProductId = res.body.data.products[0]._id;
      testProductSlug = res.body.data.products[0].slug;
    });

    it('GET /api/v1/products/:slug should retrieve single product by slug with Product Passport', async () => {
      const res = await request(app).get(`/api/v1/products/${testProductSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.productPassport).toBeDefined();
      expect(res.body.data.product.productPassport.origin).toBeDefined();
    });

    it('GET /api/v1/products/search/suggestions should return matching items', async () => {
      const res = await request(app).get('/api/v1/products/search/suggestions?q=Aura');
      expect(res.status).toBe(200);
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/products/:id/price-history should return historical price points for PricePulse', async () => {
      const res = await request(app).get(`/api/v1/products/${testProductId}/price-history`);
      expect(res.status).toBe(200);
      expect(res.body.data.history).toBeDefined();
      expect(Array.isArray(res.body.data.history)).toBe(true);
    });
  });

  describe('4. Distinctive Features', () => {
    it('POST /api/v1/smart/smart-cart should calculate budget usage and savings alternatives', async () => {
      const res = await request(app)
        .post('/api/v1/smart/smart-cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ budget: 20000 });

      expect(res.status).toBe(200);
      expect(res.body.data.budget).toBe(20000);
      expect(res.body.data.budgetUsagePercent).toBeDefined();
    });

    it('POST /api/v1/smart/match-score should return transparent weighted compatibility scores', async () => {
      const res = await request(app)
        .post('/api/v1/smart/match-score')
        .send({
          budget: 25000,
          intendedUse: 'music-production',
          priority: 'performance'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.topMatches.length).toBeGreaterThan(0);
      expect(res.body.data.topMatches[0].matchPercentage).toBeGreaterThanOrEqual(25);
      expect(res.body.data.topMatches[0].reasons.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/smart/vibefind should return curated lifestyle products', async () => {
      const res = await request(app).get('/api/v1/smart/vibefind?vibe=work-setup');
      expect(res.status).toBe(200);
      expect(res.body.data.vibeInfo.title).toBe('Dream Desk & Work Setup');
      expect(res.body.data.products.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/smart/ownership-hub should list user purchased items with warranty tracking', async () => {
      const res = await request(app)
        .get('/api/v1/smart/ownership-hub')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalOwned).toBeGreaterThan(0);
      expect(res.body.data.ownedProducts[0].warranty.isActive).toBe(true);
    });
  });

  describe('5. Administration & Role Protection', () => {
    it('GET /api/v1/admin/analytics should be rejected for regular customer', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/v1/admin/analytics should succeed for authorized admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.kpis.totalOrders).toBeGreaterThan(0);
      expect(res.body.data.kpis.totalRevenue).toBeGreaterThan(0);
      expect(res.body.data.statusBreakdown).toBeDefined();
    });

    it('GET /api/v1/admin/inventory should list stock levels and low-stock items', async () => {
      const res = await request(app)
        .get('/api/v1/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThan(0);
    });
  });

  describe('6. AI Concierge & Semantic Product Discovery', () => {
    it('POST /api/v1/ai/chat should return policy reply for shipping questions', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .send({ message: 'What is your shipping policy and delivery time?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toContain('Free Standard Shipping');
    });

    it('POST /api/v1/ai/chat should recommend products matching budget constraint', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .send({ message: 'Show me desks under 25000' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toBeDefined();
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });
  });
});
