require("dotenv").config();
const { container, setup } = require("../../src/server/diContainer/DiContainer");
const data = require("../data/data");
setup();
jest.mock("../../src/database/repositories/Partner", () => () => false);
const partnerRepo = container.resolve("partnerRepo");
const partnerService = container.resolve("partnerService");
partnerRepo.create.mockResolvedValue(data);

describe("Tests the partner service", () => {
  beforeAll((done) => {
    done();
  });

  afterAll((done) => {
    //client.close();
    done();
  });

  test("should create a new partner and return the same", async () => {
    let result = await partnerService.create(data);
    expect(result).toBeTruthy();
  });
});
