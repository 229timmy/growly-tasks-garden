-- First, add height column to plants table
alter table plants add column if not exists height numeric(10,2);

-- Create plant_measurements table
create table if not exists plant_measurements (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid not null references plants(id) on delete cascade,
  height numeric(10,2),
  ph_level numeric(4,2),
  notes text,
  measured_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Create indexes
create index if not exists plant_measurements_plant_id_idx on plant_measurements(plant_id);
create index if not exists plant_measurements_user_id_idx on plant_measurements(user_id);
create index if not exists plant_measurements_measured_at_idx on plant_measurements(measured_at);

-- Enable RLS
alter table plant_measurements enable row level security;

-- Create RLS policies
do $$ begin
  create policy "Users can view their own plant measurements"
    on plant_measurements for select
    using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own plant measurements"
    on plant_measurements for insert
    with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own plant measurements"
    on plant_measurements for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own plant measurements"
    on plant_measurements for delete
    using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

-- Create function to update plant height
create or replace function update_plant_height()
returns trigger as $$
begin
  if NEW.height is not null then
    update plants
    set height = NEW.height
    where id = NEW.plant_id;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger to update plant height
drop trigger if exists update_plant_height_trigger on plant_measurements;
create trigger update_plant_height_trigger
after insert or update on plant_measurements
for each row
execute function update_plant_height(); 