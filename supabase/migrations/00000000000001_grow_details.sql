-- Create enum for growing medium
do $$ begin
    create type growing_medium as enum (
        'soil',
        'coco',
        'hydro',
        'aero',
        'other'
    );
exception
    when duplicate_object then null;
end $$;

-- Create enum for environment type
do $$ begin
    create type environment_type as enum (
        'indoor',
        'outdoor',
        'greenhouse'
    );
exception
    when duplicate_object then null;
end $$;

-- Add new columns to grows table
alter table grows add column growing_medium growing_medium not null default 'soil';
alter table grows add column environment environment_type not null default 'indoor';
alter table grows add column strains text[] not null default '{}';
alter table grows add column target_temp_low decimal(4,1);
alter table grows add column target_temp_high decimal(4,1);
alter table grows add column target_humidity_low decimal(4,1);
alter table grows add column target_humidity_high decimal(4,1);
alter table grows add column light_schedule text;
alter table grows add column nutrients text[] default '{}'; 