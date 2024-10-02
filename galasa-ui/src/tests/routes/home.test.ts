/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { GET } from "@/app/home/route";
import { ConfigurationPropertyStoreAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import { NextResponse } from "next/server";

// Mock the dependencies
jest.mock("@/generated/galasaapi");
jest.mock("@/utils/api");

describe("GET function", () => {

  let mockGetCpsProperty: jest.Mock<Promise<{ data: { value: string } }[]>, [string, string]>;

  beforeEach(() => {

    jest.clearAllMocks();

    mockGetCpsProperty = jest.fn();

    (ConfigurationPropertyStoreAPIApi as jest.Mock).mockImplementation(() => {
      return {
        getCpsProperty: mockGetCpsProperty,
      };
    });

    (createAuthenticatedApiConfiguration as jest.Mock).mockReturnValue({});
  });

  it("should return a 200 response with data when the API call is successful", async () => {

    const mockResponse = [
      { data: { value: "Mocked welcome markdown content" } }
    ];
    mockGetCpsProperty.mockResolvedValue(mockResponse);

    const result = await GET();

    expect(mockGetCpsProperty).toHaveBeenCalledWith("service", "welcome.markdown");
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(200);
    const bodyText = await result.text(); // Extract text from the response
    expect(bodyText).toBe("Mocked welcome markdown content");
  });
});
