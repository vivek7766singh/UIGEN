Run a security audit on the UIGen codebase, apply fixes, and verify nothing is broken.

**Step 1** — Find vulnerable packages:
```bash
npm audit
```

**Step 2** — Apply available fixes:
```bash
npm audit fix
```

**Step 3** — Run the test suite to verify nothing broke:
```bash
npm test
```

If tests fail after `npm audit fix`, investigate whether the updated packages introduced breaking changes and report what was found.
