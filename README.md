# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

# Membership Badge Smart Contract

<div align="center">

![Sui Network](https://img.shields.io/badge/Sui-Network-blue)
![Move Language](https://img.shields.io/badge/Language-Move-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

**A decentralized membership system that issues NFT badges to verified members using zkLogin authentication**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Environment Setup](#-environment-setup)
- [Features](#-features)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
  - [Admin Operations](#admin-operations)
  - [Member Registration](#member-registration)
  - [Verification](#verification)
- [API Reference](#-api-reference)
- [Events](#-events)
- [Error Codes](#-error-codes)
- [Security](#-security)
- [Gas Estimates](#-gas-estimates)
- [Examples](#-examples)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The Membership Badge Smart Contract enables organizations to issue verifiable NFT badges to members who authenticate using their institutional email addresses through zkLogin. The system maintains privacy by storing only the email domain (e.g., `@university.edu`) without storing any personally identifiable information.

### Why Use This?

- ✅ **Privacy-Preserving**: Only stores email domain, not full email or personal data
- ✅ **Secure**: zkLogin verifies email ownership through OAuth
- ✅ **Decentralized**: No central database of member information
- ✅ **Scalable**: Self-service registration for thousands of members
- ✅ **Verifiable**: Anyone can verify badge authenticity
- ✅ **Revocable**: Admins can revoke badges when needed

### Use Cases

- 🎓 **Universities**: Student membership badges
- 🏢 **Organizations**: Employee verification
- 🎫 **Events**: Attendee credentials
- 💳 **Memberships**: Exclusive access control
- 🏛️ **DAOs**: Community membership proof

---

## 🔧 Environment Setup

Before running the application, you need to set up your environment variables. Create a file named `.env.local` in the root of your project and add the following content.

You will need to get a **Google Client ID** and generate a **zkLogin Salt**.

```env
# Google OAuth (from your Google Cloud project)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"

# zkLogin Configuration (generate a random salt)
# You can generate one with: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
NEXT_PUBLIC_ZKLOGIN_SALT="your_random_salt_here"

# Sui Network Configuration
NEXT_PUBLIC_REDIRECT_URI="http://localhost:9002/auth/callback"
NEXT_PUBLIC_SUI_NETWORK="testnet"

# Sui Smart Contract Details (from your deployment)
NEXT_PUBLIC_PACKAGE_ID="0x647474de5fd49990644a5bc3cb8ae1792ebb489ba85a42d848812fe91c433967"
NEXT_PUBLIC_ADMIN_CAP_ID="0x25f76f11e9c3ccf1bd7cf5daf3ae01dd936a7c1fd6388cbfcd13dc25c0c15bb0"
NEXT_PUBLIC_REGISTRY_ID="0x1aff4634dc9178e151cfc4181edcb9654c78ef3fc5816e9cbd74c80de663046d"

# Admin Wallet for server-side transactions (store this securely!)
# This should be the Base64 representation of your admin keypair's secret key.
SERVER_PRIVATE_KEY="your_admin_private_key_in_base64"

# zkLogin Prover Service URL
ZKLOGIN_PROVER_URL="https://prover-dev.mystenlabs.com/v1"
```

**IMPORTANT**: Add `.env.local` to your `.gitignore` file to ensure you don't commit secrets.

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **zkLogin Integration** | Members authenticate with Google OAuth using institutional email |
| **NFT Badges** | Each member receives a unique, non-transferable badge NFT |
| **Domain Whitelisting** | Admins control which email domains can register |
| **Self-Service Registration** | Members can register themselves after authentication |
| **Admin Registration** | Optional admin-controlled registration workflow |
| **Badge Verification** | Public verification of badge authenticity |
| **Membership Revocation** | Admins can revoke access when needed |

### Privacy Features

- 🔒 **Email Domain Only**: Stores `@university.edu`, not `john.doe@university.edu`
- 🔒 **No PII**: Name, student number, and personal data never stored on-chain
- 🔒 **zkLogin Privacy**: Email remains private, only domain is public

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│                 MembershipBadge                 │
│              (NFT owned by member)              │
├─────────────────────────────────────────────────┤
│  • email_domain: "@university.edu"              │
│  • organization: "University Name"              │
│  • issued_at: timestamp                         │
│  • holder_address: 0x789...                     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                 BadgeRegistry                   │
│                (Shared Object)                  │
├─────────────────────────────────────────────────┤
│  • verified_addresses: address → badge_id       │
│  • allowed_domains: domain → bool               │
│  • admin: address                               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                   AdminCap                      │
│              (Admin Capability)                 │
├─────────────────────────────────────────────────┤
│  • Grants admin permissions                     │
│  • Required for privileged operations           │
└─────────────────────────────────────────────────┘
```

### Data Structures

#### MembershipBadge

```move
struct MembershipBadge has key, store {
    id: UID,
    email_domain: String,      // "@university.edu"
    organization: String,       // "University Name"
    issued_at: u64,            // Timestamp
    holder_address: address,    // zkLogin address
}
```

#### BadgeRegistry

```move
struct BadgeRegistry has key {
    id: UID,
    verified_addresses: Table<address, address>,  // member → badge_id
    allowed_domains: Table<String, bool>,         // domain → allowed
    admin: address,
}
```

---

## 📦 Installation

### Prerequisites

- [Sui CLI](https://docs.sui.io/build/install) installed
- Sui wallet configured
- Testnet or mainnet SUI for gas fees

### Deploy Contract

1. **Clone the repository**

```bash
git clone https://github.com/your-org/membership-badge
cd membership-badge
```

2. **Build the contract**

```bash
sui move build
```

3. **Deploy to network**

```bash
# Deploy to testnet
sui client publish --gas-budget 100000000

# Deploy to mainnet
sui client publish --gas-budget 100000000 --network mainnet
```

4. **Save the output**

After deployment, save these values:

```bash
# Example output
Package ID: 0x123abc...
AdminCap ID: 0x456def...
Registry ID: 0x789ghi...
```

---

## 🚀 Quick Start

### For Admins

**Step 1: Whitelist email domains**

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module membership_badge \
  --function add_allowed_domain \
  --args <ADMIN_CAP_ID> <REGISTRY_ID> "@university.edu" \
  --gas-budget 10000000
```

**Step 2: Monitor registrations**

```bash
# Check if domain is allowed
sui client call \
  --package <PACKAGE_ID> \
  --module membership_badge \
  --function is_domain_allowed \
  --args <REGISTRY_ID> "@university.edu"
```

### For Members

**Step 1: Authenticate with zkLogin**

```typescript
import { useZkLogin } from '@mysten/zklogin-sdk';

// In your React app
const { login } = useZkLogin();
await login({ provider: 'google' });
```

**Step 2: Register**

```typescript
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::membership_badge::register_member`,
  arguments: [
    tx.object(REGISTRY_ID),
    tx.pure("@university.edu"),
    tx.pure("University Name"),
  ],
});

const result = await signAndExecuteTransactionBlock({ transactionBlock: tx });
```

**Step 3: Done! 🎉**

Your membership badge NFT is now in your wallet.

---

## 📖 Usage

### Admin Operations

#### Add Allowed Domain

Whitelist an email domain to allow registrations.

<details>
<summary><b>View Code</b></summary>

**CLI:**
```bash
sui client call \
  --function add_allowed_domain \
  --args <ADMIN_CAP> <REGISTRY> "@university.edu" \
  --gas-budget 10000000
```

**TypeScript:**
```typescript
const tx = new TransactionBlock();
tx.moveCall({
  target: `${packageId}::membership_badge::add_allowed_domain`,
  arguments: [
    tx.object(adminCapId),
    tx.object(registryId),
    tx.pure("@university.edu"),
  ],
});
```
</details>

#### Remove Allowed Domain

Remove a domain from the whitelist.

<details>
<summary><b>View Code</b></summary>

```bash
sui client call \
  --function remove_allowed_domain \
  --args <ADMIN_CAP> <REGISTRY> "@oldschool.edu" \
  --gas-budget 10000000
```
</details>

#### Revoke Membership

Revoke a member's badge.

<details>
<summary><b>View Code</b></summary>

```bash
sui client call \
  --function revoke_membership \
  --args <ADMIN_CAP> <REGISTRY> <MEMBER_ADDRESS> \
  --gas-budget 10000000
```
</details>

### Member Registration

#### Self-Service Registration

Members register themselves after zkLogin authentication.

<details>
<summary><b>View Code</b></summary>

**TypeScript:**
```typescript
import { TransactionBlock } from '@mysten/sui.js/transactions';

async function registerMember() {
  const tx = new TransactionBlock();
  
  tx.moveCall({
    target: `${packageId}::membership_badge::register_member`,
    arguments: [
      tx.object(registryId),
      tx.pure("@university.edu"),
      tx.pure("University Name"),
    ],
  });
  
  const result = await walletKit.signAndExecuteTransactionBlock({
    transactionBlock: tx,
  });
  
  console.log("Registration successful:", result.digest);
}
```

**React Component:**
```tsx
function RegisterButton() {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  
  async function handleRegister() {
    try {
      await registerMember();
      alert("✅ Badge issued successfully!");
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  }
  
  return (
    <button onClick={handleRegister}>
      Register & Get Badge
    </button>
  );
}
```
</details>

#### Admin-Controlled Registration

Admin registers members manually.

<details>
<summary><b>View Code</b></summary>

```typescript
const tx = new TransactionBlock();
tx.moveCall({
  target: `${packageId}::membership_badge::register_member_admin`,
  arguments: [
    tx.object(adminCapId),
    tx.object(registryId),
    tx.pure(memberAddress),
    tx.pure("@university.edu"),
    tx.pure("University Name"),
  ],
});
```
</details>

### Verification

#### Verify Badge

Check if a badge is valid.

<details>
<summary><b>View Code</b></summary>

```typescript
async function verifyBadge(badgeId: string, holderAddress: string) {
  const tx = new TransactionBlock();
  
  tx.moveCall({
    target: `${packageId}::membership_badge::verify_badge`,
    arguments: [
      tx.object(badgeId),
      tx.object(registryId),
      tx.pure(holderAddress),
    ],
  });
  
  const result = await client.devInspectTransactionBlock({
    transactionBlock: tx,
    sender: holderAddress,
  });
  
  // Parse boolean result
  const isValid = result.results[0].returnValues[0][0] === 1;
  return isValid;
}
```
</details>

#### Check Member Status

Check if an address is registered.

<details>
<summary><b>View Code</b></summary>

```typescript
const isRegistered = await isMemberRegistered(registryId, memberAddress);
console.log(`Member registered: ${isRegistered}`);
```
</details>

---

## 📚 API Reference

### Admin Functions

| Function | Description | Auth Required |
|----------|-------------|---------------|
| `add_allowed_domain` | Whitelist an email domain | ✅ AdminCap |
| `remove_allowed_domain` | Remove domain from whitelist | ✅ AdminCap |
| `revoke_membership` | Revoke a member's badge | ✅ AdminCap |
| `register_member_admin` | Admin registers a member | ✅ AdminCap |

### Public Functions

| Function | Description | Auth Required |
|----------|-------------|---------------|
| `register_member` | Member self-registration | ❌ None |
| `verify_badge` | Verify badge validity | ❌ None |
| `verify_and_emit` | Verify and emit event | ❌ None |

### Getter Functions (Read-Only)

| Function | Returns | Description |
|----------|---------|-------------|
| `get_email_domain` | `String` | Get badge email domain |
| `get_organization` | `String` | Get badge organization |
| `get_issued_at` | `u64` | Get issuance timestamp |
| `get_holder_address` | `address` | Get holder's address |
| `is_member_registered` | `bool` | Check if address is registered |
| `is_domain_allowed` | `bool` | Check if domain is whitelisted |
| `get_member_badge_id` | `address` | Get badge ID for address |

### Detailed Function Signatures

<details>
<summary><b>add_allowed_domain</b></summary>

```move
public entry fun add_allowed_domain(
    _admin_cap: &AdminCap,
    registry: &mut BadgeRegistry,
    domain: vector<u8>,
    _ctx: &mut TxContext
)
```

**Parameters:**
- `_admin_cap`: Reference to AdminCap object
- `registry`: Mutable reference to BadgeRegistry
- `domain`: Email domain to whitelist (e.g., `"@university.edu"`)

**Events:** `DomainAdded { domain: String }`

**Errors:**
- `EDomainAlreadyExists (5)`: Domain already whitelisted
</details>

<details>
<summary><b>register_member</b></summary>

```move
public entry fun register_member(
    registry: &mut BadgeRegistry,
    email_domain: vector<u8>,
    organization: vector<u8>,
    ctx: &mut TxContext
)
```

**Parameters:**
- `registry`: Reference to BadgeRegistry
- `email_domain`: Member's email domain
- `organization`: Organization name

**Events:** `MemberRegistered { badge_id, member_address, email_domain, organization, timestamp }`

**Errors:**
- `EDomainNotAllowed (4)`: Domain not whitelisted
- `EAlreadyRegistered (2)`: Address already has badge
</details>

<details>
<summary><b>verify_badge</b></summary>

```move
public fun verify_badge(
    badge: &MembershipBadge,
    registry: &BadgeRegistry,
    claimed_address: address,
): bool
```

**Parameters:**
- `badge`: Reference to badge object
- `registry`: Reference to BadgeRegistry
- `claimed_address`: Address claiming ownership

**Returns:** `bool` - `true` if valid, `false` if invalid/revoked
</details>

[View all function details →](#-api-reference)

---

## 📡 Events

### MemberRegistered

Emitted when a member successfully registers.

```move
struct MemberRegistered has copy, drop {
    badge_id: address,
    member_address: address,
    email_domain: String,
    organization: String,
    timestamp: u64,
}
```

**Example:**
```json
{
  "badge_id": "0xabc123...",
  "member_address": "0x789ghi...",
  "email_domain": "@university.edu",
  "organization": "University Name",
  "timestamp": 1234567890
}
```

### BadgeVerified

Emitted when a badge verification is performed.

```move
struct BadgeVerified has copy, drop {
    badge_id: address,
    holder_address: address,
    is_valid: bool,
}
```

### DomainAdded

Emitted when admin whitelists a domain.

```move
struct DomainAdded has copy, drop {
    domain: String,
}
```

### DomainRemoved

Emitted when admin removes a domain.

```move
struct DomainRemoved has copy, drop {
    domain: String,
}
```

### MembershipRevoked

Emitted when admin revokes a membership.

```move
struct MembershipRevoked has copy, drop {
    member_address: address,
    badge_id: address,
}
```

---

## ⚠️ Error Codes

| Code | Name | Description | Solution |
|------|------|-------------|----------|
| `1` | `ENotAdmin` | Reserved for future use | N/A |
| `2` | `EAlreadyRegistered` | Address already has a badge | Use different address or revoke existing |
| `3` | `EInvalidBadge` | Badge validation failed | Check badge ID and registry |
| `4` | `EDomainNotAllowed` | Email domain not whitelisted | Admin must whitelist domain first |
| `5` | `EDomainAlreadyExists` | Domain already in whitelist | Domain is already added |

### Error Handling Example

```typescript
try {
  await registerMember();
} catch (error) {
  if (error.message.includes("error code: 4")) {
    alert("Your email domain is not authorized. Contact admin.");
  } else if (error.message.includes("error code: 2")) {
    alert("You're already registered!");
  } else {
    alert("Registration failed: " + error.message);
  }
}
```

---

## 🔐 Security

### Access Control

- **Admin Functions**: Require `AdminCap` object (only deployer has it)
- **Registration**: Only whitelisted domains can register
- **Verification**: Public (anyone can verify badges)
- **One Badge Per Address**: Prevents duplicate registrations

### Privacy Guarantees

**What's Stored On-Chain:**
- ✅ Email domain only (`@university.edu`)
- ✅ Organization name
- ✅ Timestamp
- ✅ Holder's zkLogin address

**What's NOT Stored:**
- ❌ Full email address
- ❌ Name
- ❌ Student number
- ❌ Date of birth
- ❌ Any other PII

### zkLogin Security

- Email ownership verified through OAuth (Google, Facebook, etc.)
- zkLogin generates deterministic Sui address from email
- Same email always generates same address
- Address cannot be reverse-engineered to reveal email

### Best Practices

1. **Secure AdminCap**: Store AdminCap ID like a private key
2. **Whitelist Carefully**: Only add verified institutional domains
3. **Monitor Events**: Track registrations and verifications
4. **Regular Audits**: Review allowed domains periodically
5. **Gas Management**: Consider sponsoring gas for better UX

---

## 💰 Gas Estimates

Approximate gas costs on Sui:

| Operation | Gas (MIST) | USD Equivalent* |
|-----------|------------|-----------------|
| Deploy Contract | ~10,000,000 | ~$0.01 |
| Add Domain | ~1,000,000 | ~$0.001 |
| Register Member | ~5,000,000 | ~$0.005 |
| Revoke Membership | ~1,000,000 | ~$0.001 |
| Verify Badge | ~1,000,000 | ~$0.001 |

*_Estimates based on 1 SUI = $1. Actual costs vary with network conditions._

### Gas Optimization Tips

- Use `register_member()` for self-service (members pay their own gas)
- Batch operations when possible
- Monitor gas prices and adjust budgets accordingly

---

## 💡 Examples

### Complete Registration Flow

```typescript
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWalletKit } from '@mysten/wallet-kit';

function MembershipFlow() {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  
  async function register() {
    // 1. Check if domain is allowed
    const isAllowed = await isDomainAllowed("@university.edu");
    if (!isAllowed) {
      alert("Your email domain is not authorized");
      return;
    }
    
    // 2. Check if already registered
    const isRegistered = await isMemberRegistered(currentAccount.address);
    if (isRegistered) {
      alert("You're already registered!");
      return;
    }
    
    // 3. Register
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::membership_badge::register_member`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure("@university.edu"),
        tx.pure("University Name"),
      ],
    });
    
    try {
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });
      
      console.log("✅ Registration successful!");
      console.log("Transaction:", result.digest);
      
      // 4. Get badge details
      const badges = await getBadgesForAddress(currentAccount.address);
      console.log("Your badge:", badges[0]);
      
    } catch (error) {
      console.error("Registration failed:", error);
    }
  }
  
  return <button onClick={register}>Register Now</button>;
}
```

### Admin Dashboard

```typescript
import { useState, useEffect } from 'react';

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [domains, setDomains] = useState([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    // Listen to registration events
    const events = await client.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::membership_badge::MemberRegistered` }
    });
    
    const memberList = events.data.map(e => e.parsedJson);
    setMembers(memberList);
  }
  
  async function addDomain(domain: string) {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::membership_badge::add_allowed_domain`,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(REGISTRY_ID),
        tx.pure(domain),
      ],
    });
    
    await signAndExecuteTransactionBlock({ transactionBlock: tx });
    alert(`✅ Domain ${domain} added!`);
  }
  
  async function revokeMember(memberAddress: string) {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::membership_badge::revoke_membership`,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(REGISTRY_ID),
        tx.pure(memberAddress),
      ],
    });
    
    await signAndExecuteTransactionBlock({ transactionBlock: tx });
    alert(`✅ Member ${memberAddress} revoked!`);
  }
  
  return (
    <div>
      <h2>Admin Dashboard</h2>
      
      <section>
        <h3>Add Domain</h3>
        <input type="text" placeholder="@university.edu" id="domain" />
        <button onClick={() => addDomain(document.getElementById('domain').value)}>
          Add Domain
        </button>
      </section>
      
      <section>
        <h3>Registered Members ({members.length})</h3>
        {members.map(member => (
          <div key={member.member_address}>
            <p>{member.email_domain} - {member.organization}</p>
            <button onClick={() => revokeMember(member.member_address)}>
              Revoke
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
```

### Badge Verification Widget

```typescript
function BadgeVerifier() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  
  async function verify(badgeId: string, holderAddress: string) {
    const valid = await verifyBadge(badgeId, holderAddress);
    setIsValid(valid);
  }
  
  return (
    <div>
      <h3>Verify Badge</h3>
      <input type="text" placeholder="Badge ID" id="badgeId" />
      <input type="text" placeholder="Holder Address" id="holderAddr" />
      <button onClick={() => {
        const badgeId = document.getElementById('badgeId').value;
        const holderAddr = document.getElementById('holderAddr').value;
        verify(badgeId, holderAddr);
      }}>
        Verify
      </button>
      
      {isValid !== null && (
        <div>
          {isValid ? (
            <p style={{ color: 'green' }}>✅ Valid Badge</p>
          ) : (
            <p style={{ color: 'red' }}>❌ Invalid or Revoked</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## ❓ FAQ

<details>
<summary><b>Can members have multiple badges?</b></summary>

No. Each address can only register once and receive one badge. This prevents duplicate memberships.
</details>

<details>
<summary><b>What happens if a member's email changes?</b></summary>

Since zkLogin derives addresses deterministically from email, a new email means a new address. The member would need to register again with the new email. The old badge remains valid unless revoked by admin.
</details>

<details>
<summary><b>Can badges be transferred?</b></summary>

Yes, badges have the `store` ability so they can be transferred. However, transferred badges will fail verification since the registry maps the original address to the badge ID.
</details>

<details>
<summary><b>How do I get testnet SUI for testing?</b></summary>

Use the [Sui Testnet Faucet](https://discord.com/channels/916379725201563759/971488439931392130) on Discord:
```
!faucet <YOUR_ADDRESS>
```
</details>

<details>
<summary><b>What OAuth providers does zkLogin support?</b></summary>

zkLogin currently supports:
- Google
- Facebook  
- Twitch
- More providers being added

Check the [zkLogin documentation](https://docs.sui.io/concepts/cryptography/zklogin) for the latest list.
</details>

<details>
<summary><b>Can I customize the badge metadata?</b></summary>

Yes! You can modify the `MembershipBadge` struct to add additional fields like:
- Badge tier/level
- Expiration date
- Member ID
- Custom attributes
</details>

<details>
<summary><b>How do I monitor gas costs in production?</b></summary>

Use Sui's gas profiling tools:
```bash
sui client gas <ADDRESS>
```

Or monitor through events and adjust gas budgets accordingly.
</details>

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/membership-badge
cd membership-badge

# Install dependencies
npm install

# Build contract
sui move build

# Run tests
sui move test
```

### Guidelines

- Follow Move coding standards
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Documentation**: [Full API Docs](docs/API.md)
- **Examples**: [Code Examples](examples/)
- **Sui Docs**: [docs.sui.io](https://docs.sui.io)
- **zkLogin Guide**: [zkLogin Documentation](https://docs.sui.io/concepts/cryptography/zklogin)
- **Discord**: [Join our community](#)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/membership-badge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/membership-badge/discussions)
- **Email**: support@yourorg.com

---

## 🙏 Acknowledgments

- Built on [Sui Network](https://sui.io)
- Uses [zkLogin](https://docs.sui.io/concepts/cryptography/zklogin) for authentication
- Inspired by decentralized identity systems

---

<div align="center">

**Made with ❤️ by [Your Organization]**

[⬆ Back to Top](#membership-badge-smart-contract)

</div>
