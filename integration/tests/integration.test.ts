import {
  ZERO_PORT,
  db,
  shutdown,
  startPostgresAndZero,
} from "@drizzle-zero/db/test-utils";
import { Zero } from "@rocicorp/zero";
import { zeroDrizzle } from "@rocicorp/zero/server/adapters/drizzle";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  test,
} from "vitest";
import { WebSocket } from "ws";
import {
  allTypesById,
  allTypesByStatus,
  allUsers,
  filtersWithChildren,
  mediumById,
  messageById,
  messageWithRelations,
  messagesByBody,
  messagesBySender,
  userWithFriends,
  userWithMediums,
  complexOrderWithEverything,
  // New workspace queries
  workspaceById,
  workspaceWithMembers,
  workspaceApiKeys,
  workspaceOverview,
  // New CRM queries
  crmLeadsByWorkspace,
  crmLeadWithActivities,
  crmSalesSequenceWithSteps,
  opportunityWithLineItems,
  // New HR queries
  hrEmployeesByDepartment,
  hrEmployeeWithTimeOff,
  hrDepartmentWithEmployees,
  hrPerformanceReviewsByEmployee,
  employeeFullProfile,
  // New Finance queries
  apInvoicesByVendor,
  arInvoicesByCustomer,
  bankAccountWithTransactions,
  bankTransactionsByAccount,
  customerFinancialSummary,
  // New Product/Inventory queries
  productCatalogWithCategories,
  supplierWithProducts,
  purchaseOrderWithDetails,
  // New Support/KB queries
  kbArticlesByCategory,
  kbArticleWithTags,
  supportTicketsByStatus,
  supportTicketWithResponses,
  // New Communication queries
  chatChannelWithMessages,
  chatMessagesByChannel,
} from "../synced-queries";
import { schema, type Filter, type Schema } from "../zero-schema.gen";
import {
  startGetQueriesServer,
  stopGetQueriesServer,
} from "../get-queries-server";
import type { Server } from "http";

const zeroDb = zeroDrizzle(schema, db as any);

// Provide WebSocket on the global scope
globalThis.WebSocket = WebSocket as any;

let queriesServer: Server;

const getNewZero = async (): Promise<Zero<Schema>> => {
  return new Zero({
    server: `http://localhost:${ZERO_PORT}`,
    userID: "1",
    schema: schema,
    kvStore: "mem",
  });
};

beforeAll(async () => {
  const { server, url } = await startGetQueriesServer();
  queriesServer = server;

  await startPostgresAndZero({ getQueriesUrl: url });
}, 60000);

afterAll(async () => {
  await shutdown();
  if (queriesServer) {
    await stopGetQueriesServer(queriesServer);
  }
});

