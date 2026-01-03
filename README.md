## Nestjs learning from

[youtube](https://www.youtube.com/watch?v=JDJ0zQLvpOA&list=PLhnVDNT5zYN_PfPXedWpMy_UTeYNExbfR&index=2)

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## following NestJs youtube [course](https://www.youtube.com/watch?v=D46R2cykFt0&t=1411s)

## install

```bash
npm i --save class-validator class-transformer
npm install --save @nestjs/typeorm typeorm pg
npm i @nestjs/mapped-types
npm i typeorm-extension @faker-js/faker
npm i @nestjs/config
npm i bcrypt
npm i -D @types/bcrypt
npm install --save @nestjs/passport passport passport-local
npm install --save-dev @types/passport-local
npm i @nestjs/jwt passport-jwt
npm i -D @types/passport-jwt
```

- generate JWT secret:

```bash
openssl rand -hex 32
```

## `Validation Pipe`

- in Controller (@Body())
- not allow non-DTO fields in the `body`

```ts
new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
```

- to differentiate application of the `ValidationPipe` set in the DTO, use `groups`

```ts
  @Length(2, 15, { groups: ['create'] })
  @Length(3, 15, { groups: ['update'] })
```

- set all other fields with

```ts
{
  always: true;
}
```

- may set ValidationPipe globally

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

- or in any Module in `providers`

```ts
providers: [
    {
      provide: 'APP_PIPE',
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
      }),
    },
  ],
```

- `ID Params Validation`
- create `dto/idparam.dto.ts`

```ts
import { IsInt, IsPositive } from 'class-validator';

export class IdParamDto {
  @IsInt()
  @IsPositive()
  id: number;
}
```

- then set in global (in module):

```ts
providers: [
    {
      provide: 'APP_PIPE',
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
  ],
```

## `Custom transformPipe`

- create file `property/pipes/parseIdPipe.ts
- mark as `@Injectable()` if used outside of module.

```ts
import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) throw new BadRequestException('id must be a number');
    if (val <= 0) throw new BadRequestException('id must be a positive number');
    return val;
  }
}
```

## `Custom Decorator for RequestHeaders`

- create file in dto/headres.dto.ts

```ts
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class HeadersDto {
  @IsString()
  @Expose({ name: 'access-token' })
  accessToken: string;
}
```

- create file in property/pipes/request-headers.ts

```ts
import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const RequestHeaders = createParamDecorator(
  async (targetDto: any, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().headers;

    const dto = plainToInstance(targetDto, headers, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dto;
  },
);
```

- in `property.controller.ts`

```ts
@Patch(':id')
  updateProperty(
    @Param('id', ParseIdPipe) id: number,
    @Body()
    updateProperty: CreatePropertyDto,
    @RequestHeaders(HeadersDto)
    header: HeadersDto,
  ) {
    return header;
  }
```

## `type ORM`

- install dependencies

```ts
npm install --save @nestjs/typeorm typeorm pg
```

- create `db-config.ts`

```ts
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

export const pgConfig: PostgresConnectionOptions = {
  url: 'add address',
  type: 'postgres',
  port: 3306,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};
```

- add to `app.module.ts` imports

```ts
TypeOrmModule.forRoot(pgConfig);
```

- add to `property.module.ts` imports:

```ts
TypeOrmModule.forFeature([Property]);
```

- create `src/entities/property.entity.ts

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  price: number;
}
```

- inject into service

```ts
 constructor(
    @InjectRepository(Property) private propertyRepo: Repository<Property>,
  ) {}
```

## `seeding` with `@faker-js/faker`

- import dependency
- create factories for entiies in `seeding` folder
- logic for seeding in [main.seeder.ts](src/seeding/main.seeder.ts)
- add `"seed": "ts-node src/seeding/seed.ts"` to package.json "scripts"
- [seed.ts](src/seeding/seed.ts) for startup seeding proces `npm run seed`

## `Manage Environment`

- install configuration module
- set imports in app.module.ts to

```ts
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [dbConfig, dbConfigProduction],// for loading configuration from factory function
    }),
    PropertyModule,
    TypeOrmModule.forRootAsync({
      useFactory:
        process.env.NODE_ENV === 'production' ? dbConfigProduction : dbConfig,
    }),
  ],
```

- may use expansion variables in `.env` now:

```ts
dbName=database
url=${dbName}.example.com
```

- redo db-config.ts in root to src/config/db.config.ts
- and src/config/db.config.production.ts (with `synchronize: false`,)
- create factory function instead
- delete previously created dbConfig in root
- chnage path for entities in factory function as config now in `src`
- import \* as path from "path" module for using path in factory function

```ts
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import * as path from 'path';

export default (): PostgresConnectionOptions => ({
  url: process.env.url,
  type: 'postgres',
  port: Number(process.env.port),
  entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'], //will match all entities in the entities folder
  synchronize: true,
});
```

## `Authentication`

```bash
nest g res user
```

## `Pagination`

- pass to findAll two params `skip` & `limit`, create DTO for that and set `DEFAULT_PAGE_SIZE` in constatnts

```ts
  async findAll(paginationDTO: PaginationDto) {
    return await this.propertyRepo.find({
      skip: paginationDTO.skip,
      take: paginationDTO.limit ?? DEFAULT_PAGE_SIZE,
    });
  }
    @Get()
  findAll(@Query() paginationDTO: PaginationDto) {
    return this.propertyService.findAll(paginationDTO);
  }
```

- `skip` from which record to fetch
- `limit` how many entries to display

## Hashing

- create `User` resource
- inject User repo to service:

```ts
constructor(@InjectRepository(User) private UserRepo: Repository<User>) {}
```

- clear user table as we're adding `password` column to it
- install bcrypt
- db has trigger before entering value, allowing to hash password

```ts
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
```

- important to create user first and then save it to DB in `service` with repositoryotherwise beforeInsert trigger won't work
