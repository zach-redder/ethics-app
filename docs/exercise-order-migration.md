# Exercise Display Order Migration Guide

## Overview
Added drag-and-drop reordering functionality for exercises in created groups. Exercises now have a `display_order` field that determines their order on both the created group detail screen (for owners) and joined group detail screen (for members).

## Database Schema Changes

### Step 1: Add display_order Column
Add a new `display_order` column to the `exercises` table:

```sql
-- Add display_order column to exercises table
ALTER TABLE exercises 
ADD COLUMN display_order INTEGER;

-- Create index for better query performance
CREATE INDEX idx_exercises_display_order ON exercises(group_id, display_order);
```

### Step 2: Migrate Existing Data
Set display_order for existing exercises based on their creation date:

```sql
-- Set display_order for existing exercises
-- This assigns order based on creation date (oldest first)
WITH ordered_exercises AS (
  SELECT 
    id,
    group_id,
    ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY created_at ASC) as row_num
  FROM exercises
  WHERE display_order IS NULL
)
UPDATE exercises e
SET display_order = oe.row_num
FROM ordered_exercises oe
WHERE e.id = oe.id;
```

### Step 3: Set NOT NULL Constraint (Optional)
After migrating data, you can optionally make display_order NOT NULL:

```sql
-- Make display_order NOT NULL (only after data migration)
ALTER TABLE exercises 
ALTER COLUMN display_order SET NOT NULL;

-- Add default value for future inserts
ALTER TABLE exercises 
ALTER COLUMN display_order SET DEFAULT 1;
```

## Application Changes

The application code has been updated to:

1. **Exercise Service** (`src/services/exerciseService.js`):
   - `createExercise()`: Automatically assigns the next display_order when creating exercises
   - `getExercisesByGroup()`: Orders exercises by display_order (ascending)
   - `updateExerciseOrder()`: New method to update exercise order (only accessible by group owners)

2. **Created Group Detail Screen** (`src/screens/groups/created-groups/CreatedGroupDetailScreen.js`):
   - Uses `react-native-draggable-flatlist` for drag-and-drop functionality
   - Shows drag handle icon (three horizontal lines) on the left side of exercise cards
   - Only group owners can drag exercises
   - Updates order in database when drag ends

3. **Joined Group Detail Screen** (`src/screens/groups/joined-groups/JoinedGroupDetailScreen.js`):
   - Automatically respects display_order when loading exercises
   - Members see exercises in the order set by the group owner

## Required Package Installation

Install the drag-and-drop library:

```bash
npm install react-native-draggable-flatlist react-native-reanimated
```

Note: `react-native-reanimated` is a peer dependency required by `react-native-draggable-flatlist`.

## Visual Indicator

Exercise cards now display a drag handle icon (three horizontal lines) on the left side:
- **Visible**: Only to group owners on the created group detail screen
- **Position**: Left side of the card, before the title and description
- **Icon**: `reorder-three-outline` from Ionicons

## User Experience

1. **Group Owners**:
   - Can long-press or drag the handle icon to reorder exercises
   - Order updates immediately in the UI
   - Order is saved to the database automatically
   - All group members see the new order

2. **Group Members**:
   - See exercises in the order set by the owner
   - Cannot reorder exercises
   - No drag handle icon visible

## Migration Checklist

- [ ] Backup your database
- [ ] Run the ALTER TABLE command to add display_order column
- [ ] Create index for performance
- [ ] Migrate existing data to set display_order values
- [ ] (Optional) Set NOT NULL constraint
- [ ] Install required npm packages
- [ ] Test drag-and-drop functionality
- [ ] Verify order persists across app restarts
- [ ] Verify order is consistent for all group members

## Rollback Plan

If you need to rollback:

```sql
-- Remove the display_order column
ALTER TABLE exercises DROP COLUMN display_order;

-- Drop the index
DROP INDEX IF EXISTS idx_exercises_display_order;
```

Note: After rollback, exercises will be ordered by `created_at` (descending) as before.
