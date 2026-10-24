import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', '', 'docs', 'docs-json'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('name', 'file-converter-api');
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('/api/v1/kardex/catalogo (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/kardex/catalogo')
      .expect(200);

    expect(response.body).toHaveProperty('formato');
    expect(response.body.formato.pais).toBe('República Bolivariana de Venezuela');
    expect(response.body).toHaveProperty('turnos');
    expect(response.body).toHaveProperty('dietasHospitalarias');
  });

  it('/api/v1/kardex/diagnostico (POST)', async () => {
    const payload = {
      edad: 35,
      sexo: 'F',
      diagnosticoMedico: 'Apendicitis aguda postoperatoria',
      signosVitales: {
        temperatura: 38.8,
        escalaDolor: 8,
        tensionArterial: '130/80',
      },
      sintomasOProblemas: ['dolor agudo', 'fiebre'],
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/kardex/diagnostico')
      .send(payload)
      .expect(200);

    expect(response.body).toHaveProperty('diagnosticosEnfermeria');
    expect(response.body.diagnosticosEnfermeria.length).toBeGreaterThan(0);
    expect(response.body.alertasClinicas.length).toBeGreaterThan(0);
    expect(response.body.normativaAplicada).toContain('Venezuela');
  });

  it('/api/v1/kardex (POST)', async () => {
    const payload = {
      institucion: 'Hospital Universitario de Caracas',
      servicio: 'Cirugía General',
      cama: 'Cama 14',
      paciente: {
        nombres: 'María',
        apellidos: 'Rivas',
        historiaClinica: 'HC-8812',
        edad: 48,
        sexo: 'F',
        fechaIngreso: '2026-10-24',
        diagnosticoMedicoPrincipal: 'Apendicitis aguda',
        alergias: ['Penicilina'],
        tipoDieta: 'Líquida amplia',
        condicionMovilidad: 'Reposo relativo',
      },
      signosVitales: {
        escalaDolor: 7,
      },
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/kardex')
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.paciente.historiaClinica).toBe('HC-8812');
    expect(response.body.diagnosticosEnfermeria.length).toBeGreaterThan(0);
  });

  it('/api/v1/kardex/pdf (POST)', async () => {
    const payload = {
      institucion: 'Hospital Universitario de Caracas',
      servicio: 'Cirugía General',
      cama: 'Cama 14',
      paciente: {
        nombres: 'María',
        apellidos: 'Rivas',
        historiaClinica: 'HC-8812',
        edad: 48,
        sexo: 'F',
        fechaIngreso: '2026-10-24',
        diagnosticoMedicoPrincipal: 'Apendicitis aguda',
        alergias: ['Penicilina'],
        tipoDieta: 'Líquida amplia',
        condicionMovilidad: 'Reposo relativo',
      },
      signosVitales: {
        escalaDolor: 7,
      },
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/kardex/pdf')
      .send(payload)
      .expect(200);

    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain('attachment');
  });

  afterEach(async () => {
    await app.close();
  });
});
