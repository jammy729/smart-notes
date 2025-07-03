
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create patients table
create table patients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  date_of_birth date,
  medical_record_number text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Create recordings table
create table recordings (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  title text not null,
  duration integer, -- in seconds
  file_url text,
  transcription text,
  status text default 'recording' check (status in ('recording', 'completed', 'processing')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Create reports table
create table reports (
  id uuid default uuid_generate_v4() primary key,
  recording_id uuid references recordings(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  report_type text not null check (report_type in ('consultation', 'soap', 'followup', 'discharge')),
  title text not null,
  content text not null,
  status text default 'draft' check (status in ('draft', 'completed', 'sent')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Create templates table
create table templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  template_type text not null check (template_type in ('consultation', 'soap', 'followup', 'discharge')),
  content text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Enable Row Level Security
alter table patients enable row level security;
alter table recordings enable row level security;
alter table reports enable row level security;
alter table templates enable row level security;

-- Create RLS policies
create policy "Users can only see their own patients"
  on patients for all
  using (auth.uid() = user_id);

create policy "Users can only see their own recordings"
  on recordings for all
  using (auth.uid() = user_id);

create policy "Users can only see their own reports"
  on reports for all
  using (auth.uid() = user_id);

create policy "Users can only see their own templates"
  on templates for all
  using (auth.uid() = user_id);

-- Insert default templates
insert into templates (name, template_type, content, is_default, user_id) values
('Standard SOAP Note', 'soap', 'SUBJECTIVE:
{patient_complaint}

OBJECTIVE:
Vitals: {vitals}
Physical Exam: {physical_exam}

ASSESSMENT:
{assessment}

PLAN:
{plan}', true, '00000000-0000-0000-0000-000000000000'),
('General Consultation', 'consultation', 'CONSULTATION NOTE

Date: {date}
Patient: {patient_name}
DOB: {date_of_birth}

CHIEF COMPLAINT:
{chief_complaint}

HISTORY OF PRESENT ILLNESS:
{history_present_illness}

PHYSICAL EXAMINATION:
{physical_exam}

ASSESSMENT AND PLAN:
{assessment_plan}', true, '00000000-0000-0000-0000-000000000000');
