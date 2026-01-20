-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('operator', 'technician', 'admin')) NOT NULL DEFAULT 'operator',
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(new.raw_user_meta_data->>'role', 'operator'),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 2. MACHINES
CREATE TABLE public.machines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    qr_code_uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- Machines Policies
CREATE POLICY "Machines are viewable by authenticated users" ON public.machines
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Office/Admin/Technician can insert machines" ON public.machines
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('technician', 'admin'))
    );

CREATE POLICY "Office/Admin/Technician can update machines" ON public.machines
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('technician', 'admin'))
    );

-- 3. CHECKINS
CREATE TABLE public.checkins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    machine_id UUID REFERENCES public.machines(id) NOT NULL,
    shift_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Checkins Policies
CREATE POLICY "Users can view their own checkins" ON public.checkins
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Office/Admin can view all checkins" ON public.checkins
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('technician', 'admin'))
    );

CREATE POLICY "Users can insert their own checkins" ON public.checkins
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. CHECKLISTS
CREATE TABLE public.checklists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    checkin_id UUID REFERENCES public.checkins(id) NOT NULL,
    machine_id UUID REFERENCES public.machines(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    observations TEXT NOT NULL,
    status TEXT CHECK (status IN ('ok', 'issue_reported')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Checklists Policies
CREATE POLICY "Users can view their own checklists" ON public.checklists
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Office/Admin can view all checklists" ON public.checklists
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('technician', 'admin'))
    );

CREATE POLICY "Users can insert their own checklists" ON public.checklists
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. CHECKLIST QUESTIONS (Templates)
CREATE TABLE public.checklist_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    category TEXT NOT NULL,
    required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial questions
INSERT INTO public.checklist_questions (question, category) VALUES
('Nível de óleo do motor', 'Motor'),
('Sistema de arrefecimento', 'Motor'),
('Estado dos pneus / esteiras', 'Estrutura'),
('Luzes e sinalização', 'Segurança'),
('Sistema hidráulico (vazamentos)', 'Hidráulica'),
('Freios de serviço e estacionamento', 'Segurança'),
('Cinto de segurança e assento', 'Cabin'),
('Ruídos anormais durante operação', 'Operação');

-- 6. CHECKLIST ITEMS (Responses)
CREATE TABLE public.checklist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.checklist_questions(id),
    status TEXT CHECK (status IN ('ok', 'warning', 'fail')) NOT NULL DEFAULT 'ok',
    notes TEXT,
    photo_urls TEXT[], 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.checklist_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view questions" ON public.checklist_questions FOR SELECT USING (true);

-- Policies for Checklist Items
CREATE POLICY "Everyone with access can view items" ON public.checklist_items
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_id AND (
            user_id = auth.uid() OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('technician', 'admin'))
        ))
    );

CREATE POLICY "Users can insert items for their checklists" ON public.checklist_items
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_id AND user_id = auth.uid())
    );

-- 6. DOCUMENTS
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID REFERENCES public.machines(id) NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Documents Policies
CREATE POLICY "Documents are viewable by authenticated users" ON public.documents
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Office/Admin/Technician can insert documents" ON public.documents
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('technician', 'admin'))
    );

-- 7. AUDIT LOGS
CREATE TABLE public.audit_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_id UUID,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies
CREATE POLICY "Technician/Admin can view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('technician', 'admin'))
    );

CREATE POLICY "System/Users can insert logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);
-- No UPDATE/DELETE policies = Append only
