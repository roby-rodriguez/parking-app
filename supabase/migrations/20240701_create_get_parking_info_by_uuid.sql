-- Create a function to fetch minimal parking info by UUID (public, no auth required)
create or replace function public.get_parking_info_by_uuid(p_uuid uuid)
returns table (
    guest_name text,
    valid_from timestamptz,
    valid_to timestamptz,
    status text,
    gate_name text,
    gate_description text,
    parking_lot_name text,
    parking_lot_apartment text,
    parking_lot_address text
) as $$
begin
    return query
    select
        pa.guest_name,
        pa.valid_from,
        pa.valid_to,
        pa.status,
        g.name,
        g.description,
        pl.name,
        pl.apartment,
        pl.address
    from parking_access pa
    join parking_lots pl on pa.parking_lot_id = pl.id
    join gates g on pl.gate_id = g.id
    where pa.uuid = p_uuid;
end;
$$ language plpgsql security definer;

grant execute on function public.get_parking_info_by_uuid(uuid) to anon, authenticated; 