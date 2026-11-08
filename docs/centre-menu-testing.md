# Centre Menu Testing URLs

These URLs use active centre slugs returned by the connected Supabase database on 2026-11-04. Check the `restaurants` table for current slugs if centres change.

The QR codes link directly to a centre menu and include that table's `hawker_tables.id`. Diners open the URL using the iPhone camera; there is no in-app QR scanner. Menu and order routes require a real table UUID and verify it belongs to the centre in the URL.

## Verified test link

A `Docs QR Test` table was added to the live `888-restoran` centre so this is a real, UUID-valid link:

<http://localhost:3000/888-restoran/menu?table_id=8d33c948-ba43-4ee3-984a-2acef1af8248>

Other active centre slugs are `lim-s-foodcourt`, `s`, and `the-chemist-dough`. Their menu links need a table UUID belonging to the respective centre; generate one in **Shop Owner → Table Management**. The menu's order link keeps the same `table_id` and centre slug.
