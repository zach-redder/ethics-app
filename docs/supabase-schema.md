# Supabase Database Schema

This document describes the database schema for the Ethics App. Use this as a reference when creating tables in your Supabase project.

## Tables

### profiles

User profile information extending the default auth.users table.

```sql
-- ============================================
-- Ethics Practice Exercises App - Supabase SQL Setup
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (for clean setup)
-- ============================================

DROP TABLE IF EXISTS issue_reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS exercise_progress CASCADE;
DROP TABLE IF EXISTS user_exercise_customization CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table (profiles linked to auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_code VARCHAR(5) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(group_id, user_id)
);

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  frequency_per_day INTEGER,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_exercise_dates CHECK (end_date >= start_date)
);

-- User exercise customization table
CREATE TABLE user_exercise_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  custom_start_date DATE NOT NULL,
  custom_end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, exercise_id),
  CONSTRAINT valid_custom_dates CHECK (custom_end_date >= custom_start_date)
);

-- Exercise progress table
CREATE TABLE exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  number_of_completions INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, exercise_id, practice_date)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Issue reports table
CREATE TABLE issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Groups indexes
CREATE INDEX idx_groups_owner_id ON groups(owner_id);
CREATE INDEX idx_groups_group_code ON groups(group_code);

-- Group members indexes
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- Exercises indexes
CREATE INDEX idx_exercises_group_id ON exercises(group_id);
CREATE INDEX idx_exercises_created_by ON exercises(created_by);
CREATE INDEX idx_exercises_dates ON exercises(start_date, end_date);

-- User exercise customization indexes
CREATE INDEX idx_user_exercise_customization_user_id ON user_exercise_customization(user_id);
CREATE INDEX idx_user_exercise_customization_exercise_id ON user_exercise_customization(exercise_id);

-- Exercise progress indexes
CREATE INDEX idx_exercise_progress_user_id ON exercise_progress(user_id);
CREATE INDEX idx_exercise_progress_exercise_id ON exercise_progress(exercise_id);
CREATE INDEX idx_exercise_progress_practice_date ON exercise_progress(practice_date);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Issue reports indexes
CREATE INDEX idx_issue_reports_user_id ON issue_reports(user_id);
CREATE INDEX idx_issue_reports_status ON issue_reports(status);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- USERS POLICIES
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can delete their own account
CREATE POLICY "Users can delete own account" ON users
  FOR DELETE USING (auth.uid() = id);

-- GROUPS POLICIES
-- Users can view groups they are members of
CREATE POLICY "Users can view groups they belong to" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Users can create groups (and become owner)
CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Group owners can update their groups
CREATE POLICY "Group owners can update groups" ON groups
  FOR UPDATE USING (auth.uid() = owner_id);

-- Group owners can delete their groups
CREATE POLICY "Group owners can delete groups" ON groups
  FOR DELETE USING (auth.uid() = owner_id);

-- GROUP_MEMBERS POLICIES
-- Users can view members of groups they belong to
CREATE POLICY "Users can view group members" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- Users can join groups (insert themselves)
CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Group owners can remove members
CREATE POLICY "Group owners can remove members" ON group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.owner_id = auth.uid()
    )
  );

-- Users can leave groups (delete themselves)
CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (auth.uid() = user_id);

-- EXERCISES POLICIES
-- Users can view exercises in groups they belong to
CREATE POLICY "Users can view group exercises" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = exercises.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Group owners can create exercises
CREATE POLICY "Group owners can create exercises" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_id
      AND groups.owner_id = auth.uid()
    )
  );

-- Group owners can update exercises
CREATE POLICY "Group owners can update exercises" ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = exercises.group_id
      AND groups.owner_id = auth.uid()
    )
  );

-- Group owners can delete exercises
CREATE POLICY "Group owners can delete exercises" ON exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = exercises.group_id
      AND groups.owner_id = auth.uid()
    )
  );

-- USER_EXERCISE_CUSTOMIZATION POLICIES
-- Users can view their own customizations
CREATE POLICY "Users can view own customizations" ON user_exercise_customization
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own customizations for exercises in their groups
CREATE POLICY "Users can create own customizations" ON user_exercise_customization
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members gm
      JOIN exercises e ON e.group_id = gm.group_id
      WHERE e.id = exercise_id
      AND gm.user_id = auth.uid()
    )
  );

-- Users can update their own customizations
CREATE POLICY "Users can update own customizations" ON user_exercise_customization
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own customizations
CREATE POLICY "Users can delete own customizations" ON user_exercise_customization
  FOR DELETE USING (auth.uid() = user_id);

-- EXERCISE_PROGRESS POLICIES
-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON exercise_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Group owners can view all progress in their groups
CREATE POLICY "Group owners can view group progress" ON exercise_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN groups g ON g.id = e.group_id
      WHERE e.id = exercise_progress.exercise_id
      AND g.owner_id = auth.uid()
    )
  );

-- Users can create their own progress entries
CREATE POLICY "Users can create own progress" ON exercise_progress
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members gm
      JOIN exercises e ON e.group_id = gm.group_id
      WHERE e.id = exercise_id
      AND gm.user_id = auth.uid()
    )
  );

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON exercise_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own progress" ON exercise_progress
  FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- System/Users can create notifications (adjust based on your notification strategy)
CREATE POLICY "Users can receive notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- You may want to restrict this further

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ISSUE_REPORTS POLICIES
-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON issue_reports
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own reports
CREATE POLICY "Users can create reports" ON issue_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports (if needed)
CREATE POLICY "Users can update own reports" ON issue_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- HELPFUL FUNCTIONS (OPTIONAL)
-- ============================================

-- Function to automatically add group owner as a member when group is created
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_add_owner_as_member
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

-- Function to generate random 5-digit group code
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS VARCHAR(5) AS $$
DECLARE
  code VARCHAR(5);
  exists BOOLEAN;
BEGIN
  LOOP
    code := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM groups WHERE group_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables for authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```