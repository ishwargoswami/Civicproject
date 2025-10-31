# Migration Notes for WhatsApp Notifications

## Database Changes

The WhatsApp notification feature requires adding a `metadata` field to the User model. This field is used to temporarily store phone numbers during the verification process.

### Run These Commands

```bash
cd backend

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Expected Migration

The migration will add the following field to the `users` table:
- `metadata` (JSONField): Stores temporary data like pending phone numbers

### Existing Data

- All existing users will have an empty `metadata` field by default
- No data loss will occur
- Users will need to add and verify their phone numbers to receive WhatsApp notifications

### Rollback (if needed)

If you need to rollback:
```bash
python manage.py migrate accounts <previous_migration_number>
```

## Post-Migration Steps

1. ✅ Verify migrations ran successfully
2. ✅ Test user model can save metadata
3. ✅ Configure Twilio credentials in `.env`
4. ✅ Test phone verification flow
5. ✅ Test event creation triggers notifications

## Notes

- The notification preferences model already has WhatsApp fields (they were added previously)
- Signals for event creation are automatically registered when the events app loads
- No changes needed to existing notification preference records