describe("relationships", () => {
  test("can query users", async () => {
    const zero = await getNewZero();

    const query = allUsers(undefined);

    const user = await zero.run(query, { type: "complete" });

    expect(user).toHaveLength(7);
    expect(user[0]?.name).toBe("James");
    expect(user[0]?.id).toBe("1");
    expect(user[0]?.email).toBe("james@example.com");
    expect(
      user[0]?.customTypeJson.custom === "this-is-imported-from-custom-types",
    ).toBe(true);
    expect(
      user[0]?.customInterfaceJson.custom ===
        "this-interface-is-imported-from-custom-types",
    ).toBe(true);
    expect(user[0]?.testExportedType.nameType === "custom-inline-type").toBe(
      true,
    );
    expect(
      user[0]?.testInterface.nameInterface === "custom-inline-interface",
    ).toBe(true);
    expect(user[0]?.testType.nameType === "custom-inline-type").toBe(true);

    await zero.close();
  });

  test("can query filters", async () => {
    const zero = await getNewZero();

    const query = filtersWithChildren(undefined, "1");

    const filters = await zero.run(query, { type: "complete" });

    expectTypeOf(filters).toExtend<Filter[]>();

    expect(filters).toHaveLength(1);
    expect(filters[0]?.name).toBe("filter1");
    expect(filters[0]?.children).toHaveLength(2);
    expect(filters[0]?.children[0]?.name).toBe("filter2");
    expect(filters[0]?.children[1]?.name).toBe("filter3");
    expect(filters[0]?.children[0]?.children[0]?.name).toBeUndefined();

    await zero.close();
  });

  test("can query messages", async () => {
    const zero = await getNewZero();

    const query = messagesBySender(undefined, "1");

    const messages = await zero.run(query, { type: "complete" });

    expect(messages).toHaveLength(2);
    expect(messages[0]?.body).toBe("Hey, James!");
    expect(messages[0]?.metadata.key).toStrictEqual("value1");

    await zero.close();
  });

  test("can query messages with filter", async () => {
    const zero = await getNewZero();

    const query = messagesByBody(undefined, "Thomas!");

    const messages = await zero.run(query, { type: "complete" });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.body).toBe("Thomas!");
    expect(messages[0]?.metadata.key).toStrictEqual("value5");

    await zero.close();
  });

  test("can query messages with relationships", async () => {
    const zero = await getNewZero();

    const query = messageWithRelations(undefined, "1");

    const message = await zero.run(query, { type: "complete" });

    expect(message?.medium?.id).toBe("1");
    expect(message?.medium?.name).toBe("email");

    expect(message?.sender?.name).toBe("James");

    await zero.close();
  });

  test("can query many-to-many relationships", async () => {
    const zero = await getNewZero();

    const query = userWithMediums(undefined, "1");

    const user = await zero.run(query, { type: "complete" });

    expect(user?.mediums).toHaveLength(2);
    expect(user?.mediums?.[0]?.name).toBe("email");
    expect(user?.mediums?.[1]?.name).toBe("whatsapp");
    expect(user?.testInterface?.nameInterface).toBe("custom-inline-interface");
    expect(user?.testType?.nameType).toBe("custom-inline-type");
    expect(user?.customInterfaceJson?.custom).toBe(
      "this-interface-is-imported-from-custom-types",
    );
    expect(user?.customTypeJson?.custom).toBe(
      "this-is-imported-from-custom-types",
    );
    expect(user?.testExportedType.nameType).toBe("custom-inline-type");

    await zero.close();
  });

  test("can query many-to-many extended relationships", async () => {
    const zero = await getNewZero();

    const query = userWithFriends(undefined, "1");

    const user = await zero.run(query, { type: "complete" });

    expect(user?.friends).toHaveLength(1);
    expect(user?.friends[0]?.name).toBe("John");

    await zero.close();
  });

  test("can insert messages", async () => {
    const zero = await getNewZero();

    await zeroDb.transaction(async (tx) => {
      await tx.mutate.message.insert({
        id: "99",
        body: "Hi, James!",
        senderId: "1",
        mediumId: "4",
        metadata: { key: "9988" },
      });
    });

    const query = messageById(undefined, "99");

    const message = await zero.run(query, { type: "complete" });

    expect(message?.id).toBe("99");
    expect(message?.metadata.key).toStrictEqual("9988");
    expect(message?.createdAt).toBeDefined();
    expect(message?.updatedAt).toBeDefined();
    const mediumQuery = mediumById(undefined, message?.mediumId ?? "");

    const medium = await zero.run(mediumQuery, { type: "complete" });

    expect(medium?.name).toBe("whatsapp");

    await zero.close();
  });
});

