/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 * @jest-environment node
 */
import TestRunPage from "@/app/test-runs/[slug]/page";
import TestRunDetails from '@/components/runs/TestRunDetails';
import NotFound from '@/components/common/NotFound';
import { createAuthenticatedApiConfiguration } from '@/utils/api';
import { ResultArchiveStoreAPIApi } from '@/generated/galasaapi';
import ErrorPage from "@/app/error/page";

jest.mock('@/utils/api');
jest.mock('@/generated/galasaapi');

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "errorTitle": "Something went wrong!",
      "errorDescription": "Please report the problem to your Galasa Ecosystem administrator."
    };
    return translations[key] || key;
  }
}));

const mockGetById = jest.fn();
const mockGetArtifactList = jest.fn();
const mockGetLog = jest.fn();

beforeAll(() => {
  (createAuthenticatedApiConfiguration as jest.Mock).mockReturnValue({});
  (ResultArchiveStoreAPIApi as jest.Mock).mockImplementation(() => ({
    getRasRunById: mockGetById,
    getRasRunArtifactList: mockGetArtifactList,
    getRasRunLog: mockGetLog,
  }));
});

beforeEach(() => {
  mockGetById.mockReset();
  mockGetArtifactList.mockReset();
  mockGetLog.mockReset();
});

describe('TestRunPage', () => {
  it('renders <TestRunDetails> on successful fetch', async () => {
    const slug = 'run-123';
    const fakeDetails = { id: slug };
    const fakeArtifacts = [{ name: 'a1' }, { name: 'a2' }];
    const fakeLog = 'log content';

    mockGetById.mockResolvedValue(fakeDetails);
    mockGetArtifactList.mockResolvedValue(fakeArtifacts);
    mockGetLog.mockResolvedValue(fakeLog);

    const element = await TestRunPage({ params: { slug } });

    expect(element.type).toBe(TestRunDetails);
    expect(element.props.runId).toBe(slug);
    await expect(element.props.runDetailsPromise).resolves.toEqual(fakeDetails);
    await expect(element.props.runArtifactsPromise).resolves.toEqual(fakeArtifacts);
    await expect(element.props.runLogPromise).resolves.toEqual(fakeLog);
  });

  it('renders <NotFound> when API throws code 404', async () => {
    const slug = 'not-there';
    mockGetById.mockRejectedValue({ code: 404 });

    const element = await TestRunPage({ params: { slug } });

    expect(element.type).toBe(NotFound);
    expect(element.props).toMatchObject({
      title: 'Run not found',
      description: `Unable to find a run with id: ${slug}`,
    });
  });

  it('renders <ErrorPage> when API throws code 500', async () => {
    const slug = 'something-went-wrong';
    mockGetById.mockRejectedValue({ code: 500 });

    const element = await TestRunPage({ params: { slug } });

    expect(element.type).toBe(ErrorPage);
  });
});
