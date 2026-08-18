import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

contractors = User.objects.filter(role='contractor')
print(f"Total contractors found: {contractors.count()}")

# Expanded specialty mapping to ensure multiple dedicated specialists per domain
spec_map = {
    # Landscaping Specialists
    'Eco_Landscape_Services': ('Landscaping & Garden', 'Eco-friendly landscaping, lawn grass mowing, tree grooming, and agricultural supply transport.'),
    'mehuldesai': ('Landscaping & Garden', 'Landscape architect specializing in lawn maintenance, turf installation, and garden design.'),
    'nehajoshi': ('Landscaping & Garden', 'Professional gardener for ornamental plant landscaping, soil fertilization, and lawn trimming.'),
    'harshchauhan': ('Landscaping & Garden', 'Certified garden contractor for residential lawn care and tree branch pruning.'),

    # Cleaning Specialists
    'Crystal_Clean_Services': ('Deep Cleaning & Housekeeping', 'Certified expert in home deep cleaning, water tank sanitization, AC chemical wash, and housekeeping.'),
    'ananyaparmar': ('Deep Cleaning & Housekeeping', 'Specializes in residential and commercial deep cleaning, post-construction cleanup, and hygiene maintenance.'),
    'poojadesai': ('Deep Cleaning & Housekeeping', 'Deep cleaning specialist for kitchen sanitization, sofa shampooing, and post-renovation cleanup.'),
    'harshmehta': ('Deep Cleaning & Housekeeping', 'Residential house cleaning helper, floor polishing, and bathroom deep scrubbing.'),
    'priyamodi': ('Deep Cleaning & Housekeeping', 'Commercial office deep cleaning and janitorial maintenance contractor.'),

    # Plumbing Specialists
    'Sai_Plumbing_Solutions': ('Plumbing Repair & Pipework', 'Professional plumbing diagnostics, pipe leakage fixes, bathroom fittings, and sanitization services.'),
    'rajpatel': ('Plumbing Repair & Pipework', 'Master plumber for high-pressure line repairs, drain unblocking, and faucet installations.'),
    'amitjoshi': ('Plumbing Repair & Pipework', 'Certified plumber for sanitaryware fitting, pipeline burst repairs, and geyser plumbing.'),
    'krishnaparmar': ('Plumbing Repair & Pipework', 'Residential plumber for faucet replacement, toilet clog clearance, and main line inspection.'),

    # Electrical Specialists
    'A1_Maintenance_Services': ('Electrical Repair & Maintenance', 'Complete home maintenance, MCB panel repair, three-phase wiring, and urgent utility servicing.'),
    'devchauhan': ('Electrical Repair & Maintenance', 'Expert in electrical diagnostics, switchboard repair, MCB tripping fixes, and wiring.'),
    'aaravmodi': ('Electrical Repair & Maintenance', 'Licensed electrician for residential wiring, fan & light installation, and panel maintenance.'),
    'niravmehta': ('Electrical Repair & Maintenance', 'Industrial three-phase electrician and main meter safety audit specialist.'),

    # Cargo & Logistics Specialists
    'aviamipara': ('Heavy Cargo & Goods Transport', 'On-demand goods transport, 14-foot truck logistics, industrial machinery relocation, and cargo safety.'),
    'karanshah': ('Heavy Cargo & Goods Transport', 'Heavy duty container flatbed transport, tempo loader, and warehouse inventory shipping.'),
    'devshah': ('Heavy Cargo & Goods Transport', 'Commercial cargo shipping, home relocation tempo, and loading helper service.'),
    'amitchauhan': ('Heavy Cargo & Goods Transport', '3-wheeler tempo logistics and glass/fragile item safe transit.'),

    # Painting Specialists
    'Prime_Infra_Services': ('Painting & Wall Finish', 'Industrial grade painting, creative wall styling, exterior waterproofing, and structural renovations.'),
    'rajmodi': ('Painting & Wall Finish', 'Full interior house painter, wall putty repair, and washable emulsion specialist.'),
    'riyapatel': ('Painting & Wall Finish', 'Exterior facade painter, waterproofing putty, and accent feature wall designer.'),
    'Bright_Colors_Enterprise': ('Painting & Wall Finish', 'Creative graphic arts, customized wall styling, texture painting, and wallpaper installation.'),

    # HVAC & AC Specialists
    'snehajoshi': ('HVAC & AC Repair', 'AC technician specializing in high-pressure jet chemical wash, gas refill, and compressor repair.'),
    'vivaanprajapati': ('HVAC & AC Repair', 'Split and window air conditioner uninstallation, re-installation, and ductable HVAC servicing.'),
    'nehachauhan': ('HVAC & AC Repair', 'HVAC maintenance expert for central AC systems, filter cleaning, and leak testing.'),

    # Pest Control Specialists
    'Safe_Pest_Solutions': ('Pest Control & Fumigation', 'Certified pest control, termite anti-wood treatment, cockroach gel baiting, and safety audit compliance.'),
    'yashmehta': ('Pest Control & Fumigation', 'Eco-friendly pest exterminator for termites, bed bug heat treatment, and rodent trapping.'),
    'priyadesai': ('Pest Control & Fumigation', 'Herbal & odorless eco-spray pest control for homes and commercial offices.'),

    # Furniture & Carpentry Specialists
    'Om_Furniture_House': ('Furniture Repair & Carpentry', 'Quality carpentry, modular kitchen cabinets, wooden structural repair, and furniture upkeep.'),
    'riyadesai': ('Furniture Repair & Carpentry', 'Custom woodwork, door hydraulic lock alignment, and sofa frame repairs.'),
    'mehulprajapati': ('Furniture Repair & Carpentry', 'Plywood cabinet maker, wooden table polishing, and furniture hardware fitting.'),

    # Security & Safety Specialists
    'Raj_Security_Services': ('Security & Safety', 'Security audits, compliance checks, legally certified guard networks, and protection management.'),
    'shree_security': ('Security & Safety', 'Event protection security guards, commercial property surveillance, and safety audit compliance.'),

    # Web & Software Development
    'web_dev_pro': ('Web & Software Development', 'Full stack web developer, React & Python backend integration, and mobile app developer.')
}

