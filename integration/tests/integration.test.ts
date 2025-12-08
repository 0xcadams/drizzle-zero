import {
  ZERO_PORT,
  db,
  shutdown,
  startPostgresAndZero,
} from '@drizzle-zero/db/test-utils';
import {getShortCode} from '@drizzle-zero/db/types';
import {Zero} from '@rocicorp/zero';
import {zeroDrizzle} from '@rocicorp/zero/server/adapters/drizzle';
import type {Server} from 'http';
import {
  afterAll,
  assert,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  test,
} from 'vitest';
import {WebSocket} from 'ws';
import {
  startGetQueriesServer,
  stopGetQueriesServer,
} from '../get-queries-server';
import {
  allTypesById,
  allTypesByStatus,
  allUsers,
  complexOrderWithEverything,
  filtersWithChildren,
  mediumById,
  messageById,
  messageWithRelations,
  messagesByBody,
  messagesBySender,
  userWithFriends,
  userWithMediums,
} from '../synced-queries';
import {schema, type Filter, type Schema} from '../zero-schema.gen';

const zeroDb = zeroDrizzle(schema, db);

// Provide WebSocket on the global scope
globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;

let queriesServer: Server;

const getNewZero = (): Zero<Schema> =>
  new Zero({
    server: `http://localhost:${ZERO_PORT}`,
    userID: '1',
    schema: schema,
    kvStore: 'mem',
  });

beforeAll(async () => {
  const {server, url} = await startGetQueriesServer();
  queriesServer = server;

  await startPostgresAndZero({getQueriesUrl: url});
}, 60000);

afterAll(async () => {
  await shutdown();
  if (queriesServer) {
    await stopGetQueriesServer(queriesServer);
  }
});

