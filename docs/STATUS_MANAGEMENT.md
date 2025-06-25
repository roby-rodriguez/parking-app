# Parking Access Status Management

This document explains how the parking access status management system works in the parking app.

## Status Types

The system supports four status types:

- **`active`**: The parking access is currently valid and can be used
- **`pending`**: The parking access is not yet valid (current time < valid_from)
- **`expired`**: The parking access has expired (current time > valid_to)
- **`revoked`**: The parking access has been manually revoked by an admin

## How Status is Calculated

### Database Level
1. **Stored Status**: Each record has a `status` field that stores the current status
2. **Computed Status**: A database function `get_parking_access_status()` calculates the real-time status
3. **Database View**: `parking_access_with_computed_status` provides records with both stored and computed status

### Client Level
1. **Status Utilities**: `src/utils/statusUtils.ts` provides functions to calculate status on the client
2. **Real-time Calculation**: Status is calculated based on current time vs valid_from/valid_to dates
3. **Fallback Logic**: If computed_status is not available, client calculates it locally

## Automatic Status Updates

### Database Function
- Function: `update_parking_access_status()`
- Updates records where `status = 'active'` AND `valid_to < NOW()` to `'expired'`
- Updates records where `status = 'active'` AND `valid_from > NOW()` to `'pending'`
- Updates records where `status IN ('pending', 'expired')` AND within valid date range to `'active'`
- Updates `updated_at` timestamp for changed records

### Cron Job Setup
- **Supabase Dashboard**: Go to Integrations → Scheduled Functions
- **Function**: `update_parking_access_status`
- **Schedule**: `0 * * * *` (every hour) or `0 0 * * *` (daily at midnight)
- **Purpose**: Automatically calls the database function to update all parking access statuses

## Implementation Details

### Database Functions

```sql
-- Update all parking access statuses based on current time
CREATE OR REPLACE FUNCTION update_parking_access_status()
RETURNS void AS $$
BEGIN
    -- Update expired records (past valid_to date)
    UPDATE parking_access 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND valid_to < NOW();
    
    -- Update pending records (before valid_from date)
    UPDATE parking_access 
    SET status = 'pending', updated_at = NOW()
    WHERE status = 'active' 
    AND valid_from > NOW();
    
    -- Update active records (within valid date range)
    UPDATE parking_access 
    SET status = 'active', updated_at = NOW()
    WHERE status IN ('pending', 'expired')
    AND valid_from <= NOW() 
    AND valid_to >= NOW();
END;
$$ LANGUAGE plpgsql;

-- Calculate real-time status
CREATE OR REPLACE FUNCTION get_parking_access_status(
    p_valid_from TIMESTAMPTZ,
    p_valid_to TIMESTAMPTZ,
    p_status TEXT
)
RETURNS TEXT AS $$
BEGIN
    IF p_status = 'revoked' THEN
        RETURN 'revoked';
    END IF;
    
    IF NOW() > p_valid_to THEN
        RETURN 'expired';
    END IF;
    
    IF NOW() < p_valid_from THEN
        RETURN 'pending';
    END IF;
    
    RETURN 'active';
END;
$$ LANGUAGE plpgsql;
```

### Client Utilities

```typescript
// Calculate status based on dates and stored status
export function calculateParkingStatus(
    validFrom: string,
    validTo: string,
    storedStatus: ParkingStatus
): ParkingStatus

// Get effective status (uses computed_status if available)
export function getEffectiveStatus(parkingAccess: ParkingAccess): ParkingStatus

// Get UI color classes for status display
export function getStatusColorClasses(status: ParkingStatus): string

// Get human-readable status labels
export function getStatusLabel(status: ParkingStatus): string
```

## Usage Examples

### In Admin Interface
```typescript
// Get parking access with computed status
const { parkingAccess } = useParkingAccess();

// Display status with proper colors
const effectiveStatus = getEffectiveStatus(item);
const colorClasses = getStatusColorClasses(effectiveStatus);
const label = getStatusLabel(effectiveStatus);
```

### In Parking Access Validation
```typescript
// Check if access is valid
const currentStatus = calculateParkingStatus(
    data.valid_from,
    data.valid_to,
    data.status
);

if (currentStatus !== 'active') {
    // Handle invalid access
}
```

## Benefits

1. **Real-time Accuracy**: Status is calculated based on current time
2. **Automatic Updates**: Expired records are automatically marked as expired via cron job
3. **No Manual Intervention**: System runs completely automatically
4. **Consistent Display**: Status colors and labels are consistent across the app
5. **Performance**: Database indexes optimize status queries
6. **Fallback Support**: Works even if database view is not available

## Setup Instructions

1. Run the migration: `supabase/migrations/20250622150000_add_status_management.sql`

2. Set up the cron job in Supabase Dashboard:
   - Go to your Supabase project dashboard
   - Navigate to **Integrations** → **Scheduled Functions**
   - Create a new scheduled function:
     - **Name**: `update-parking-access-status`
     - **Function**: `update_parking_access_status`
     - **Schedule**: `0 * * * *` (every hour) or `0 0 * * *` (daily at midnight)
     - **Enabled**: ✅

3. The system will automatically start working with the new status management

## Monitoring

- Check the admin interface for status accuracy
- Monitor the cron job execution in Supabase Dashboard
- Status updates happen automatically without manual intervention 