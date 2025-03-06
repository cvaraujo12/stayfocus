-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  preferences jsonb default '{}'::jsonb,
  primary key (id)
);

-- Create a table for tasks (tarefas)
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamp with time zone,
  completed boolean default false,
  priority smallint default 1,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a table for time blocks (blocos de tempo)
create table time_blocks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  activity_type text not null,
  description text,
  completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a table for meals (refeições)
create table meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  time timestamp with time zone not null,
  description text not null,
  photo_url text,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a table for medications (medicações)
create table medications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  schedule jsonb not null, -- Array of times for medication
  taken_log jsonb default '{}'::jsonb, -- Log of taken medications
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a table for sleep records (registros de sono)
create table sleep_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  quality smallint check (quality >= 1 and quality <= 5),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a table for mood records (registros de humor)
create table mood_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  mood_level smallint check (mood_level >= 1 and mood_level <= 5),
  notes text,
  tags text[],
  recorded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a table for self knowledge notes (notas de autoconhecimento)
create table knowledge_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  content text not null,
  section text not null check (section in ('quem-sou', 'meus-porques', 'meus-padroes')),
  tags text[],
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table time_blocks enable row level security;
alter table meals enable row level security;
alter table medications enable row level security;
alter table sleep_records enable row level security;
alter table mood_records enable row level security;
alter table knowledge_notes enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Policies for tasks
create policy "Users can view own tasks"
  on tasks for select
  using ( auth.uid() = user_id );

create policy "Users can create own tasks"
  on tasks for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own tasks"
  on tasks for update
  using ( auth.uid() = user_id );

create policy "Users can delete own tasks"
  on tasks for delete
  using ( auth.uid() = user_id );

-- Similar policies for other tables
create policy "Users can view own time blocks"
  on time_blocks for select
  using ( auth.uid() = user_id );

create policy "Users can create own time blocks"
  on time_blocks for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own time blocks"
  on time_blocks for update
  using ( auth.uid() = user_id );

create policy "Users can delete own time blocks"
  on time_blocks for delete
  using ( auth.uid() = user_id );

-- Create functions for automatic timestamp updates
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for automatic timestamp updates
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute procedure update_updated_at_column();

create trigger update_tasks_updated_at
  before update on tasks
  for each row
  execute procedure update_updated_at_column();

create trigger update_time_blocks_updated_at
  before update on time_blocks
  for each row
  execute procedure update_updated_at_column();

create trigger update_meals_updated_at
  before update on meals
  for each row
  execute procedure update_updated_at_column();

create trigger update_medications_updated_at
  before update on medications
  for each row
  execute procedure update_updated_at_column();

create trigger update_sleep_records_updated_at
  before update on sleep_records
  for each row
  execute procedure update_updated_at_column();

create trigger update_mood_records_updated_at
  before update on mood_records
  for each row
  execute procedure update_updated_at_column();

create trigger update_knowledge_notes_updated_at
  before update on knowledge_notes
  for each row
  execute procedure update_updated_at_column();
