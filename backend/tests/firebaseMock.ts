const mockVerifyIdToken = jest.fn();

jest.mock("../src/config/firebase", () => ({
  auth: () => ({
    verifyIdToken: (token: string) => mockVerifyIdToken(token),
  }),
}));

export { mockVerifyIdToken };