# Domain pool list for balanced fallback assignment
domain_pool = [
    ('Landscaping & Garden', 'Landscape architect specializing in lawn maintenance, turf installation, and garden design.'),
    ('Deep Cleaning & Housekeeping', 'Certified expert in home deep cleaning, water tank sanitization, and housekeeping.'),
    ('Plumbing Repair & Pipework', 'Master plumber for high-pressure line repairs, drain unblocking, and faucet fitting.'),
    ('Electrical Repair & Maintenance', 'Expert in electrical diagnostics, switchboard repair, MCB panel wiring, and safety.'),
    ('Heavy Cargo & Goods Transport', 'Reliable transport contractor with 14-foot trucks for heavy cargo relocation.'),
    ('Painting & Wall Finish', 'Professional interior and exterior painter with premium finishes and wall putty.'),
    ('HVAC & AC Repair', 'AC technician for jet washing, chemical service, gas refills, and compressor troubleshooting.'),
    ('Pest Control & Fumigation', 'Certified exterminator for anti-termite treatment, cockroach gel baiting, and pest control.'),
    ('Furniture Repair & Carpentry', 'Skilled carpenter for modular kitchen repairs, custom furniture, and wooden structural fixes.'),
    ('Security & Safety', 'Certified security guard network, event safety protection, and hazard compliance audit.'),
    ('Graphic Design & Creative', 'Freelance graphic artist specializing in logo design, UI/UX branding, and visuals.'),
    ('Web & Software Development', 'Full stack software engineer specializing in React, Next.js, and REST APIs.'),
    ('Courier & Express Transit', 'Express parcel delivery helper for urgent document and package transit.'),
    ('Water Tank Cleaning', 'High-pressure jet wash and UV antibacterial sanitization for water tanks.'),
    ('Legal & Advisory', 'Legal agreement drafting consultant for NDAs, SLA contracts, and compliance.')
]

updated_count = 0
for pro in contractors:
    if pro.username in spec_map:
        pro.specialty, pro.bio = spec_map[pro.username]
        pro.save()
        updated_count += 1
    else:
        chosen_spec, chosen_bio = domain_pool[pro.id % len(domain_pool)]
        pro.specialty = chosen_spec
        pro.bio = chosen_bio
        pro.save()
        updated_count += 1

print(f"Successfully updated all {updated_count} contractors with dedicated domain specialties.")