describe("types", () => {
  test("can query all types", async () => {
    const zero = await getNewZero();

    const query = allTypesById(undefined, "1");

    const result = await zero.run(query, { type: "complete" });

    expect(result?.id).toStrictEqual("1");
    expect(result?.smallintField).toStrictEqual(1);
    expect(result?.integerField).toStrictEqual(2);
    expect(result?.bigintField).toStrictEqual(95807);
    expect(result?.bigintNumberField).toStrictEqual(444);
    expect(result?.numericField).toStrictEqual(8.8);
    expect(result?.decimalField).toStrictEqual(9.9);
    expect(result?.realField).toStrictEqual(10.8);
    expect(result?.doublePrecisionField).toStrictEqual(11.9);
    expect(result?.textField).toStrictEqual("text");
    expect(result?.charField).toStrictEqual("c");
    expect(typeof result?.uuidField).toStrictEqual("string");
    expect(result?.varcharField).toStrictEqual("varchar");
    expect(result?.booleanField).toStrictEqual(true);
    expect(typeof result?.timestampField).toStrictEqual("number");
    expect(typeof result?.timestampTzField).toStrictEqual("number");
    expect(typeof result?.timestampModeDate).toStrictEqual("number");
    expect(typeof result?.timestampModeString).toStrictEqual("number");
    expect(typeof result?.dateField).toStrictEqual("number");
    expect(result?.jsonField).toStrictEqual({ key: "value" });
    expect(result?.jsonbField).toStrictEqual({ key: "value" });
    expect(result?.typedJsonField).toStrictEqual({
      theme: "light",
      fontSize: 16,
    });
    expect(result?.status).toStrictEqual("pending");

    expect(result?.textArray).toStrictEqual(["text", "text2"]);
    expect(result?.intArray).toStrictEqual([1, 2]);
    // expect(result?.boolArray).toStrictEqual([true, false]);
    expect(result?.numericArray).toStrictEqual([8.8, 9.9]);
    expect(result?.uuidArray).toStrictEqual([
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174002",
    ]);
    // expect(result?.jsonbArray).toStrictEqual([{ key: "value" }, { key: "value2" }]);
    expect(result?.enumArray).toStrictEqual(["pending", "active"]);

    expect(result?.smallSerialField).toStrictEqual(1);
    expect(result?.serialField).toStrictEqual(1);
    expect(result?.bigSerialField).toStrictEqual(1);

    expect(result?.optionalSmallint).toStrictEqual(5);
    expect(result?.optionalInteger).toStrictEqual(99);
    expect(result?.optionalBigint).toStrictEqual(12345);
    expect(result?.optionalNumeric).toStrictEqual(5.5);
    expect(result?.optionalReal).toStrictEqual(2.5);
    expect(result?.optionalDoublePrecision).toStrictEqual(15.75);
    expect(result?.optionalText).toStrictEqual("optional text");
    expect(result?.optionalBoolean).toStrictEqual(false);
    expect(typeof result?.optionalTimestamp).toStrictEqual("number");
    expect(result?.optionalJson).toStrictEqual({ info: "optional" });
    expect(result?.optionalEnum).toStrictEqual("active");
    expect(result?.optionalVarchar).toStrictEqual("optional");
    expect(typeof result?.optionalUuid).toStrictEqual("string");

    await zero.close();
  });

  test("can query enum type", async () => {
    const zero = await getNewZero();

    const query = allTypesByStatus(undefined, "pending");

    const result = await zero.run(query, { type: "complete" });

    expect(result?.status).toStrictEqual("pending");

    await zero.close();
  });

  test("can insert all types", async () => {
    const zero = await getNewZero();

    const currentDate = new Date();

    const uuid1 = "123e4567-e89b-12d3-a456-426614174001";
    const uuid2 = "123e4567-e89b-12d3-a456-426614174002";

    await zeroDb.transaction(async (tx) => {
      await tx.mutate.allTypes.insert({
        id: "1011",
        smallintField: 22,
        integerField: 23,
        bigintField: 24,
        bigintNumberField: 444,
        numericField: 25.84,
        decimalField: 26.33,
        realField: 27.1,
        doublePrecisionField: 28.2,
        textField: "text2",
        charField: "f",
        uuidField: "123e4567-e89b-12d3-a456-426614174001",
        varcharField: "varchar2",
        booleanField: true,
        timestampField: currentDate.getTime(),
        timestampTzField: currentDate.getTime(),
        timestampModeDate: currentDate.getTime(),
        timestampModeString: currentDate.getTime(),
        dateField: currentDate.getTime(),
        jsonField: { key: "value" },
        jsonbField: { key: "value" },
        typedJsonField: { theme: "light", fontSize: 16 },
        status: "active",
        textArray: ["text", "text2"],
        intArray: [1, 2],
        // boolArray: [true, false],
        numericArray: [8.8, 9.9],
        uuidArray: [
          "123e4567-e89b-12d3-a456-426614174001",
          "123e4567-e89b-12d3-a456-426614174002",
        ],
        jsonbArray: [{ key: "value" }, { key: "value2" }],
        enumArray: ["pending", "active"],
      });
    });

    const query = allTypesById(undefined, "1011");

    const result = await zero.run(query, { type: "complete" });

    expect(result?.id).toStrictEqual("1011");
    expect(result?.smallintField).toStrictEqual(22);
    expect(result?.integerField).toStrictEqual(23);
    expect(result?.bigintField).toStrictEqual(24);
    expect(result?.bigintNumberField).toStrictEqual(444);
    expect(result?.numericField).toStrictEqual(25.84);
    expect(result?.decimalField).toStrictEqual(26.33);
    expect(result?.realField).toStrictEqual(27.1);
    expect(result?.doublePrecisionField).toStrictEqual(28.2);
    expect(result?.textField).toStrictEqual("text2");
    expect(result?.charField).toStrictEqual("f");
    expect(typeof result?.uuidField).toStrictEqual("string");
    expect(result?.varcharField).toStrictEqual("varchar2");
    expect(result?.booleanField).toStrictEqual(true);
    expect(result?.timestampField).toStrictEqual(currentDate.getTime());
    expect(result?.timestampTzField).toStrictEqual(currentDate.getTime());
    expect(result?.timestampModeDate).toStrictEqual(currentDate.getTime());
    expect(result?.timestampModeString).toStrictEqual(currentDate.getTime());
    expect(result?.dateField).toBeDefined();
    expect(result?.jsonField).toStrictEqual({ key: "value" });
    expect(result?.jsonbField).toStrictEqual({ key: "value" });
    expect(result?.typedJsonField).toStrictEqual({
      theme: "light",
      fontSize: 16,
    });
    expect(result?.status).toStrictEqual("active");
    expect(result?.textArray).toStrictEqual(["text", "text2"]);
    expect(result?.intArray).toStrictEqual([1, 2]);
    // expect(result?.boolArray).toStrictEqual([true, false]);
    expect(result?.numericArray).toStrictEqual([8.8, 9.9]);
    expect(result?.uuidArray).toStrictEqual([uuid1, uuid2]);
    // expect(result?.jsonbArray).toStrictEqual([
    //   { key: "value" },
    //   { key: "value2" },
    // ]);
    expect(result?.enumArray).toStrictEqual(["pending", "active"]);

    const dbResult = await db.query.allTypes.findFirst({
      where: (table, { eq }) => eq(table.id, "1011"),
    });

    expect(dbResult?.id).toStrictEqual("1011");
    expect(dbResult?.smallintField).toStrictEqual(22);
    expect(dbResult?.integerField).toStrictEqual(23);
    expect(dbResult?.bigintField).toStrictEqual(24n);
    expect(dbResult?.bigintNumberField).toStrictEqual(444);
    expect(dbResult?.numericField).toStrictEqual("25.84");
    expect(dbResult?.decimalField).toStrictEqual("26.33");
    expect(dbResult?.realField).toStrictEqual(27.1);
    expect(dbResult?.uuidField).toStrictEqual(uuid1);
    expect(dbResult?.doublePrecisionField).toStrictEqual(28.2);
    expect(dbResult?.textField).toStrictEqual("text2");
    expect(dbResult?.charField).toStrictEqual("f");
    expect(dbResult?.uuidField).toBeDefined();
    expect(dbResult?.varcharField).toStrictEqual("varchar2");
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
      currentDate.toISOString().split("T")[0],
    );
    expect(dbResult?.dateField).toStrictEqual(
      currentDate.toISOString().split("T")[0],
    );
    expect(dbResult?.jsonField).toStrictEqual({ key: "value" });
    expect(dbResult?.jsonbField).toStrictEqual({ key: "value" });
    expect(dbResult?.typedJsonField).toStrictEqual({
      theme: "light",
      fontSize: 16,
    });
    expect(dbResult?.status).toStrictEqual("active");
    expect(dbResult?.textArray).toStrictEqual(["text", "text2"]);
    expect(dbResult?.intArray).toStrictEqual([1, 2]);
    // expect(dbResult?.boolArray).toStrictEqual([true, false]);
    expect(dbResult?.numericArray).toStrictEqual([8.8, 9.9]);
    expect(dbResult?.uuidArray).toStrictEqual([uuid1, uuid2]);
    expect(dbResult?.jsonbArray).toStrictEqual([
      { key: "value" },
      { key: "value2" },
    ]);
    expect(dbResult?.enumArray).toStrictEqual(["pending", "active"]);

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

describe("complex order", () => {
  test("can hydrate and query complex order", async () => {
    const zero = await getNewZero();

    await zeroDb.transaction(async (tx) => {
      await tx.mutate.user.insert({
        id: "cust-1",
        name: "Customer One",
        email: "customer1@example.com",
        partner: false,
        customTypeJson: {
          id: "cust-1",
          custom: "this-is-imported-from-custom-types",
        },
        customInterfaceJson: {
          custom: "this-interface-is-imported-from-custom-types",
        },
        testInterface: { nameInterface: "custom-inline-interface" },
        testType: { nameType: "custom-inline-type" },
        testExportedType: { nameType: "custom-inline-type" },
        status: "COMPLETED",
      });

      await tx.mutate.user.insert({
        id: "owner-1",
        name: "Account Owner",
        email: "owner@example.com",
        partner: false,
        customTypeJson: {
          id: "owner-1",
          custom: "this-is-imported-from-custom-types",
        },
        customInterfaceJson: {
          custom: "this-interface-is-imported-from-custom-types",
        },
        testInterface: { nameInterface: "custom-inline-interface" },
        testType: { nameType: "custom-inline-type" },
        testExportedType: { nameType: "custom-inline-type" },
        status: "ASSIGNED",
      });

      await tx.mutate.user.insert({
        id: "sales-1",
        name: "Sales Person",
        email: "sales@example.com",
        partner: false,
        customTypeJson: {
          id: "sales-1",
          custom: "this-is-imported-from-custom-types",
        },
        customInterfaceJson: {
          custom: "this-interface-is-imported-from-custom-types",
        },
        testInterface: { nameInterface: "custom-inline-interface" },
        testType: { nameType: "custom-inline-type" },
        testExportedType: { nameType: "custom-inline-type" },
        status: "ASSIGNED",
      });

      await tx.mutate.user.insert({
        id: "friend-1",
        name: "Customer Friend",
        email: "friend@example.com",
        partner: false,
        customTypeJson: {
          id: "friend-1",
          custom: "this-is-imported-from-custom-types",
        },
        customInterfaceJson: {
          custom: "this-interface-is-imported-from-custom-types",
        },
        testInterface: { nameInterface: "custom-inline-interface" },
        testType: { nameType: "custom-inline-type" },
        testExportedType: { nameType: "custom-inline-type" },
        status: "ASSIGNED",
      });

      await tx.mutate.friendship.insert({
        requestingId: "cust-1",
        acceptingId: "friend-1",
        accepted: true,
      });
      await tx.mutate.friendship.insert({
        requestingId: "friend-1",
        acceptingId: "cust-1",
        accepted: true,
      });

      await tx.mutate.medium.insert({ id: "med-email", name: "email" });

      await tx.mutate.message.insert({
        id: "msg-cust-1",
        body: "Hello from customer",
        senderId: "cust-1",
        mediumId: "med-email",
        metadata: { key: "cust-meta" },
      });

      await tx.mutate.message.insert({
        id: "msg-friend-1",
        body: "Friend ping",
        senderId: "friend-1",
        mediumId: "med-email",
        metadata: { key: "friend-meta" },
      });

      await tx.mutate.message.insert({
        id: "msg-owner-1",
        body: "Owner update",
        senderId: "owner-1",
        mediumId: "med-email",
        metadata: { key: "owner-meta" },
      });

      await tx.mutate.message.insert({
        id: "msg-1",
        body: "Welcome!",
        senderId: "sales-1",
        mediumId: "med-email",
        metadata: { key: "meta-1" },
      });

      await tx.mutate.message.insert({
        id: "msg-2",
        body: "Invoice attached",
        senderId: "sales-1",
        mediumId: "med-email",
        metadata: { key: "meta-2" },
      });

      await tx.mutate.crmAccount.insert({
        id: "acct-1",
        name: "Acme Corp",
        ownerId: "owner-1",
        industry: "Manufacturing",
      });

      await tx.mutate.crmContact.insert({
        id: "contact-1",
        accountId: "acct-1",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
      });

      await tx.mutate.crmPipelineStage.insert({
        id: "stage-1",
        name: "Qualification",
        sequence: 1,
        probability: 20,
      });

      await tx.mutate.crmOpportunity.insert({
        id: "opp-1",
        accountId: "acct-1",
        stageId: "stage-1",
        name: "Big Deal",
        amount: 125000,
      });

      await tx.mutate.crmOpportunityStageHistory.insert({
        id: "opp-hist-1",
        opportunityId: "opp-1",
        stageId: "stage-1",
        changedById: "owner-1",
        changedAt: Date.now(),
      });

      await tx.mutate.crmActivityType.insert({
        id: "activity-type-1",
        name: "Call",
        description: "Customer call",
      });

      await tx.mutate.crmActivity.insert({
        id: "activity-new-1",
        accountId: "acct-1",
        contactId: "contact-1",
        opportunityId: "opp-1",
        typeId: "activity-type-1",
        performedById: "sales-1",
        notes: "Discussed order details",
      });

      await tx.mutate.crmNote.insert({
        id: "note-1",
        accountId: "acct-1",
        contactId: "contact-1",
        authorId: "sales-1",
        body: "Follow up next week",
      });

      await tx.mutate.productCategory.insert({
        id: "cat-root",
        name: "Root Category",
      });

      await tx.mutate.productCategory.insert({
        id: "cat-child",
        name: "Child Category",
        parentId: "cat-root",
      });

      await tx.mutate.product.insert({
        id: "prod-1",
        categoryId: "cat-child",
        name: "Widget",
        status: "active",
      });

      await tx.mutate.productVariant.insert({
        id: "variant-1",
        productId: "prod-1",
        sku: "WIDGET-1",
        price: 4999,
        currency: "USD",
        isActive: true,
      });

      await tx.mutate.productMedia.insert({
        id: "media-1",
        productId: "prod-1",
        url: "https://example.com/widget.png",
        type: "image",
      });

      await tx.mutate.inventoryLocation.insert({
        id: "loc-1",
        name: "Warehouse",
      });

      await tx.mutate.inventoryLevel.insert({
        id: "level-1",
        locationId: "loc-1",
        variantId: "variant-1",
        quantity: 10,
        reserved: 2,
      });

      await tx.mutate.inventoryItem.insert({
        id: "inventory-item-1",
        variantId: "variant-1",
        serialNumber: "SN-1",
        metadata: { warranty: "1 year" },
      });

      await tx.mutate.orderTable.insert({
        id: "order-test-1",
        customerId: "cust-1",
        opportunityId: "opp-1",
        status: "PROCESSING",
        total: 99999,
        currency: "USD",
      });

      await tx.mutate.orderItem.insert({
        id: "order-item-test-1",
        orderId: "order-test-1",
        variantId: "variant-1",
        quantity: 2,
        unitPrice: 4999,
      });

      await tx.mutate.payment.insert({
        id: "payment-test-1",
        status: "PENDING",
        amount: 9999,
        currency: "USD",
        receivedById: "sales-1",
      });

      await tx.mutate.orderPayment.insert({
        id: "order-payment-test-1",
        orderId: "order-test-1",
        paymentId: "payment-test-1",
        amount: 9999,
        status: "PENDING",
      });

      await tx.mutate.shipment.insert({
        id: "shipment-test-1",
        orderId: "order-test-1",
        carrier: "UPS",
        trackingNumber: "1Z999",
      });

      await tx.mutate.shipmentItem.insert({
        id: "shipment-item-test-1",
        shipmentId: "shipment-test-1",
        orderItemId: "order-item-test-1",
        quantity: 2,
      });
    });

    const query = complexOrderWithEverything(undefined, "order-test-1");
    const result = (await zero.run(query, { type: "complete" })) as any;

    // Order basic fields
    expect(result.id).toBe("order-test-1");
    expect(result.status).toBe("PROCESSING");
    expect(result.total).toBe(99999);
    expect(result.currency).toBe("USD");
    expect(result.customerId).toBe("cust-1");
    expect(result.opportunityId).toBe("opp-1");

    // Customer relationship
    expect(result.customer).toBeDefined();
    expect(result.customer.id).toBe("cust-1");
    expect(result.customer.name).toBe("Customer One");
    expect(result.customer.email).toBe("customer1@example.com");
    expect(result.customer.partner).toBe(false);
    expect(result.customer.status).toBe("COMPLETED");

    // Customer friends relationship
    expect(result.customer.friends).toHaveLength(1);
    expect(result.customer.friends[0].id).toBe("friend-1");
    expect(result.customer.friends[0].name).toBe("Customer Friend");

    // Customer messages relationship
    expect(result.customer.messages).toHaveLength(1);
    expect(result.customer.messages[0].id).toBe("msg-cust-1");
    expect(result.customer.messages[0].body).toBe("Hello from customer");
    expect(result.customer.messages[0].metadata.key).toBe("cust-meta");

    // Opportunity relationship
    expect(result.opportunity).toBeDefined();
    expect(result.opportunity.id).toBe("opp-1");
    expect(result.opportunity.name).toBe("Big Deal");
    expect(result.opportunity.amount).toBe(125000);
    expect(result.opportunity.accountId).toBe("acct-1");

    // Opportunity account relationship
    expect(result.opportunity.account).toBeDefined();
    expect(result.opportunity.account.id).toBe("acct-1");
    expect(result.opportunity.account.name).toBe("Acme Corp");
    expect(result.opportunity.account.industry).toBe("Manufacturing");
    expect(result.opportunity.account.ownerId).toBe("owner-1");

    // Opportunity history entries
    expect(result.opportunity.historyEntries).toHaveLength(1);
    expect(result.opportunity.historyEntries[0].id).toBe("opp-hist-1");
    expect(result.opportunity.historyEntries[0].opportunityId).toBe("opp-1");

    // Order items
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("order-item-test-1");
    expect(result.items[0].orderId).toBe("order-test-1");
    expect(result.items[0].quantity).toBe(2);
    expect(result.items[0].unitPrice).toBe(4999);
    expect(result.items[0].variantId).toBe("variant-1");

    // Item variant relationship
    expect(result.items[0].variant).toBeDefined();
    expect(result.items[0].variant.id).toBe("variant-1");
    expect(result.items[0].variant.sku).toBe("WIDGET-1");
    expect(result.items[0].variant.price).toBe(4999);
    expect(result.items[0].variant.currency).toBe("USD");
    expect(result.items[0].variant.isActive).toBe(true);

    // Payments
    expect(result.payments).toHaveLength(1);
    expect(result.payments[0].id).toBe("order-payment-test-1");
    expect(result.payments[0].orderId).toBe("order-test-1");
    expect(result.payments[0].amount).toBe(9999);
    expect(result.payments[0].status).toBe("PENDING");
    expect(result.payments[0].paymentId).toBe("payment-test-1");

    // Payment relationship
    expect(result.payments[0].payment).toBeDefined();
    expect(result.payments[0].payment.id).toBe("payment-test-1");
    expect(result.payments[0].payment.amount).toBe(9999);
    expect(result.payments[0].payment.currency).toBe("USD");
    expect(result.payments[0].payment.status).toBe("PENDING");
    expect(result.payments[0].payment.receivedById).toBe("sales-1");

    // Shipments
    expect(result.shipments).toHaveLength(1);
    expect(result.shipments[0].id).toBe("shipment-test-1");
    expect(result.shipments[0].orderId).toBe("order-test-1");
    expect(result.shipments[0].carrier).toBe("UPS");
    expect(result.shipments[0].trackingNumber).toBe("1Z999");

    // Shipment items
    expect(result.shipments[0].items).toHaveLength(1);
    expect(result.shipments[0].items[0].id).toBe("shipment-item-test-1");
    expect(result.shipments[0].items[0].shipmentId).toBe("shipment-test-1");
    expect(result.shipments[0].items[0].orderItemId).toBe("order-item-test-1");
    expect(result.shipments[0].items[0].quantity).toBe(2);

    // Verify timestamps exist but don't check exact values
    expect(typeof result.createdAt).toBe("number");
    expect(typeof result.updatedAt).toBe("number");
    expect(typeof result.customer.createdAt).toBe("number");
    expect(typeof result.customer.updatedAt).toBe("number");

    await zero.close();
  });

  // ============================================================================
  // NEW WORKSPACE & MULTI-TENANCY TESTS
  // ============================================================================

  test("can query workspace with members", async () => {
    const zero = await getNewZero();
    const query = workspaceWithMembers(undefined, "workspace_1");
    const workspace = await zero.run(query, { type: "complete" });

    expect(workspace).toBeDefined();
    expect(workspace?.id).toBe("workspace_1");
    expect(workspace?.name).toBe("Acme Corporation");
    expect(workspace?.slug).toBe("acme-corp");
    expect(workspace?.subscriptionTier).toBe("enterprise");
    expect(workspace?.memberships).toHaveLength(2);
    expect(workspace?.memberships[0]?.user).toBeDefined();

    await zero.close();
  });

  test("can query workspace API keys", async () => {
    const zero = await getNewZero();
    const query = workspaceApiKeys(undefined, "workspace_1");
    const apiKeys = await zero.run(query, { type: "complete" });

    expect(apiKeys).toHaveLength(1);
    expect(apiKeys[0]?.id).toBe("api_key_1");
    expect(apiKeys[0]?.name).toBe("Production API Key");
    expect(apiKeys[0]?.workspace).toBeDefined();
    expect(apiKeys[0]?.creator).toBeDefined();

    await zero.close();
  });

  // ============================================================================
  // NEW CRM EXPANSION TESTS
  // ============================================================================

  test("can query CRM leads by workspace", async () => {
    const zero = await getNewZero();
    const query = crmLeadsByWorkspace(undefined, "workspace_1");
    const leads = await zero.run(query, { type: "complete" });

    expect(leads).toHaveLength(2);
    expect(leads[0]?.firstName).toBeDefined();
    expect(leads[0]?.source).toBeDefined();
    expect(leads[0]?.owner).toBeDefined();

    await zero.close();
  });

  test("can query CRM lead with activities", async () => {
    const zero = await getNewZero();
    const query = crmLeadWithActivities(undefined, "lead_1");
    const lead = await zero.run(query, { type: "complete" });

    expect(lead).toBeDefined();
    expect(lead?.firstName).toBe("Alice");
    expect(lead?.email).toBe("alice@prospect.com");
    expect(lead?.activities).toHaveLength(1);
    expect(lead?.activities[0]?.activityType).toBe("email");
    expect(lead?.activities[0]?.user).toBeDefined();
    expect(lead?.source?.name).toBe("Website");

    await zero.close();
  });

  test("can query sales sequence with steps", async () => {
    const zero = await getNewZero();
    const query = crmSalesSequenceWithSteps(undefined, "seq_1");
    const sequence = await zero.run(query, { type: "complete" });

    expect(sequence).toBeDefined();
    expect(sequence?.name).toBe("Welcome Sequence");
    expect(sequence?.steps).toHaveLength(2);
    expect(sequence?.steps[0]?.stepOrder).toBe(1);
    expect(sequence?.steps[0]?.stepType).toBe("email");
    expect(sequence?.steps[1]?.stepOrder).toBe(2);

    await zero.close();
  });

  // ============================================================================
  // NEW HR TESTS
  // ============================================================================

  test("can query HR employees by department", async () => {
    const zero = await getNewZero();
    const query = hrEmployeesByDepartment(undefined, "dept_1");
    const employees = await zero.run(query, { type: "complete" });

    expect(employees).toHaveLength(1);
    expect(employees[0]?.employeeNumber).toBe("EMP001");
    expect(employees[0]?.firstName).toBe("James");
    expect(employees[0]?.department?.name).toBe("Engineering");
    expect(employees[0]?.user).toBeDefined();

    await zero.close();
  });

  test("can query HR employee with time off", async () => {
    const zero = await getNewZero();
    const query = hrEmployeeWithTimeOff(undefined, "emp_1");
    const employee = await zero.run(query, { type: "complete" });

    expect(employee).toBeDefined();
    expect(employee?.employeeNumber).toBe("EMP001");
    expect(employee?.timeOffRequests).toHaveLength(1);
    expect(employee?.timeOffRequests[0]?.status).toBe("approved");
    expect(employee?.timeOffRequests[0]?.policy?.name).toBe("Annual Leave");
    expect(employee?.department?.name).toBe("Engineering");

    await zero.close();
  });

  test("can query HR department with employees", async () => {
    const zero = await getNewZero();
    const query = hrDepartmentWithEmployees(undefined, "dept_1");
    const department = await zero.run(query, { type: "complete" });

    expect(department).toBeDefined();
    expect(department?.name).toBe("Engineering");
    expect(department?.employees).toHaveLength(1);
    expect(department?.employees[0]?.user).toBeDefined();

    await zero.close();
  });

  // ============================================================================
  // NEW FINANCE TESTS
  // ============================================================================

  test("can query AP invoices by vendor", async () => {
    const zero = await getNewZero();
    const query = apInvoicesByVendor(undefined, "vendor_1");
    const invoices = await zero.run(query, { type: "complete" });

    expect(invoices).toHaveLength(1);
    expect(invoices[0]?.invoiceNumber).toBe("INV-2024-001");
    expect(invoices[0]?.vendor?.name).toBe("Office Supplies Co");
    expect(invoices[0]?.status).toBe("paid");

    await zero.close();
  });

  test("can query AR invoices by customer", async () => {
    const zero = await getNewZero();
    const query = arInvoicesByCustomer(undefined, "customer_1");
    const invoices = await zero.run(query, { type: "complete" });

    expect(invoices).toHaveLength(1);
    expect(invoices[0]?.invoiceNumber).toBe("INV-OUT-2024-001");
    expect(invoices[0]?.customer?.name).toBe("Big Client Corp");
    expect(invoices[0]?.status).toBe("paid");

    await zero.close();
  });

  test("can query bank account with transactions", async () => {
    const zero = await getNewZero();
    const query = bankAccountWithTransactions(undefined, "bank_1");
    const account = await zero.run(query, { type: "complete" });

    expect(account).toBeDefined();
    expect(account?.accountName).toBe("Operating Account");
    expect(account?.transactions).toHaveLength(2);
    expect(account?.transactions[0]?.transactionType).toBeDefined();

    await zero.close();
  });

  // ============================================================================
  // NEW PRODUCT & INVENTORY TESTS
  // ============================================================================

  test("can query supplier with products and orders", async () => {
    const zero = await getNewZero();
    const query = supplierWithProducts(undefined, "supplier_1");
    const supplier = await zero.run(query, { type: "complete" });

    expect(supplier).toBeDefined();
    expect(supplier?.name).toBe("Widget Manufacturers");
    expect(supplier?.purchaseOrders).toHaveLength(1);
    expect(supplier?.purchaseOrders[0]?.orderNumber).toBe("PO-2024-001");

    await zero.close();
  });

  test("can query purchase order with details", async () => {
    const zero = await getNewZero();
    const query = purchaseOrderWithDetails(undefined, "po_1");
    const po = await zero.run(query, { type: "complete" });

    expect(po).toBeDefined();
    expect(po?.orderNumber).toBe("PO-2024-001");
    expect(po?.supplier?.name).toBe("Widget Manufacturers");
    expect(po?.status).toBe("received");

    await zero.close();
  });

  // ============================================================================
  // NEW SUPPORT & KB TESTS
  // ============================================================================

  test("can query KB articles by category", async () => {
    const zero = await getNewZero();
    const query = kbArticlesByCategory(undefined, "kb_cat_1");
    const articles = await zero.run(query, { type: "complete" });

    expect(articles).toHaveLength(1);
    expect(articles[0]?.title).toBe("How to Get Started");
    expect(articles[0]?.category?.name).toBe("Getting Started");
    expect(articles[0]?.author).toBeDefined();
    expect(articles[0]?.viewCount).toBe(150);

    await zero.close();
  });

  test("can query support ticket statuses", async () => {
    const zero = await getNewZero();
    const query = supportTicketsByStatus(undefined, "status_1");
    const tickets = await zero.run(query, { type: "complete" });

    expect(Array.isArray(tickets)).toBe(true);

    await zero.close();
  });

  // ============================================================================
  // NEW COMMUNICATION TESTS
  // ============================================================================

  test("can query chat channel with messages", async () => {
    const zero = await getNewZero();
    const query = chatChannelWithMessages(undefined, "channel_1");
    const channel = await zero.run(query, { type: "complete" });

    expect(channel).toBeDefined();
    expect(channel?.name).toBe("general");
    expect(channel?.messages).toHaveLength(2);
    expect(channel?.messages[0]?.content).toBe("Welcome to the team!");
    expect(channel?.messages[0]?.sender).toBeDefined();

    await zero.close();
  });

  test("can query chat messages by channel", async () => {
    const zero = await getNewZero();
    const query = chatMessagesByChannel(undefined, "channel_1");
    const messages = await zero.run(query, { type: "complete" });

    expect(messages).toHaveLength(2);
    expect(messages[0]?.content).toBe("Welcome to the team!");
    expect(messages[0]?.sender?.name).toBe("James");
    expect(messages[0]?.channel?.name).toBe("general");

    await zero.close();
  });

  // ============================================================================
  // COMPLEX CROSS-MODULE TESTS
  // ============================================================================

  test("can query workspace overview", async () => {
    const zero = await getNewZero();
    const query = workspaceOverview(undefined, "workspace_1");
    const workspace = await zero.run(query, { type: "complete" });

    expect(workspace).toBeDefined();
    expect(workspace?.name).toBe("Acme Corporation");
    expect(workspace?.memberships).toBeDefined();
    expect(workspace?.apiKeys).toBeDefined();

    await zero.close();
  });

  test("can query employee full profile", async () => {
    const zero = await getNewZero();
    const query = employeeFullProfile(undefined, "emp_1");
    const employee = await zero.run(query, { type: "complete" });

    expect(employee).toBeDefined();
    expect(employee?.employeeNumber).toBe("EMP001");
    expect(employee?.user).toBeDefined();
    expect(employee?.department?.name).toBe("Engineering");
    expect(employee?.timeOffRequests).toBeDefined();

    await zero.close();
  });

  test("can query customer financial summary", async () => {
    const zero = await getNewZero();
    const query = customerFinancialSummary(undefined, "customer_1");
    const customer = await zero.run(query, { type: "complete" });

    expect(customer).toBeDefined();
    expect(customer?.name).toBe("Big Client Corp");
    expect(customer?.invoices).toHaveLength(1);
    expect(customer?.invoices[0]?.invoiceNumber).toBe("INV-OUT-2024-001");

    await zero.close();
  });
});
