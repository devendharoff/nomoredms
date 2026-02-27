-- ==========================================
-- NOMOREDMS: DATA INTEGRITY & AUDIT SYSTEM
-- Goal: Automated tracking of administrative changes
-- ==========================================

-- 1. TRIGGER FUNCTION FOR AUDITING
create or replace function public.audit_resource_changes()
returns trigger as $$
declare
    admin_id uuid;
begin
    -- Try to get the current user ID
    admin_id := auth.uid();
    
    -- Only log if we have a user (admins making changes)
    if admin_id is not null then
        if (tg_op = 'UPDATE') then
            insert into public.admin_audit_log (admin_id, action, table_name, record_id, payload)
            values (admin_id, 'UPDATE', tg_table_name::text, new.id, jsonb_build_object('old', row_to_json(old), 'new', row_to_json(new)));
            return new;
        elsif (tg_op = 'INSERT') then
            insert into public.admin_audit_log (admin_id, action, table_name, record_id, payload)
            values (admin_id, 'INSERT', tg_table_name::text, new.id, row_to_json(new)::jsonb);
            return new;
        elsif (tg_op = 'DELETE') then
            insert into public.admin_audit_log (admin_id, action, table_name, record_id, payload)
            values (admin_id, 'DELETE', tg_table_name::text, old.id, row_to_json(old)::jsonb);
            return old;
        end if;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- 2. APPLY TRIGGERS
drop trigger if exists on_resource_change on public.resources;
create trigger on_resource_change
    after insert or update or delete on public.resources
    for each row execute procedure public.audit_resource_changes();

drop trigger if exists on_creator_change on public.creators;
create trigger on_creator_change
    after insert or update or delete on public.creators
    for each row execute procedure public.audit_resource_changes();
