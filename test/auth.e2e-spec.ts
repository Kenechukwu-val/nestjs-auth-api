import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { PrismaService } from '../src/prisma/prisma.service';

type SentMail =
  | {
      type: 'verification';
      email: string;
      token: string;
    }
  | {
      type: 'passwordReset';
      email: string;
      token: string;
    };

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const password = 'Password123';

describe('Auth flows (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let sentMail: SentMail[];
  let mailServiceMock: {
    sendVerificationEmail: jest.Mock;
    sendPasswordResetEmail: jest.Mock;
  };

  const testEmails = new Set<string>();

  const makeEmail = (label: string) => {
    const email = `${label}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}@example.com`;
    testEmails.add(email);
    return email;
  };

  const register = async (email = makeEmail('user')) => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    return response.body as {
      message: string;
      user: {
        id: string;
        email: string;
        emailVerified: boolean;
      };
    };
  };

  const latestVerificationToken = (email: string) => {
    const mail = sentMail
      .filter((entry) => entry.type === 'verification' && entry.email === email)
      .at(-1);

    if (!mail) {
      throw new Error(`No verification email sent to ${email}`);
    }

    return mail.token;
  };

  const latestPasswordResetToken = (email: string) => {
    const mail = sentMail
      .filter(
        (entry) => entry.type === 'passwordReset' && entry.email === email,
      )
      .at(-1);

    if (!mail) {
      throw new Error(`No password reset email sent to ${email}`);
    }

    return mail.token;
  };

  const verifyUser = async (email: string) => {
    const token = latestVerificationToken(email);

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token })
      .expect(201);
  };

  const login = async (email: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    return response.body as AuthTokens;
  };

  const setupSwagger = (nestApp: INestApplication) => {
    const config = new DocumentBuilder()
      .setTitle('NestJS Auth API')
      .setDescription(
        'Authentication API with JWT, refresh tokens, roles, and password reset',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('docs', nestApp, document);
  };

  beforeEach(async () => {
    sentMail = [];
    mailServiceMock = {
      sendVerificationEmail: jest.fn((email: string, token: string) => {
        sentMail.push({ type: 'verification', email, token });
        return Promise.resolve();
      }),
      sendPasswordResetEmail: jest.fn((email: string, token: string) => {
        sentMail.push({ type: 'passwordReset', email, token });
        return Promise.resolve();
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    if (testEmails.size > 0) {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [...testEmails],
          },
        },
      });

      testEmails.clear();
    }

    await prisma.$disconnect();
    await app.close();
  });

  it('allows a user to register successfully and sends a verification email', async () => {
    const email = makeEmail('register');

    const body = await register(email);

    expect(body.message).toContain('Registration successful');
    expect(body.user.email).toBe(email);
    expect(body.user.emailVerified).toBe(false);
    expect(mailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
      email,
      expect.any(String),
    );
    expect(latestVerificationToken(email)).toHaveLength(64);
  });

  it('rejects invalid and expired email verification tokens', async () => {
    const email = makeEmail('verify');
    const body = await register(email);

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: 'not-a-real-token' })
      .expect(400);

    const token = latestVerificationToken(email);

    await prisma.user.update({
      where: { id: body.user.id },
      data: { emailVerificationExpires: new Date(Date.now() - 1000) },
    });

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token })
      .expect(400);
  });

  it('blocks login for an unverified user and allows login after verification', async () => {
    const email = makeEmail('login');
    await register(email);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(401);

    await verifyUser(email);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const body = response.body as {
      accessToken: string;
      refreshToken: string;
      user: { email: string };
    };
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.refreshToken).toEqual(expect.any(String));
    expect(body.user.email).toBe(email);
  });

  it('sends a password reset email and prevents old reset token reuse', async () => {
    const email = makeEmail('reset');
    await register(email);

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email })
      .expect(201);

    expect(mailServiceMock.sendPasswordResetEmail).toHaveBeenCalledWith(
      email,
      expect.any(String),
    );

    const resetToken = latestPasswordResetToken(email);

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: resetToken, password: 'NewPassword123' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: resetToken, password: 'AnotherPassword123' })
      .expect(400);
  });

  it('rotates refresh tokens and rejects reused refresh tokens', async () => {
    const email = makeEmail('refresh');
    await register(email);
    await verifyUser(email);

    const firstTokens = await login(email);

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: firstTokens.refreshToken })
      .expect(201);

    const secondTokens = refreshResponse.body as AuthTokens;

    expect(secondTokens.accessToken).toEqual(expect.any(String));
    expect(secondTokens.refreshToken).toEqual(expect.any(String));
    expect(secondTokens.refreshToken).not.toBe(firstTokens.refreshToken);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: firstTokens.refreshToken })
      .expect(401);
  });

  it('invalidates the refresh token on logout', async () => {
    const email = makeEmail('logout');
    await register(email);
    await verifyUser(email);

    const tokens = await login(email);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(401);
  });

  it('rate limits repeated login and password reset attempts', async () => {
    const email = makeEmail('limited');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrong-password' })
        .expect(401);
    }

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(429);

    const resetEmail = makeEmail('limited-reset');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: resetEmail })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: resetEmail })
      .expect(429);
  });

  it('exposes all auth endpoints in Swagger', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);

    const body = response.body as { paths: Record<string, unknown> };
    expect(Object.keys(body.paths)).toEqual(
      expect.arrayContaining([
        '/auth/register',
        '/auth/login',
        '/auth/me',
        '/auth/admin',
        '/auth/refresh',
        '/auth/logout',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
        '/auth/resend-verification-email',
      ]),
    );
  });
});
