# Supabase RLS Policy Fix - Complete Solution

## Issue: Infinite Recursion in group_members

The infinite recursion occurs because the RLS policies and triggers create circular dependencies.

## Complete Fix (Run this SQL in Supabase SQL Editor)

```sql
-- ============================================
-- STEP 1: Drop the problematic trigger
-- ============================================

DROP TRIGGER IF EXISTS trigger_add_owner_as_member ON groups;
DROP FUNCTION IF EXISTS add_owner_as_member();

-- ============================================
-- STEP 2: Simplify RLS Policies for group_members
-- ============================================

-- Drop all existing policies on group_members
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Group owners can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;

-- Create new, simpler policies

-- Allow users to view members of groups they belong to
CREATE POLICY "Users can view group members" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- Allow any authenticated user to insert themselves as a member
-- This is safe because the app validates the group code
CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Allow users to leave groups (delete their own membership)
CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Allow group owners to remove other members
CREATE POLICY "Group owners can remove members" ON group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 3: Update groups policies to avoid recursion
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group owners can update groups" ON groups;
DROP POLICY IF EXISTS "Group owners can delete groups" ON groups;

-- Simpler policies for groups table

-- Users can view groups they own OR are members of
CREATE POLICY "Users can view groups they belong to" ON groups
  FOR SELECT USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Users can create groups (they become the owner)
CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Only owners can update their groups
CREATE POLICY "Group owners can update groups" ON groups
  FOR UPDATE USING (auth.uid() = owner_id);

-- Only owners can delete their groups
CREATE POLICY "Group owners can delete groups" ON groups
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('groups', 'group_members');

-- Verify policies exist
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('groups', 'group_members')
ORDER BY tablename, policyname;
```

## Application-Side Changes

Since we removed the trigger, the app now handles adding the owner as a member. This is already implemented in `groupService.js`, but I'll verify it works correctly.

## Why This Fixes The Issue

1. **Removed the trigger**: The trigger was trying to insert into `group_members` during group creation, which triggered RLS policies that created infinite loops

2. **Simplified RLS policies**: The new policies avoid checking `group_members` while inserting into `group_members`, which was causing the recursion

3. **Application-side owner membership**: The app now adds the owner as a member after the group is created, giving us better control

## Testing After Fix

After running this SQL:

1. Try creating a group - should work without recursion error
2. Try joining a group - should work
3. Try viewing groups - should show both created and joined groups
4. Check the `group_members` table to verify owner was added

If you still see errors, check the Supabase logs for more specific error messages.
