# **App Name**: SuiOrg

## Core Features:

- zkLogin Authentication: Integrate Sui zkLogin with Google OAuth for user authentication.
- Member Registration: Allow users to register as members by connecting their zkLogin address, providing their name, program, and student number, and calling the register_member() function.
- Badge Verification: Enable users to verify their membership by connecting to verify_badge().
- Public Badge Checker: Allow public verification of badges using the badge ID and holder address by connecting to verify_badge().
- Admin Dashboard: Provide a secure admin dashboard accessible only to authorized zkLogin addresses (e.g., admin@university.edu).
- Member Management: Allow administrators to view, verify, and revoke memberships by connecting to the revoke_membership() and verify_badge() functions.
- Domain Whitelist Management: Allow administrators to add and remove whitelisted domains by calling the add_allowed_domain() and remove_allowed_domain() functions.

## Style Guidelines:

- Primary color: #00B894 – Mint green (main buttons, highlights)
- Secondary color: #1E272E – Charcoal black (text, navbar)
- Accent color: #55E6C1 – Light turquoise (hover, icons)
- Background color: #F5F5F5 – Soft off-white
- Success / Status Green: #2ECC71
- Body and headline font: 'Inter', a grotesque-style sans-serif for a modern and neutral look.
- Use minimalist icons from a set like Remix Icon or Feather icons, in the primary blue color.
- Use rounded cards and light shadows for a modern, friendly interface. Maintain a clean and consistent layout across all pages.
- Implement subtle loading animations and transitions for blockchain transactions and data fetching.