import { faker } from '@faker-js/faker';
import { PropertyFeature } from '../entities/property-feature.entity';
import { PropertyType } from '../entities/property-type.entity';
import { Property } from '../entities/property.entity';
import { User } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    console.log('Seeding Property Types...');

    const typeRepository = dataSource.getTreeRepository(PropertyType);
    const propertyTypes = await typeRepository.save([
      { value: 'Condo' },
      { value: 'House' },
      { value: 'Apartment' },
    ]);
    const userFactory = factoryManager.get(User);

    console.log('Seeding Users...');
    const users = await userFactory.saveMany(10);

    const propertyFactory = factoryManager.get(Property);
    const propertyFeatureFactory = factoryManager.get(PropertyFeature);

    console.log('Seeding properties...');
    const properties = await Promise.all(
      Array(50)
        .fill('')
        .map(async () => {
          const property = await propertyFactory.make({
            user: faker.helpers.arrayElement(users),
            type: faker.helpers.arrayElement(propertyTypes),
            propertyFeature: await propertyFeatureFactory.save(),
          });
          return property;
        }),
    );
    const propertyRepository = dataSource.getRepository(Property);
    await propertyRepository.save(properties);
  }
}