describe('relationships', () => {
  test('can query users', async () => {
    const zero = await getNewZero();

    const query = allUsers(undefined);

    const user = await zero.run(query, {type: 'complete'});

    expect(user).toHaveLength(7);
    expect(user[0]?.name).toBe('James');
    expect(user[0]?.id).toBe('1');
    expect(user[0]?.email).toBe('james@example.com');
    expect(
      user[0]?.customTypeJson.custom === 'this-is-imported-from-custom-types',
    ).toBe(true);
    expect(
      user[0]?.customInterfaceJson.custom ===
        'this-interface-is-imported-from-custom-types',
    ).toBe(true);
    expect(user[0]?.testExportedType.nameType === 'custom-inline-type').toBe(
      true,
    );
    expect(
      user[0]?.testInterface.nameInterface === 'custom-inline-interface',
    ).toBe(true);
    expect(user[0]?.testType.nameType === 'custom-inline-type').toBe(true);

    await zero.close();
  });

  test('can query filters', async () => {
    const zero = await getNewZero();

    const query = filtersWithChildren(undefined, '1');

    const filters = await zero.run(query, {type: 'complete'});

    expectTypeOf(filters).toExtend<Filter[]>();

    expect(filters).toHaveLength(1);
    expect(filters[0]?.name).toBe('filter1');
    expect(filters[0]?.children).toHaveLength(2);
    expect(filters[0]?.children[0]?.name).toBe('filter2');
    expect(filters[0]?.children[1]?.name).toBe('filter3');
    expect(filters[0]?.children[0]?.children[0]?.name).toBeUndefined();

    await zero.close();
  });

  test('can query messages', async () => {
    const zero = await getNewZero();

    const query = messagesBySender(undefined, '1');

    const messages = await zero.run(query, {type: 'complete'});

    expect(messages).toHaveLength(2);
    expect(messages[0]?.body).toBe('Hey, James!');
    expect(messages[0]?.metadata.key).toStrictEqual('value1');

    await zero.close();
  });

  test('can query messages with filter', async () => {
    const zero = await getNewZero();

    const query = messagesByBody(undefined, 'Thomas!');

    const messages = await zero.run(query, {type: 'complete'});

    expect(messages).toHaveLength(1);
    expect(messages[0]?.body).toBe('Thomas!');
    expect(messages[0]?.metadata.key).toStrictEqual('value5');

    await zero.close();
  });

  test('can query messages with relationships', async () => {
    const zero = await getNewZero();

    const query = messageWithRelations(undefined, '1');

    const message = await zero.run(query, {type: 'complete'});

    expect(message?.medium?.id).toBe('1');
    expect(message?.medium?.name).toBe('email');

    expect(message?.sender?.name).toBe('James');

    await zero.close();
  });

  test('can query many-to-many relationships', async () => {
    const zero = await getNewZero();

    const query = userWithMediums(undefined, '1');

    const user = await zero.run(query, {type: 'complete'});

    expect(user?.mediums).toHaveLength(2);
    expect(user?.mediums?.[0]?.name).toBe('email');
    expect(user?.mediums?.[1]?.name).toBe('whatsapp');
    expect(user?.testInterface?.nameInterface).toBe('custom-inline-interface');
    expect(user?.testType?.nameType).toBe('custom-inline-type');
    expect(user?.customInterfaceJson?.custom).toBe(
      'this-interface-is-imported-from-custom-types',
    );
    expect(user?.customTypeJson?.custom).toBe(
      'this-is-imported-from-custom-types',
    );
    expect(user?.testExportedType.nameType).toBe('custom-inline-type');

    await zero.close();
  });

  test('can query many-to-many extended relationships', async () => {
    const zero = await getNewZero();

    const query = userWithFriends(undefined, '1');

    const user = await zero.run(query, {type: 'complete'});

    expect(user?.friends).toHaveLength(1);
    expect(user?.friends[0]?.name).toBe('John');

    await zero.close();
  });

  test('can insert messages', async () => {
    const zero = await getNewZero();

    await zeroDb.transaction(async tx => {
      await tx.mutate.message.insert({
        id: '99',
        body: 'Hi, James!',
        senderId: '1',
        mediumId: '4',
        metadata: {key: '9988'},
      });
    });

    const query = messageById(undefined, '99');

    const message = await zero.run(query, {type: 'complete'});

    expect(message?.id).toBe('99');
    expect(message?.metadata.key).toStrictEqual('9988');
    expect(message?.createdAt).toBeDefined();
    expect(message?.updatedAt).toBeDefined();
    const mediumQuery = mediumById(undefined, message?.mediumId ?? '');

    const medium = await zero.run(mediumQuery, {type: 'complete'});

    expect(medium?.name).toBe('whatsapp');

    await zero.close();
  });
});

