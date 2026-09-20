# Security Policy

## Reporting

Do not publicly disclose an unpatched security vulnerability.

Until a dedicated repository security contact is configured, report security-sensitive findings privately to the maintainer.

Include the affected version, file/module, reproduction steps, expected/actual behavior, impact, and safe proof of concept where applicable.

Never include credentials, tokens, or private data.

## Security principles

- Minimize Chrome permissions.
- Prefer browser-native APIs.
- Keep privileged APIs isolated.
- Avoid unnecessary network access.
- Do not add remote executable code.
- Validate user-controlled input.
- Do not claim absent dependencies are bundled.

## Dependencies

Any third-party dependency added to the project must be reviewed for licensing, provenance, integrity, known vulnerabilities, MV3 compatibility, and bundle-size impact.
