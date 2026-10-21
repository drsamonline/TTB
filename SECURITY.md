# Security Policy

## Reporting

Do not publicly disclose an unpatched vulnerability. Report security-sensitive findings privately to the maintainer, **Dr. Sohil Momin**, or open a private security advisory on the repository. Include the affected version, file/module, reproduction steps, expected vs. actual behaviour, impact, and a safe proof of concept.

Never include credentials, tokens, or private data.

## Security principles

- Minimise Chrome permissions.
- Prefer browser-native APIs.
- Keep privileged APIs isolated.
- No remote code, ever.
- Validate user-controlled input.
- Do not claim an absent dependency is bundled.
- Gate destructive browser operations behind an explicit confirmation.

## Cryptography

Password generation and one-time passwords use the Web Crypto API. AES-GCM keys are derived with PBKDF2-HMAC-SHA-256 (210,000 iterations). The implementation avoids modulo bias by rejection sampling. None of this is a substitute for a dedicated password manager or hardware token — treat it as a convenience for everyday, non-critical use.

## Dependencies

Any third-party dependency added to the project must be reviewed for licensing, provenance, integrity, known vulnerabilities, MV3 compatibility and bundle-size impact before it is bundled. The current release bundles none.
