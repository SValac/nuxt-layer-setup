import { fakerES_MX as faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SERVICE_ROLE_KEY
);

const logErrorAndExit = (tableName, error) => {
	console.error(
		`An error occurred in table '${tableName}' with code ${error.code}: ${error.message}`
	);
	process.exit(1);
};

const logStep = (stepMessage) => {
	console.log(stepMessage);
};

const seedTrips = async (numEntries) => {
	const trips = [];

	for (let i = 0; i < numEntries; i++) {
		const name = faker.lorem.words(3);
		trips.push({
			name: name,
			description: faker.lorem.paragraph(),
			slug: faker.helpers.slugify(name),
			departure_date: faker.date.future(),
			arrival_date: faker.date.future(),
			guides: faker.helpers.arrayElements([1, 2, 3]),
			status: faker.helpers.arrayElement([
				'draft',
				'published',
				'on-going',
				'completed',
				'deleted'
			])
		});
	}

	const { data, error } = await supabase
		.from('trips')
		.insert(trips)
		.select('id');

	if (error) return logErrorAndExit('trips', error);
	logStep('Trips seed completed');
	return data;
};

const seedVehicles = async (tripsIds) => {
	const vehicles = [];

	for (let i = 0; i < 3; i++) {
		const name = faker.word.adjective() + ' ' + faker.word.noun();
		vehicles.push({
			name: name,
			type: faker.helpers.arrayElement(['van', 'bus']),
			brand: faker.vehicle.manufacturer(),
			image: faker.image.url(),
			description: faker.lorem.paragraph(),
			price: faker.number.int({ min: 15000, max: 50000 }),
			seats: faker.number.int({ min: 40, max: 50 }),
			driver: faker.helpers.arrayElements([
				faker.lorem.word(),
				faker.lorem.word(),
				faker.lorem.word()
			]),
			trips_id: faker.helpers.arrayElements(tripsIds, 2),
			// travelers: faker.helpers.arrayElements(travelersIds),
			available: faker.datatype.boolean()
		});
	}

	const { data, error } = await supabase
		.from('vehicles')
		.insert(vehicles)
		.select('id');
	if (error) return logErrorAndExit('vehicles', error);
	logStep('Vehicles seed completed');
	return data;
};

const seedAccommodations = async (tripsIds) => {
	const accommodations = [];
	tripsIds.forEach((tripId) => {
		for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
			accommodations.push({
				name: faker.lorem.words(3),
				trip_id: tripId,
				rooms: faker.number.int({ min: 20, max: 40 }),
				max_occupancy: faker.number.int({ min: 40, max: 70 }),
				description: faker.lorem.paragraph(),
				image: faker.image.url(),
				available: faker.datatype.boolean()
			});
		}
	});

	const { data, error } = await supabase
		.from('accommodations')
		.insert(accommodations)
		.select('id');
	if (error) return logErrorAndExit('accommodations', error);
	logStep('Accommodations seed completed');
	return data;
};

const seedTravelers = async (tripsIds, vehiclesIds) => {
	const travelers = [];

	for (let i = 1; i < 42; i++) {
		const first_name = faker.person.firstName();
		const last_name = faker.person.lastName();
		const full_name = `${first_name} ${last_name}`;
		const isPointOfContact = faker.datatype.boolean();
		const tripId = faker.helpers.arrayElements(tripsIds, 1);
		travelers.push({
			first_name: first_name,
			last_name: last_name,
			full_name: full_name,
			email: faker.internet.email({
				firstName: first_name,
				lastName: last_name
			}),
			phone: faker.phone.number(),
			is_point_of_contact: isPointOfContact,
			seat: faker.number.int({ min: 1, max: 40 }),
			point_of_contact: isPointOfContact
				? faker.number.int({ min: 1, max: i })
				: null,
			trip_id: tripId,
			vehicle_id: faker.helpers.arrayElement(vehiclesIds),
			companions: faker.helpers.arrayElements(
				tripsIds,
				faker.number.int({ min: 0, max: 2 })
			)
		});
	}

	const { data, error } = await supabase
		.from('travelers')
		.insert(travelers)
		.select('id');
	if (error) return logErrorAndExit('travelers', error);
	logStep('Travelers seed completed');
	return data;
};

const seedDatabase = async (numberOfTrips) => {
	const trips = (await seedTrips(numberOfTrips)).map((trip) => trip.id);
	const vehicles = (await seedVehicles(trips)).map((vehicle) => vehicle.id);
	const accommodations = (await seedAccommodations(trips)).map(
		(accommodation) => accommodation.id
	);
	const travelers = (await seedTravelers(trips, vehicles)).map(
		(traveler) => traveler.id
	);
};

const numberOfTrips = 10;
seedDatabase(numberOfTrips);
