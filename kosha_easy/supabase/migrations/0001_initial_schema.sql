-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users/Profiles Table (extends Supabase Auth)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  position TEXT,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('admin', 'participant')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);
오우우
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Rounds Table
-- ============================================
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  required_documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable RLS on rounds
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Rounds policies
CREATE POLICY "Rounds are viewable by everyone"
  ON public.rounds FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert rounds"
  ON public.rounds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update rounds"
  ON public.rounds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete rounds"
  ON public.rounds FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Round Participants Junction Table
-- ============================================
CREATE TABLE public.round_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(round_id, participant_id)
);

-- Enable RLS on round_participants
ALTER TABLE public.round_participants ENABLE ROW LEVEL SECURITY;

-- Round participants policies
CREATE POLICY "Round participants are viewable by everyone"
  ON public.round_participants FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage round participants"
  ON public.round_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Submissions Table
-- ============================================
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'not_submitted'
    CHECK (status IN ('submitted', 'not_submitted', 'not_applicable')),
  not_applicable_reason TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(round_id, participant_id, document_name)
);

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Submissions policies
CREATE POLICY "Users can view their own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = participant_id);

CREATE POLICY "Admins can view all submissions"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = participant_id);

CREATE POLICY "Users can update their own submissions"
  ON public.submissions FOR UPDATE
  USING (auth.uid() = participant_id);

CREATE POLICY "Admins can manage all submissions"
  ON public.submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Notifications Table
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'system')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  round_id UUID REFERENCES public.rounds(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can send notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Notification Templates Table
-- ============================================
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'system')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on notification_templates
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Notification templates policies
CREATE POLICY "Templates are viewable by everyone"
  ON public.notification_templates FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage templates"
  ON public.notification_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Indexes for better query performance
-- ============================================
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_department ON public.profiles(department);

CREATE INDEX idx_rounds_dates ON public.rounds(start_date, end_date);
CREATE INDEX idx_rounds_created_at ON public.rounds(created_at DESC);

CREATE INDEX idx_round_participants_round ON public.round_participants(round_id);
CREATE INDEX idx_round_participants_participant ON public.round_participants(participant_id);

CREATE INDEX idx_submissions_round ON public.submissions(round_id);
CREATE INDEX idx_submissions_participant ON public.submissions(participant_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_submitted_at ON public.submissions(submitted_at DESC);

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_rounds
  BEFORE UPDATE ON public.rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_submissions
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_notification_templates
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Seed Data (optional for testing)
-- ============================================

-- Insert notification templates
INSERT INTO public.notification_templates (name, type, subject, body, variables) VALUES
(
  '제출 마감 알림',
  'email',
  '[{{roundTitle}}] 문서 제출 마감 임박 알림',
  '안녕하세요, {{participantName}}님.

{{roundTitle}}의 제출 마감일이 {{daysLeft}}일 남았습니다.
아직 제출하지 않으신 경우 {{deadline}}까지 제출해주시기 바랍니다.

감사합니다.',
  '["participantName", "roundTitle", "daysLeft", "deadline"]'::jsonb
),
(
  '제출 완료 확인',
  'system',
  '문서 제출이 완료되었습니다',
  '{{participantName}}님의 {{roundTitle}} 문서 제출이 성공적으로 완료되었습니다.
제출일시: {{submittedAt}}',
  '["participantName", "roundTitle", "submittedAt"]'::jsonb
);
