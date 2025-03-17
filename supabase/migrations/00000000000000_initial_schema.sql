-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_tier as enum ('free', 'premium', 'enterprise');
create type grow_stage as enum ('planning', 'germination', 'vegetation', 'flowering', 'harvesting', 'curing', 'completed');
create type plant_status as enum ('healthy', 'warning', 'critical');
create type task_priority as enum ('low', 'medium', 'high');

-- Create profiles table
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text,
    avatar_url text,
    tier user_tier default 'free' not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    constraint email_length check (char_length(email) >= 3)
);

-- Create grows table
create table grows (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    stage grow_stage default 'planning' not null,
    start_date timestamptz,
    end_date timestamptz,
    plant_count integer default 0 not null,
    user_id uuid references auth.users on delete cascade not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    constraint name_length check (char_length(name) >= 1)
);

-- Create plants table
create table plants (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    strain text,
    grow_id uuid references grows on delete cascade not null,
    status plant_status default 'healthy' not null,
    notes text,
    user_id uuid references auth.users on delete cascade not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    constraint name_length check (char_length(name) >= 1)
);

-- Create tasks table
create table tasks (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    due_date timestamptz,
    completed boolean default false not null,
    priority task_priority default 'medium' not null,
    grow_id uuid references grows on delete cascade,
    user_id uuid references auth.users on delete cascade not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    constraint title_length check (char_length(title) >= 1)
);

-- Create indexes for better query performance
create index grows_user_id_idx on grows(user_id);
create index plants_grow_id_idx on plants(grow_id);
create index plants_user_id_idx on plants(user_id);
create index tasks_grow_id_idx on tasks(grow_id);
create index tasks_user_id_idx on tasks(user_id);
create index tasks_due_date_idx on tasks(due_date);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at columns
create trigger update_profiles_updated_at
    before update on profiles
    for each row
    execute function update_updated_at_column();

create trigger update_grows_updated_at
    before update on grows
    for each row
    execute function update_updated_at_column();

create trigger update_plants_updated_at
    before update on plants
    for each row
    execute function update_updated_at_column();

create trigger update_tasks_updated_at
    before update on tasks
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table grows enable row level security;
alter table plants enable row level security;
alter table tasks enable row level security;

-- Create RLS policies
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

create policy "Users can view own grows"
    on grows for select
    using (auth.uid() = user_id);

create policy "Users can insert own grows"
    on grows for insert
    with check (auth.uid() = user_id);

create policy "Users can update own grows"
    on grows for update
    using (auth.uid() = user_id);

create policy "Users can delete own grows"
    on grows for delete
    using (auth.uid() = user_id);

create policy "Users can view own plants"
    on plants for select
    using (auth.uid() = user_id);

create policy "Users can insert own plants"
    on plants for insert
    with check (auth.uid() = user_id);

create policy "Users can update own plants"
    on plants for update
    using (auth.uid() = user_id);

create policy "Users can delete own plants"
    on plants for delete
    using (auth.uid() = user_id);

create policy "Users can view own tasks"
    on tasks for select
    using (auth.uid() = user_id);

create policy "Users can insert own tasks"
    on tasks for insert
    with check (auth.uid() = user_id);

create policy "Users can update own tasks"
    on tasks for update
    using (auth.uid() = user_id);

create policy "Users can delete own tasks"
    on tasks for delete
    using (auth.uid() = user_id); 