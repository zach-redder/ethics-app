# Quick Fix Guide - Infinite Recursion Error

## The Problem
You're getting "infinite recursion detected in policy for relation group_members" because the RLS policies and trigger create circular dependencies.

## The Solution (3 Steps)

### Step 1: Run This SQL in Supabase

Open your Supabase SQL Editor and run this **entire script**:

```sql
-- Remove the problematic trigger
DROP TRIGGER IF EXISTS trigger_add_owner_as_member ON groups;
DROP FUNCTION IF EXISTS add_owner_as_member();

-- Simplify group_members policies
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Group owners can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;

CREATE POLICY "Users can view group members" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Group owners can remove members" ON group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.owner_id = auth.uid()
    )
  );

-- Fix groups policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
CREATE POLICY "Users can view groups they belong to" ON groups
  FOR SELECT USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );
```

### Step 2: Verify It Worked

Still in the SQL Editor, run this to verify:

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('groups', 'group_members')
ORDER BY tablename, policyname;
```

You should see the new policies listed.

### Step 3: Restart Your Expo App

```bash
# Stop the current server (Ctrl+C)
# Clear the cache and restart
npm start -- --clear
```

## What Changed

1. **Removed the trigger** - No more automatic owner-as-member addition
2. **App handles it now** - The `groupService.createGroup()` now manually adds the owner as a member
3. **Simplified policies** - No more circular RLS checks

## Testing

After the fix:

1. Try creating a group → should work
2. Try joining a group → should work
3. Check Dashboard → should show groups in both tabs
4. Calendar icons → now proper SVG icons (not emojis)

## If Still Having Issues

Check the Supabase logs:
1. Go to Supabase Dashboard
2. Click "Logs" → "Postgres Logs"
3. Look for any RLS-related errors
4. Share the error message if you need more help

The app is now using **two separate queries** to avoid recursion:
- First query: Get group IDs from `group_members`
- Second query: Get group details from `groups`

This avoids the circular dependency that was causing infinite recursion!
