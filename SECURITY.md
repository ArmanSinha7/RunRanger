# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

RunRanger is built from the ground up with a **local-first and privacy-first** security model:

- No user GPS tracks or location points are permanently saved to any database.
- Coordinates received from the browser's Geolocation API are processed in-memory for route geometry calculations only.
- No personal user identifiers or activity records are transmitted to third-party commercial AI APIs or telemetry services.
- The application requires no cloud authentication, eliminating remote account hijacking vectors.

If you believe you have discovered a security issue (e.g. potential prompt injection leading to unsafe physical routes, unhandled input deserialization, or dependency vulnerabilities):

1. Please do not report security vulnerabilities through public GitHub issues.
2. Open a private security advisory on GitHub or email the maintainers directly.
3. We will acknowledge receipt of your vulnerability report within 48 hours and work with you to draft a patch and release.
