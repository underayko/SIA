-- Migration: Create profile_change_requests table for faculty profile modifications
-- Purpose: Store change requests submitted by faculty that require HR verification
-- Date: 2026-05-02

-- Create profile_change_requests table
CREATE TABLE IF NOT EXISTS public.profile_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT,
    email VARCHAR(255),
    field VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by BIGINT,
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES public.users(user_id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_profile_change_requests_user_id 
    ON public.profile_change_requests(user_id);

CREATE INDEX idx_profile_change_requests_email 
    ON public.profile_change_requests(email);

CREATE INDEX idx_profile_change_requests_status 
    ON public.profile_change_requests(status);

CREATE INDEX idx_profile_change_requests_field 
    ON public.profile_change_requests(field);

CREATE INDEX idx_profile_change_requests_created_at 
    ON public.profile_change_requests(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Faculty can view their own change requests (via email)
CREATE POLICY "Users can view their own profile change requests"
    ON public.profile_change_requests
    FOR SELECT
    USING (
        email = auth.jwt() ->> 'email'
    );

-- RLS Policy: Faculty can insert their own change requests (via email)
CREATE POLICY "Users can create their own profile change requests"
    ON public.profile_change_requests
    FOR INSERT
    WITH CHECK (
        email = auth.jwt() ->> 'email'
    );

-- RLS Policy: Only HR/Admin can update change requests
CREATE POLICY "Only HR can update profile change requests"
    ON public.profile_change_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.email = auth.jwt() ->> 'email'
            AND (auth.users.raw_user_meta_data ->> 'role' = 'HR' 
                 OR auth.users.raw_user_meta_data ->> 'role' = 'VPAA'
                 OR auth.users.raw_user_meta_data ->> 'role' = 'admin')
        )
    );

-- Add comment to table
COMMENT ON TABLE public.profile_change_requests IS 
'Stores faculty profile change requests that require HR verification. Faculty submit changes, HR reviews and approves/rejects them.';

COMMENT ON COLUMN public.profile_change_requests.id IS 'Unique request identifier (UUID)';
COMMENT ON COLUMN public.profile_change_requests.user_id IS 'References users.user_id for the faculty member';
COMMENT ON COLUMN public.profile_change_requests.email IS 'Email of the faculty member (from users.domain_email)';
COMMENT ON COLUMN public.profile_change_requests.field IS 'Name of the profile field being changed (e.g., name_middle, domain_email, educational_attainment, eligibility_exams, teaching_experience_years, industry_experience_years)';
COMMENT ON COLUMN public.profile_change_requests.old_value IS 'Previous value of the field';
COMMENT ON COLUMN public.profile_change_requests.new_value IS 'New value requested by faculty';
COMMENT ON COLUMN public.profile_change_requests.status IS 'Request status: pending, approved, rejected';
COMMENT ON COLUMN public.profile_change_requests.requested_at IS 'When the faculty requested this change';
COMMENT ON COLUMN public.profile_change_requests.verified_by IS 'References users.user_id of HR person who verified this request';
COMMENT ON COLUMN public.profile_change_requests.verified_at IS 'When HR verified/approved/rejected this request';
COMMENT ON COLUMN public.profile_change_requests.notes IS 'HR notes or reason for rejection';
