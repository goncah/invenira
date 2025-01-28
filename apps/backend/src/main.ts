import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MongoValidationErrorExceptionFilter } from './filters/mongo.validation.error.filter';
import { UnknownExceptionFilter } from './filters/unknown.exception.filter';
import { MongoServerErrorExceptionFilter } from './filters/mongo.server.error.filter';
import { logger } from './invenira.logger';
import { time, timeDiff } from './monotonic.clock';
import { BadRequestExceptionFilter } from './filters/bad.request.filter';
import { UnauthorizedExceptionFilter } from './filters/unauthorized.filter';

(async () => {
  const startUp = time();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: logger,
    },
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Inven!RA Backend API')
    .setVersion('0.0.1')
    .setContact(
      'Hugo Gonçalves',
      'https://hugogoncalves.pt',
      'email@hugogoncalves.pt',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalFilters(new UnknownExceptionFilter(httpAdapter));
  app.useGlobalFilters(new MongoServerErrorExceptionFilter(httpAdapter));
  app.useGlobalFilters(new MongoValidationErrorExceptionFilter(httpAdapter));
  app.useGlobalFilters(new BadRequestExceptionFilter(httpAdapter));
  app.useGlobalFilters(new UnauthorizedExceptionFilter(httpAdapter));

  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.addHook('onSend', async (req, reply) => {
    const { method, url, ip } = req;
    const userAgent = req.headers['user-agent'] || '';

    const statusCode = reply.statusCode;
    const contentLength = reply.getHeader('content-length');

    logger.debug(
      `${method} ${url} ${statusCode} ${contentLength || '-'} - ${userAgent} ${ip}`,
      'HttpAccessLog',
    );
  });

  await app
    .listen(process.env.PORT ?? 3000, '0.0.0.0')
    .then(() => logger.log(`Started in ${timeDiff(startUp)}ms`, 'Main'));
})();
