/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { handleDownload } from '@/utils/artifacts';

describe('handleDownload', () => {
  let clickMock: jest.Mock;

  beforeEach(() => {
    // Inject createObjectURL & revokeObjectURL as jest.fn()
    ;(URL as any).createObjectURL = jest.fn().mockReturnValue('blob:fake-url');
    ;(URL as any).revokeObjectURL = jest.fn();

    // Stub document.createElement('a') to return an object with our click spy
    clickMock = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: clickMock,
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tagName);
    });

    // Silence DOM mutations
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create an object URL, click the link, and revoke the URL', () => {
    handleDownload('hello', 'file.txt');

    // createObjectURL called once with a Blob
    expect((URL as any).createObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = (URL as any).createObjectURL.mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect((blobArg as Blob).size).toBe(5); // "hello".length

    expect(clickMock).toHaveBeenCalledTimes(1);

    expect((URL as any).revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});
