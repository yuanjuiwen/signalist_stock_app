import { test } from 'node:test';
import { createRequire } from 'node:module';
const resolveModule = createRequire(import.meta.url);
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

function load(file, mocks = {}, env = {}) {
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, { exports, require: id => mocks[id] ?? resolveModule(id), process: { env }, console: { log() {}, error() {} }, Date });
    return exports;
}

function actions({ signup = async () => ({ user: { id: '1' } }), send = async () => {}, allowed = async () => true, signin = async () => 'signed-in' } = {}) {
    return load('lib/actions/auth.action.ts', {
        '@/lib/better-auth/auth': { auth: { api: { signUpEmail: signup, signInEmail: signin } } },
        '@/lib/inngest/client': { inngest: { send } },
        '@/lib/auth-rate-limit': { checkSignInLimits: allowed },
        'next/headers': { headers: async () => new Headers() },
    });
}

test('successful account survives welcome delivery failure; signup failure sends nothing', async () => {
    const result = await actions({ send: async () => { throw Error('offline'); } }).signUpWithEmail({});
    assert.equal(result.success, true);
    assert.equal(result.data.user.id, '1');
    let sent = false;
    const failure = await actions({ signup: async () => { throw Error('duplicate'); }, send: async () => { sent = true; } }).signUpWithEmail({});
    assert.equal(failure.success, false);
    assert.equal(sent, false);
});

test('sign-in stops before auth on limits or storage failure and forwards headers when allowed', async () => {
    let called = false;
    for (const allowed of [async () => false, async () => { throw Error('offline'); }]) {
        const result = await actions({ allowed, signin: async () => { called = true; } }).signInWithEmail({ email: 'a@b.test', password: 'secret' });
        assert.equal(result.success, false);
    }
    assert.equal(called, false);
    const result = await actions({ signin: async input => { assert.equal(input.headers instanceof Headers, true); return input.body.email; } }).signInWithEmail({ email: 'a@b.test', password: 'secret' });
    assert.equal(result.data, 'a@b.test');
});

function limiter(env = {}) {
    const counts = new Map();
    const collection = {
        createIndex: async () => {},
        findOneAndUpdate: async ({ _id }, update) => {
            assert.equal(update.$setOnInsert.expiresAt instanceof Date, true);
            const count = (counts.get(_id) ?? 0) + 1;
            counts.set(_id, count);
            return { count };
        },
    };
    return load('lib/auth-rate-limit.ts', { '@/database/mongoose': { connectToDatabase: async () => ({ connection: { db: { collection: () => collection } } }) } }, env).checkSignInLimits;
}

test('account limit normalizes identifiers and spans clients', async () => {
    const check = limiter({ VERCEL: '1' });
    for (let i = 1; i <= 11; i++) {
        assert.equal(await check(new Headers({ 'x-vercel-forwarded-for': `192.0.2.${i}` }), i % 2 ? ' A@B.TEST ' : 'a@b.test'), i <= 10);
    }
});

test('client limit spans accounts and ignores untrusted forwarded headers', async () => {
    const check = limiter();
    const results = await Promise.all(Array.from({ length: 31 }, (_, i) => check(new Headers({ 'x-forwarded-for': `192.0.2.${i}`, 'x-vercel-forwarded-for': `192.0.2.${i}` }), `${i}@b.test`)));
    assert.equal(results.filter(Boolean).length, 30);
});

test('welcome HTML escapes names, permits expected formatting, strips unsafe markup and preserves replacement literals', async () => {
    let mail;
    const { sendWelcomeEmail } = load('lib/nodemailer/index.ts', {
        nodemailer: { createTransport: () => ({ sendMail: async value => { mail = value; } }) },
        './templates': { WELCOME_EMAIL_TEMPLATE: '{{name}} | {{intro}}' },
    });
    await sendWelcomeEmail({ email: 'a@b.test', name: `<img src=x onerror=evil()> & " '$& {{intro}}`, intro: '<p class="mobile-text" style="color: #CCDADC; position: fixed" onclick="evil()">Hi <strong>friend</strong><script>evil()</script><img src=x></p>' });
    assert.ok(mail.html.includes('&lt;img'));
    assert.ok(mail.html.includes('$&amp; {{intro}}'));
    assert.ok(mail.html.includes('<strong>friend</strong>'));
    assert.ok(!mail.html.includes('<script'));
    assert.ok(!mail.html.includes('<img'));
    assert.ok(!mail.html.includes('onclick'));
    assert.ok(!mail.html.includes('position'));
});
