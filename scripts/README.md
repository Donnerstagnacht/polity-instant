# Quick Start Guide - New Seed System

## 🚀 Getting Started

The new modular seed system is ready to use! Here's how to get started:

### Basic Usage

```bash
# Seed all currently implemented entities (users, groups, events)
npm run seed:new

# List available seeders
npm run seed:new -- --list

# Seed only users
npm run seed:new -- --only=users

# Seed only events (automatically includes users and groups)
npm run seed:new -- --only=events

# Seed everything except events
npm run seed:new -- --skip=events
```

## 📋 Currently Available Seeders

1. **users** - No dependencies

   - Creates ~20 users including test accounts
   - Includes stats, statements, hashtags, initial blogs

2. **groups** - Depends on: users

   - Creates ~8 groups with roles and memberships
   - Includes conversations, messages, blogs, amendments

3. **events** - Depends on: users, groups
   - Creates ~10 events with organizers and participants
   - Includes hashtags

## 🎯 Example Workflows

### Development - Quick User Testing

```bash
# Just seed users for quick testing
npm run seed:new -- --only=users
```

### Development - Group Features

```bash
# Seed users and groups (includes conversations, memberships, etc.)
npm run seed:new -- --only=groups
```

### Development - Event Features

```bash
# Seed users, groups, and events (full chain)
npm run seed:new -- --only=events
```

### Full Seed

```bash
# Seed everything currently implemented
npm run seed:new
```

## 📊 Expected Output

```
🌱 Starting seed process...

📋 Execution plan (3 seeders):
  1. users
  2. groups (depends on: users)
  3. events (depends on: users, groups)

Seeding users...
✅ Seeded 23 users
Seeding groups...
✅ Seeded 8 groups
Seeding events...
✅ Seeded 10 events

✅ Seed process completed successfully!
   Duration: 12.34s

📊 Summary:
   Users: 23
   Groups: 8
   Events: 10
   Total: 41 entities
```

## 🔧 Configuration

Entity counts can be adjusted in `scripts/config/seed.config.ts`:

```typescript
export const SEED_CONFIG = {
  users: { min: 15, max: 20 }, // Adjust user count
  groups: { min: 6, max: 8 }, // Adjust group count
  events: { min: 8, max: 12 }, // Adjust event count
  // ...
};
```

## 🏗️ Next Steps

The system is ready for use, but more seeders need to be created:

### To Be Implemented (16 more seeders)

- amendments
- blogs
- positions
- statements
- agendaItems
- electionCandidates
- changeRequests
- comments
- votes
- notifications
- messages
- conversations
- payments
- hashtags
- documents
- todos

See `scripts/SEEDING.md` for detailed instructions on creating new seeders.

## 📚 Documentation

- **SEEDING.md** - Comprehensive architecture and usage guide
- **REFACTORING_SUMMARY.md** - Implementation details and metrics
- **README.md** (this file) - Quick start guide

## 🐛 Troubleshooting

### Error: "Seeder not found"

Make sure the seeder is registered in `seed.new.ts`:

```typescript
orchestrator.registerAll([
  usersSeeder,
  groupsSeeder,
  eventsSeeder,
  // Add your seeder here
]);
```

### Error: "Circular dependency detected"

Check the `dependencies` array in your seeders. Ensure there are no circular references.

### Slow Performance

- Reduce entity counts in `seed.config.ts`
- Use `--only` flag to seed specific entities
- Check `batchSize` in transaction.helpers.ts

## 🎉 Success!

The refactored seed system is fully functional and ready to use. Try it out:

```bash
npm run seed:new -- --list
npm run seed:new -- --only=users
```

Happy seeding! 🌱
