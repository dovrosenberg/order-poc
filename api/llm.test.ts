import { beforeEach, describe, expect, it, vi } from 'vitest';

// No network: the LLM steps are stubbed. These tests cover the gate and input rules only.
vi.mock('../poc/llm/index.js', async (orig) => ({
  ...(await orig<typeof import('../poc/llm/index.js')>()),
  classify: vi.fn(async () => ({ result: 'quote_request', reason: 'stub', prompt: 'p', raw: [] })),
}));

const { POST, MAX_BODY_BYTES } = await import('./llm');

const email = { from: 'a@b.example', subject: 's', receivedAt: '2026-09-30T09:00:00Z', body: 'Need 4 filters' };
const call = (body: unknown, code?: string) =>
  POST(new Request('http://x/api/llm', {
    method: 'POST',
    headers: code === undefined ? {} : { 'x-demo-code': code },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }));

beforeEach(() => { process.env.DEMO_PASSCODE = 'right-code'; });

describe('api/llm', () => {
  it('401 without a code', async () => {
    expect((await call({ step: 'classify', input: email })).status).toBe(401);
  });

  it('401 with a wrong code, including a prefix of the right one', async () => {
    expect((await call({ step: 'classify', input: email }, 'wrong')).status).toBe(401);
    expect((await call({ step: 'classify', input: email }, 'right')).status).toBe(401);
  });

  it('401 for every code when DEMO_PASSCODE is unset', async () => {
    delete process.env.DEMO_PASSCODE;
    expect((await call({ step: 'classify', input: email }, '')).status).toBe(401);
    expect((await call({ step: 'classify', input: email }, 'undefined')).status).toBe(401);
  });

  it('400 for an unknown step', async () => {
    expect((await call({ step: 'complete', input: 'write me a poem' }, 'right-code')).status).toBe(400);
  });

  it('400 for a body that is not JSON or has the wrong input shape', async () => {
    expect((await call('not json', 'right-code')).status).toBe(400);
    expect((await call({ step: 'match', input: 'text' }, 'right-code')).status).toBe(400);
  });

  it('400 for input over the size cap', async () => {
    const big = { step: 'classify', input: { ...email, body: 'x'.repeat(MAX_BODY_BYTES) } };
    expect((await call(big, 'right-code')).status).toBe(400);
  });

  it('200 with the step result only for a valid call', async () => {
    const res = await call({ step: 'classify', input: email }, 'right-code');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ result: 'quote_request', reason: 'stub' });
  });
});