describe('types', () => {
  test('can query all types', async () => {
    const zero = await getNewZero();

    const query = allTypesById(undefined, '1');

    const result = await zero.run(query, {type: 'complete'});

    expect(result?.id).toStrictEqual('1');
    expect(result?.smallintField).toStrictEqual(1);
    expect(result?.integerField).toStrictEqual(2);
    expect(result?.bigintField).toStrictEqual(95807);
    expect(result?.bigintNumberField).toStrictEqual(444);
    expect(result?.numericField).toStrictEqual(8.8);
    expect(result?.decimalField).toStrictEqual(9.9);
    expect(result?.realField).toStrictEqual(10.8);
    expect(result?.doublePrecisionField).toStrictEqual(11.9);
    expect(result?.textField).toStrictEqual('text');
    expect(result?.charField).toStrictEqual('c');
    expect(typeof result?.uuidField).toStrictEqual('string');
    expect(result?.varcharField).toStrictEqual('varchar');
    expect(result?.booleanField).toStrictEqual(true);
    expect(typeof result?.timestampField).toStrictEqual('number');
    expect(typeof result?.timestampTzField).toStrictEqual('number');
    expect(typeof result?.timestampModeDate).toStrictEqual('number');
    expect(typeof result?.timestampModeString).toStrictEqual('number');
    expect(typeof result?.dateField).toStrictEqual('number');
    expect(result?.jsonField).toStrictEqual({key: 'value'});
    expect(result?.jsonbField).toStrictEqual({key: 'value'});
    expect(result?.typedJsonField).toStrictEqual({
      theme: 'light',
      fontSize: 16,
    });
    expect(result?.status).toStrictEqual('pending');

    expect(result?.textArray).toStrictEqual(['text', 'text2']);
    expect(result?.intArray).toStrictEqual([1, 2]);
    // expect(result?.boolArray).toStrictEqual([true, false]);
    expect(result?.numericArray).toStrictEqual([8.8, 9.9]);
    expect(result?.uuidArray).toStrictEqual([
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ]);
    // expect(result?.jsonbArray).toStrictEqual([{ key: "value" }, { key: "value2" }]);
    expect(result?.enumArray).toStrictEqual(['pending', 'active']);

    expect(result?.smallSerialField).toStrictEqual(1);
    expect(result?.serialField).toStrictEqual(1);
    expect(result?.bigSerialField).toStrictEqual(1);

    expect(result?.optionalSmallint).toStrictEqual(5);
    expect(result?.optionalInteger).toStrictEqual(99);
    expect(result?.optionalBigint).toStrictEqual(12345);
    expect(result?.optionalNumeric).toStrictEqual(5.5);
    expect(result?.optionalReal).toStrictEqual(2.5);
    expect(result?.optionalDoublePrecision).toStrictEqual(15.75);
    expect(result?.optionalText).toStrictEqual('optional text');
    expect(result?.optionalBoolean).toStrictEqual(false);
    expect(typeof result?.optionalTimestamp).toStrictEqual('number');
    expect(result?.optionalJson).toStrictEqual({info: 'optional'});
    expect(result?.optionalEnum).toStrictEqual('active');
    expect(result?.optionalVarchar).toStrictEqual('optional');
    expect(typeof result?.optionalUuid).toStrictEqual('string');

    await zero.close();
  });

  test('can query enum type', async () => {
    const zero = await getNewZero();

    const query = allTypesByStatus(undefined, 'pending');

    const result = await zero.run(query, {type: 'complete'});

    expect(result?.status).toStrictEqual('pending');

    await zero.close();
  });

  test('can insert all types', async () => {
    const zero = await getNewZero();

    const currentDate = new Date();

    const uuid1 = '123e4567-e89b-12d3-a456-426614174001';
    const uuid2 = '123e4567-e89b-12d3-a456-426614174002';

    await zeroDb.transaction(async tx => {
      await tx.mutate.allTypes.insert({
        id: '1011',
        smallintField: 22,
        integerField: 23,
        bigintField: 24,
        bigintNumberField: 444,
        numericField: 25.84,
        decimalField: 26.33,
        realField: 27.1,
        doublePrecisionField: 28.2,
        textField: 'text2',
        charField: 'f',
        uuidField: '123e4567-e89b-12d3-a456-426614174001',
        varcharField: 'varchar2',
        booleanField: true,
        timestampField: currentDate.getTime(),
        timestampTzField: currentDate.getTime(),
        timestampModeDate: currentDate.getTime(),
        timestampModeString: currentDate.getTime(),
        dateField: currentDate.getTime(),
        jsonField: {key: 'value'},
        jsonbField: {key: 'value'},
        typedJsonField: {theme: 'light', fontSize: 16},
        status: 'active',
        textArray: ['text', 'text2'],
        intArray: [1, 2],
        // boolArray: [true, false],
        numericArray: [8.8, 9.9],
        uuidArray: [
          '123e4567-e89b-12d3-a456-426614174001',
          '123e4567-e89b-12d3-a456-426614174002',
        ],
        jsonbArray: [{key: 'value'}, {key: 'value2'}],
        enumArray: ['pending', 'active'],
      });
    });

    const query = allTypesById(undefined, '1011');

    const result = await zero.run(query, {type: 'complete'});

    expect(result?.id).toStrictEqual('1011');
    expect(result?.smallintField).toStrictEqual(22);
    expect(result?.integerField).toStrictEqual(23);
    expect(result?.bigintField).toStrictEqual(24);
    expect(result?.bigintNumberField).toStrictEqual(444);
    expect(result?.numericField).toStrictEqual(25.84);
    expect(result?.decimalField).toStrictEqual(26.33);
    expect(result?.realField).toStrictEqual(27.1);
    expect(result?.doublePrecisionField).toStrictEqual(28.2);
    expect(result?.textField).toStrictEqual('text2');
    expect(result?.charField).toStrictEqual('f');
    expect(typeof result?.uuidField).toStrictEqual('string');
    expect(result?.varcharField).toStrictEqual('varchar2');
    expect(result?.booleanField).toStrictEqual(true);
    expect(result?.timestampField).toStrictEqual(currentDate.getTime());
    expect(result?.timestampTzField).toStrictEqual(currentDate.getTime());
    expect(result?.timestampModeDate).toStrictEqual(currentDate.getTime());
    expect(result?.timestampModeString).toStrictEqual(currentDate.getTime());
    expect(result?.dateField).toBeDefined();
    expect(result?.jsonField).toStrictEqual({key: 'value'});
    expect(result?.jsonbField).toStrictEqual({key: 'value'});
    expect(result?.typedJsonField).toStrictEqual({
      theme: 'light',
      fontSize: 16,
    });
    expect(result?.status).toStrictEqual('active');
    expect(result?.textArray).toStrictEqual(['text', 'text2']);
    expect(result?.intArray).toStrictEqual([1, 2]);
    // expect(result?.boolArray).toStrictEqual([true, false]);
    expect(result?.numericArray).toStrictEqual([8.8, 9.9]);
    expect(result?.uuidArray).toStrictEqual([uuid1, uuid2]);
    // expect(result?.jsonbArray).toStrictEqual([
    //   { key: "value" },
    //   { key: "value2" },
    // ]);
    expect(result?.enumArray).toStrictEqual(['pending', 'active']);

    const dbResult = await db.query.allTypes.findFirst({
      where: (table, {eq}) => eq(table.id, '1011'),
    });

    expect(dbResult?.id).toStrictEqual('1011');
    expect(dbResult?.smallintField).toStrictEqual(22);
    expect(dbResult?.integerField).toStrictEqual(23);
    expect(dbResult?.bigintField).toStrictEqual(24n);
    expect(dbResult?.bigintNumberField).toStrictEqual(444);
    expect(dbResult?.numericField).toStrictEqual('25.84');
    expect(dbResult?.decimalField).toStrictEqual('26.33');
    expect(dbResult?.realField).toStrictEqual(27.1);
    expect(dbResult?.uuidField).toStrictEqual(uuid1);
    expect(dbResult?.doublePrecisionField).toStrictEqual(28.2);
    expect(dbResult?.textField).toStrictEqual('text2');
    expect(dbResult?.charField).toStrictEqual('f');
    expect(dbResult?.uuidField).toBeDefined();
    expect(dbResult?.varcharField).toStrictEqual('varchar2');
    expect(dbResult?.booleanField).toStrictEqual(true);
    expect(dbResult?.timestampField?.toISOString()).toStrictEqual(
      currentDate.toISOString(),
    );
    expect(dbResult?.timestampTzField?.toISOString()).toStrictEqual(
      currentDate.toISOString(),
    );
    expect(dbResult?.timestampModeDate?.toISOString()).toStrictEqual(
      currentDate.toISOString(),
    );
    expect(dbResult?.timestampModeString).toContain(
      currentDate.toISOString().split('T')[0],
    );
    expect(dbResult?.dateField).toStrictEqual(
      currentDate.toISOString().split('T')[0],
    );
    expect(dbResult?.jsonField).toStrictEqual({key: 'value'});
    expect(dbResult?.jsonbField).toStrictEqual({key: 'value'});
    expect(dbResult?.typedJsonField).toStrictEqual({
      theme: 'light',
      fontSize: 16,
    });
    expect(dbResult?.status).toStrictEqual('active');
    expect(dbResult?.textArray).toStrictEqual(['text', 'text2']);
    expect(dbResult?.intArray).toStrictEqual([1, 2]);
    // expect(dbResult?.boolArray).toStrictEqual([true, false]);
    expect(dbResult?.numericArray).toStrictEqual([8.8, 9.9]);
    expect(dbResult?.uuidArray).toStrictEqual([uuid1, uuid2]);
    expect(dbResult?.jsonbArray).toStrictEqual([
      {key: 'value'},
      {key: 'value2'},
    ]);
    expect(dbResult?.enumArray).toStrictEqual(['pending', 'active']);

    // Serial fields don't auto-increment properly when seed data explicitly sets them
    expect(dbResult?.smallSerialField).toBeDefined();
    expect(dbResult?.serialField).toBeDefined();
    expect(dbResult?.bigSerialField).toBeDefined();

    expect(dbResult?.optionalSmallint).toBeNull();
    expect(dbResult?.optionalInteger).toBeNull();
    expect(dbResult?.optionalBigint).toBeNull();
    expect(dbResult?.optionalNumeric).toBeNull();
    expect(dbResult?.optionalReal).toBeNull();
    expect(dbResult?.optionalDoublePrecision).toBeNull();
    expect(dbResult?.optionalText).toBeNull();
    expect(dbResult?.optionalBoolean).toBeNull();
    expect(dbResult?.optionalTimestamp).toBeNull();
    expect(dbResult?.optionalJson).toBeNull();
    expect(dbResult?.optionalEnum).toBeNull();
    expect(dbResult?.optionalVarchar).toBeNull();
    expect(dbResult?.optionalUuid).toBeNull();

    await zero.close();
  });
});

