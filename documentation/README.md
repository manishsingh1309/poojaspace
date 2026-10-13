# Poojaspace Antigravity Prompt Pack

This pack is meant to be attached to a Google Antigravity workspace before asking it to implement Poojaspace.

## Files

1. `POOJASPACE_ANTIGRAVITY_MASTER_PROMPT.md` — the main detailed instruction to build the real app end to end.
2. `POOJASPACE_IMPLEMENTATION_PLAN.md` — product goals, architecture, user journeys, risks, milestones and acceptance criteria.
3. `POOJASPACE_GOOGLE_SETUP_GUIDE.md` — Google Drive/Google OAuth, storage sharing, hosting and Android installation setup.
4. `POOJASPACE_QA_SECURITY_RELEASE_CHECKLIST.md` — QA, privacy, security, mobile share-sheet and release sign-off checklist.

## Suggested workflow

1. Create/open the project folder in Google Antigravity.
2. Attach all four Markdown files as context/knowledge.
3. Paste the **START HERE — EXECUTION INSTRUCTIONS** section at the top of the master prompt (or paste the whole master prompt).
4. Tell Antigravity to create its plan artifact first, save `docs/IMPLEMENTATION_PLAN.md`, and then continue implementation phase by phase. It should not stop after creating a plan.
5. Let it create the code and tests. Review its architecture and security choices before entering OAuth values.
6. Complete the Google setup guide only in your own Google Cloud/Google account. Keep client secrets and tokens out of chats and source control.
7. Test on the actual Oppo phone; browser simulation alone cannot prove the Share Target is available from the phone's Gallery app.

## Architecture summary

Poojaspace should be a mobile-first React/TypeScript PWA that stores actual user files in Pooja's own Google Drive. Google Drive's `drive.file` scope is preferred; the app should not read the user's entire Drive. The PWA's Android Share Target is the main quick-add enhancement; normal multi-file Quick add remains the fallback.

The app does not create 20–40 GB of storage. Capacity comes from the Google account's real available quota or from eligible storage already shared by the family plan. Confirm the user's exact plan and available storage before counting on a specific number.