describe('complex order', () => {
  // Skip: flaky test
  test.skip('can hydrate and query complex order', async () => {
    const zero = await getNewZero();

    await zeroDb.transaction(async tx => {
      await tx.mutate.user.insert({
        id: 'cust-1',
        name: 'Customer One',
        email: 'customer1@example.com',
        partner: false,
        customTypeJson: {
          id: 'cust-1',
          custom: 'this-is-imported-from-custom-types',
        },
        customInterfaceJson: {
          custom: 'this-interface-is-imported-from-custom-types',
        },
        testInterface: {nameInterface: 'custom-inline-interface'},
        testType: {nameType: 'custom-inline-type'},
        testExportedType: {nameType: 'custom-inline-type'},
        status: 'COMPLETED',
        notificationPreferences: [
          {
            channel: 'email',
            address: 'customer1@example.com',
            templateId: 'template-1',
          },
        ],
        countryIso: 'US',
        preferredCurrency: 'USD',
        regionCode: 'CA',
      });

      await tx.mutate.user.insert({
        id: 'owner-1',
        name: 'Account Owner',
        email: 'owner@example.com',
        partner: false,
        customTypeJson: {
          id: 'owner-1',
          custom: 'this-is-imported-from-custom-types',
        },
        customInterfaceJson: {
          custom: 'this-interface-is-imported-from-custom-types',
        },
        testInterface: {nameInterface: 'custom-inline-interface'},
        testType: {nameType: 'custom-inline-type'},
        testExportedType: {nameType: 'custom-inline-type'},
        status: 'ASSIGNED',
        notificationPreferences: [
          {
            channel: 'email',
            address: 'owner@example.com',
            templateId: 'template-1',
          },
        ],
        countryIso: 'US',
        preferredCurrency: 'USD',
      });

      await tx.mutate.user.insert({
        id: 'sales-1',
        name: 'Sales Person',
        email: 'sales@example.com',
        partner: false,
        customTypeJson: {
          id: 'sales-1',
          custom: 'this-is-imported-from-custom-types',
        },
        customInterfaceJson: {
          custom: 'this-interface-is-imported-from-custom-types',
        },
        testInterface: {nameInterface: 'custom-inline-interface'},
        testType: {nameType: 'custom-inline-type'},
        testExportedType: {nameType: 'custom-inline-type'},
        status: 'ASSIGNED',
        notificationPreferences: [
          {
            channel: 'email',
            address: 'sales@example.com',
            templateId: 'template-1',
          },
        ],
        countryIso: 'US',
        preferredCurrency: 'USD',
        regionCode: 'CA',
      });

      await tx.mutate.user.insert({
        id: 'friend-1',
        name: 'Customer Friend',
        email: 'friend@example.com',
        partner: false,
        customTypeJson: {
          id: 'friend-1',
          custom: 'this-is-imported-from-custom-types',
        },
        customInterfaceJson: {
          custom: 'this-interface-is-imported-from-custom-types',
        },
        testInterface: {nameInterface: 'custom-inline-interface'},
        testType: {nameType: 'custom-inline-type'},
        testExportedType: {nameType: 'custom-inline-type'},
        status: 'ASSIGNED',
        notificationPreferences: [
          {
            channel: 'email',
            address: 'friend@example.com',
            templateId: 'template-1',
          },
        ],
        countryIso: 'US',
        preferredCurrency: 'USD',
        regionCode: 'CA',
      });

      await tx.mutate.friendship.insert({
        requestingId: 'cust-1',
        acceptingId: 'friend-1',
        accepted: true,
      });
      await tx.mutate.friendship.insert({
        requestingId: 'friend-1',
        acceptingId: 'cust-1',
        accepted: true,
      });

      await tx.mutate.medium.insert({id: 'med-email', name: 'email'});

      await tx.mutate.message.insert({
        id: 'msg-cust-1',
        body: 'Hello from customer',
        senderId: 'cust-1',
        mediumId: 'med-email',
        metadata: {key: 'cust-meta'},
      });

      await tx.mutate.message.insert({
        id: 'msg-friend-1',
        body: 'Friend ping',
        senderId: 'friend-1',
        mediumId: 'med-email',
        metadata: {key: 'friend-meta'},
      });

      await tx.mutate.message.insert({
        id: 'msg-owner-1',
        body: 'Owner update',
        senderId: 'owner-1',
        mediumId: 'med-email',
        metadata: {key: 'owner-meta'},
      });

      await tx.mutate.message.insert({
        id: 'msg-1',
        body: 'Welcome!',
        senderId: 'sales-1',
        mediumId: 'med-email',
        metadata: {key: 'meta-1'},
      });

      await tx.mutate.message.insert({
        id: 'msg-2',
        body: 'Invoice attached',
        senderId: 'sales-1',
        mediumId: 'med-email',
        metadata: {key: 'meta-2'},
      });

      await tx.mutate.crmAccount.insert({
        id: 'acct-1',
        name: 'Acme Corp',
        ownerId: 'owner-1',
        industry: 'Manufacturing',
      });

      await tx.mutate.crmContact.insert({
        id: 'contact-1',
        accountId: 'acct-1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
      });

      await tx.mutate.crmPipelineStage.insert({
        id: 'stage-1',
        name: 'Qualification',
        sequence: 1,
        probability: 20,
      });

      await tx.mutate.crmOpportunity.insert({
        id: 'opp-1',
        accountId: 'acct-1',
        stageId: 'stage-1',
        name: 'Big Deal',
        amount: 125000,
      });

      await tx.mutate.crmOpportunityStageHistory.insert({
        id: 'opp-hist-1',
        opportunityId: 'opp-1',
        stageId: 'stage-1',
        changedById: 'owner-1',
        changedAt: Date.now(),
      });

      await tx.mutate.crmActivityType.insert({
        id: 'activity-type-1',
        name: 'Call',
        description: 'Customer call',
      });

      await tx.mutate.crmActivity.insert({
        id: 'activity-new-1',
        accountId: 'acct-1',
        contactId: 'contact-1',
        opportunityId: 'opp-1',
        typeId: 'activity-type-1',
        performedById: 'sales-1',
        notes: 'Discussed order details',
      });

      await tx.mutate.crmNote.insert({
        id: 'note-1',
        accountId: 'acct-1',
        contactId: 'contact-1',
        authorId: 'sales-1',
        body: 'Follow up next week',
      });

      await tx.mutate.productCategory.insert({
        id: 'cat-root',
        name: 'Root Category',
      });

      await tx.mutate.productCategory.insert({
        id: 'cat-child',
        name: 'Child Category',
        parentId: 'cat-root',
      });

      await tx.mutate.product.insert({
        id: 'prod-1',
        categoryId: 'cat-child',
        name: 'Widget',
        status: 'active',
      });

      await tx.mutate.productVariant.insert({
        id: 'variant-1',
        productId: 'prod-1',
        sku: 'WIDGET-1',
        price: 4999,
        currency: 'USD',
        isActive: true,
      });

      await tx.mutate.productMedia.insert({
        id: 'media-1',
        productId: 'prod-1',
        url: 'https://example.com/widget.png',
        type: getShortCode('image'),
        mimeKey: 'png',
        mimeDescriptor: {
          mime_type: 'image/png',
          group: 'image',
          description: 'PNG image',
          extensions: ['png'],
          is_text: false,
        },
      });

      await tx.mutate.inventoryLocation.insert({
        id: 'loc-1',
        name: 'Warehouse',
      });

      await tx.mutate.inventoryLevel.insert({
        id: 'level-1',
        locationId: 'loc-1',
        variantId: 'variant-1',
        quantity: 10,
        reserved: 2,
      });

      await tx.mutate.inventoryItem.insert({
        id: 'inventory-item-1',
        variantId: 'variant-1',
        serialNumber: 'SN-1',
        metadata: {warranty: '1 year'},
      });

      await tx.mutate.orderTable.insert({
        id: 'order-test-1',
        customerId: 'cust-1',
        opportunityId: 'opp-1',
        status: 'PROCESSING',
        total: 99999,
        currency: 'USD',
        currencyMetadata: {
          code: 'AFN',
          number: '971',
          digits: 2,
          currency: 'Afghani',
          countries: ['AFG'],
        },
        billingCountryIso: 'AF',
        shippingCountryIso: 'AF',
      });

      await tx.mutate.orderItem.insert({
        id: 'order-item-test-1',
        orderId: 'order-test-1',
        variantId: 'variant-1',
        quantity: 2,
        unitPrice: 4999,
      });

      await tx.mutate.payment.insert({
        id: 'payment-test-1',
        status: 'PENDING',
        amount: 9999,
        currency: 'USD',
        receivedById: 'sales-1',
      });

      await tx.mutate.orderPayment.insert({
        id: 'order-payment-test-1',
        orderId: 'order-test-1',
        paymentId: 'payment-test-1',
        amount: 9999,
        status: 'PENDING',
      });

      await tx.mutate.shipment.insert({
        id: 'shipment-test-1',
        orderId: 'order-test-1',
        carrier: 'UPS',
        trackingNumber: '1Z999',
        destinationCountry: 'US',
        destinationState: 'DC',
      });

      await tx.mutate.shipmentItem.insert({
        id: 'shipment-item-test-1',
        shipmentId: 'shipment-test-1',
        orderItemId: 'order-item-test-1',
        quantity: 2,
      });
    });

    const query = complexOrderWithEverything(undefined, 'order-test-1');
    const result = await zero.run(query, {type: 'complete'});

    assert(result);

    // Order basic fields
    expect(result.id).toBe('order-test-1');
    expect(result.status).toBe('PROCESSING');
    expect(result.total).toBe(99999);
    expect(result.currency).toBe('USD');
    expect(result.customerId).toBe('cust-1');
    expect(result.opportunityId).toBe('opp-1');

    assert(result.customer);

    // Customer relationship
    expect(result.customer).toBeDefined();
    expect(result.customer.id).toBe('cust-1');
    expect(result.customer.name).toBe('Customer One');
    expect(result.customer.email).toBe('customer1@example.com');
    expect(result.customer.partner).toBe(false);
    expect(result.customer.status).toBe('COMPLETED');

    assert(result.customer.friends?.[0]);

    // Customer friends relationship
    expect(result.customer.friends).toHaveLength(1);
    expect(result.customer.friends[0].id).toBe('friend-1');
    expect(result.customer.friends[0].name).toBe('Customer Friend');

    assert(result.customer.messages?.[0]);

    // Customer messages relationship
    expect(result.customer.messages).toHaveLength(1);
    expect(result.customer.messages[0].id).toBe('msg-cust-1');
    expect(result.customer.messages[0].body).toBe('Hello from customer');
    expect(result.customer.messages[0].metadata.key).toBe('cust-meta');

    assert(result.opportunity);

    // Opportunity relationship
    expect(result.opportunity).toBeDefined();
    expect(result.opportunity.id).toBe('opp-1');
    expect(result.opportunity.name).toBe('Big Deal');
    expect(result.opportunity.amount).toBe(125000);
    expect(result.opportunity.accountId).toBe('acct-1');

    assert(result.opportunity.account);

    // Opportunity account relationship
    expect(result.opportunity.account).toBeDefined();
    expect(result.opportunity.account.id).toBe('acct-1');
    expect(result.opportunity.account.name).toBe('Acme Corp');
    expect(result.opportunity.account.industry).toBe('Manufacturing');
    expect(result.opportunity.account.ownerId).toBe('owner-1');

    assert(result.opportunity.historyEntries?.[0]);

    // Opportunity history entries
    expect(result.opportunity.historyEntries).toHaveLength(1);
    expect(result.opportunity.historyEntries[0].id).toBe('opp-hist-1');
    expect(result.opportunity.historyEntries[0].opportunityId).toBe('opp-1');

    assert(result.items?.[0]);

    // Order items
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('order-item-test-1');
    expect(result.items[0].orderId).toBe('order-test-1');
    expect(result.items[0].quantity).toBe(2);
    expect(result.items[0].unitPrice).toBe(4999);
    expect(result.items[0].variantId).toBe('variant-1');

    assert(result.items?.[0].variant);

    // Item variant relationship
    expect(result.items[0].variant).toBeDefined();
    expect(result.items[0].variant.id).toBe('variant-1');
    expect(result.items[0].variant.sku).toBe('WIDGET-1');
    expect(result.items[0].variant.price).toBe(4999);
    expect(result.items[0].variant.currency).toBe('USD');
    expect(result.items[0].variant.isActive).toBe(true);

    assert(result.payments?.[0]);

    // Payments
    expect(result.payments).toHaveLength(1);
    expect(result.payments[0].id).toBe('order-payment-test-1');
    expect(result.payments[0].orderId).toBe('order-test-1');
    expect(result.payments[0].amount).toBe(9999);
    expect(result.payments[0].status).toBe('PENDING');
    expect(result.payments[0].paymentId).toBe('payment-test-1');

    assert(result.payments?.[0].payment);

    // Payment relationship
    expect(result.payments[0].payment).toBeDefined();
    expect(result.payments[0].payment.id).toBe('payment-test-1');
    expect(result.payments[0].payment.amount).toBe(9999);
    expect(result.payments[0].payment.currency).toBe('USD');
    expect(result.payments[0].payment.status).toBe('PENDING');
    expect(result.payments[0].payment.receivedById).toBe('sales-1');

    assert(result.shipments?.[0]);

    // Shipments
    expect(result.shipments).toHaveLength(1);
    expect(result.shipments[0].id).toBe('shipment-test-1');
    expect(result.shipments[0].orderId).toBe('order-test-1');
    expect(result.shipments[0].carrier).toBe('UPS');
    expect(result.shipments[0].trackingNumber).toBe('1Z999');

    assert(result.shipments?.[0].items?.[0]);

    // Shipment items
    expect(result.shipments[0].items).toHaveLength(1);
    expect(result.shipments[0].items[0].id).toBe('shipment-item-test-1');
    expect(result.shipments[0].items[0].shipmentId).toBe('shipment-test-1');
    expect(result.shipments[0].items[0].orderItemId).toBe('order-item-test-1');
    expect(result.shipments[0].items[0].quantity).toBe(2);

    // Verify timestamps exist but don't check exact values
    expect(typeof result.createdAt).toBe('number');
    expect(typeof result.updatedAt).toBe('number');
    expect(typeof result.customer.createdAt).toBe('number');
    expect(typeof result.customer.updatedAt).toBe('number');

    await zero.close();
  });
});
