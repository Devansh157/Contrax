import os
import csv
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from contracts.models import Contract

User = get_user_model()

class Command(BaseCommand):
    help = "Seed initial users and contracts from CSV files"

    def handle(self, *args, **options):
        users_csv = os.path.join(settings.BASE_DIR.parent, "users_100000.csv")
        contracts_csv = os.path.join(settings.BASE_DIR.parent, "contracts_100000.csv")

        if not os.path.exists(users_csv) or not os.path.exists(contracts_csv):
            self.stdout.write(self.style.ERROR("CSV files not found at workspace root."))
            return

        self.stdout.write("Seeding users...")
        
        seeded_users = []
        with open(users_csv, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            # Read first 150 users
            for i, row in enumerate(reader):
                if i >= 150:
                    break
                username = row['name'].lower().replace(' ', '')
                
                role = 'contractor' if i % 2 == 0 else 'client'
                specialties = [
                    'Deep Cleaning & Housekeeping',
                    'Plumbing Repair & Pipework',
                    'Electrical Repair & Maintenance',
                    'Painting & Wall Finish',
                    'Heavy Cargo & Goods Transport',
                    'HVAC & AC Service',
                    'Pest Control & Fumigation',
                    'Furniture Repair & Carpentry'
                ]
                specialty = random.choice(specialties)
                pic_id = random.randint(1, 70)
                profile_pic = f"https://i.pravatar.cc/150?img={pic_id}"
                
                bios = {
                    'Deep Cleaning & Housekeeping': "Certified expert in residential and commercial deep cleaning, water tank sanitization, and hygiene upkeep.",
                    'Plumbing Repair & Pipework': "Master plumber for high-pressure line repairs, drain unblocking, faucet fitting, and sanitization.",
                    'Electrical Repair & Maintenance': "Expert in electrical diagnostics, switchboard repair, MCB panel wiring, and safety checkups.",
                    'Painting & Wall Finish': "Professional painter specializing in interior emulstion, accent walls, and exterior weatherproofing.",
                    'Heavy Cargo & Goods Transport': "Reliable logistics contractor with tempos and 14-foot trucks for heavy cargo relocation.",
                    'HVAC & AC Service': "AC technician for jet washing, chemical service, gas refills, and compressor troubleshooting.",
                    'Pest Control & Fumigation': "Certified exterminator for anti-termite treatment, cockroach gel baiting, and pest control.",
                    'Furniture Repair & Carpentry': "Skilled carpenter for modular kitchen repairs, custom furniture, and wooden structural fixes."
                }
                bio = bios.get(specialty, "Experienced service provider ready to assist with your requirements.")

                if User.objects.filter(username=username).exists():
                    user = User.objects.get(username=username)
                    if role == 'contractor':
                        user.specialty = specialty
                        user.bio = bio
                        if not user.profile_picture:
                            user.profile_picture = profile_pic
                        user.is_online = True
                        user.save()
                else:
                    # Base coordinates in main Gujarat cities
                    city_coords = {
                        'Ahmedabad': (23.0225, 72.5714),
                        'Vadodara': (22.3072, 73.1812),
                        'Surat': (21.1702, 72.8311),
                        'Rajkot': (22.3039, 70.8022),
                        'Gandhinagar': (23.2156, 72.6369)
                    }
                    city = row.get('city', 'Ahmedabad')
                    base_lat, base_lng = city_coords.get(city, (23.0225, 72.5714))
                    
                    user = User.objects.create_user(
                        username=username,
                        email=row['email'],
                        password='password123',
                        role=role,
                        is_online=True if role == 'contractor' else False,
                        latitude=base_lat + random.uniform(-0.015, 0.015),
                        longitude=base_lng + random.uniform(-0.015, 0.015),
                        wallet_balance=float(random.randint(5000, 25000)),
                        specialty=specialty if role == 'contractor' else None,
                        bio=bio if role == 'contractor' else None,
                        profile_picture=profile_pic if role == 'contractor' else None
                    )

                seeded_users.append(user)

        # Seed Corporate Contractors
        self.stdout.write("Seeding corporate contractors...")
        corporate_contractors = [
            {"username": "Sai_Plumbing_Solutions", "specialty": "maintenance", "bio": "Professional plumbing diagnostics, pipe leakage fixes, and sanitization services.", "pic": "https://i.pravatar.cc/150?img=11"},
            {"username": "A1_Maintenance_Services", "specialty": "maintenance", "bio": "Complete home maintenance, electrical repair, wiring, and urgent utility servicing.", "pic": "https://i.pravatar.cc/150?img=12"},
            {"username": "Prime_Infra_Services", "specialty": "creative", "bio": "Industrial grade painting, creative wall styling, structural renovations, and HVAC setup.", "pic": "https://i.pravatar.cc/150?img=13"},
            {"username": "Raj_Security_Services", "specialty": "legal", "bio": "Security audits, compliance checks, legally certified guard networks, and protection management.", "pic": "https://i.pravatar.cc/150?img=14"},
            {"username": "Om_Furniture_House", "specialty": "maintenance", "bio": "Quality carpentry, wooden structural repair, custom fixtures, and furniture upkeep.", "pic": "https://i.pravatar.cc/150?img=15"},
            {"username": "Eco_Landscape_Services", "specialty": "delivery", "bio": "Eco-friendly landscaping, lawn care, tree grooming, and agricultural supply delivery.", "pic": "https://i.pravatar.cc/150?img=16"},
            {"username": "Bright_Colors_Enterprise", "specialty": "creative", "bio": "Creative graphic arts, customized branding, wallpaper installations, and color consulting.", "pic": "https://i.pravatar.cc/150?img=17"},
            {"username": "Shree_Facility_Services", "specialty": "maintenance", "bio": "Facility management, office upkeep, electrical checkups, and routine sanitization.", "pic": "https://i.pravatar.cc/150?img=18"},
            {"username": "Crystal_Clean_Services", "specialty": "maintenance", "bio": "Deep home cleaning, water tank sanitization, AC servicing, and hygiene maintenance.", "pic": "https://i.pravatar.cc/150?img=19"},
            {"username": "Safe_Pest_Solutions", "specialty": "legal", "bio": "Certified pest control, safety audit compliance, sanitization protocols, and hazard checks.", "pic": "https://i.pravatar.cc/150?img=20"}
        ]
        
        # Base coordinates for Ahmedabad
        base_lat, base_lng = 23.0225, 72.5714
        for cc in corporate_contractors:
            if not User.objects.filter(username=cc["username"]).exists():
                user = User.objects.create_user(
                    username=cc["username"],
                    email=f"{cc['username'].lower()}@example.com",
                    password='password123',
                    role='contractor',
                    is_online=True,
                    latitude=base_lat + random.uniform(-0.015, 0.015),
                    longitude=base_lng + random.uniform(-0.015, 0.015),
                    wallet_balance=float(random.randint(15000, 35000)),
                    specialty=cc["specialty"],
                    bio=cc["bio"],
                    profile_picture=cc["pic"]
                )
                seeded_users.append(user)
            else:
                user = User.objects.get(username=cc["username"])
                user.role = 'contractor'
                user.is_online = True
                user.specialty = cc["specialty"]
                user.bio = cc["bio"]
                user.profile_picture = cc["pic"]
                user.save()
                if user not in seeded_users:
                    seeded_users.append(user)

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(seeded_users)} users."))

        self.stdout.write("Seeding contracts...")
        clients = [u for u in seeded_users if u.role == 'client']
        contractors = [u for u in seeded_users if u.role == 'contractor']
        
        if not clients or not contractors:
            self.stdout.write(self.style.ERROR("Need both seeded clients and contractors."))
            return

        seeded_contracts = 0
        with open(contracts_csv, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 60:
                    break
                client = random.choice(clients)
                
                # Link to the correct corporate contractor matching f"{row['contractor']}"
                csv_contractor = row['contractor'].strip().replace(' ', '_')
                try:
                    contractor = User.objects.get(username=csv_contractor)
                except User.DoesNotExist:
                    contractor = random.choice(contractors)

                
                # Check coordinates mapping
                city_coords = {
                    'Ahmedabad': (23.0225, 72.5714),
                    'Vadodara': (22.3072, 73.1812),
                    'Surat': (21.1702, 72.8311),
                    'Rajkot': (22.3039, 70.8022),
                    'Gandhinagar': (23.2156, 72.6369)
                }
                base_lat, base_lng = city_coords.get(random.choice(list(city_coords.keys())), (23.0225, 72.5714))
                
                # Map status choices
                csv_status = row['status']
                mapped_status = 'approved'
                if csv_status == 'Active':
                    mapped_status = 'active'
                elif csv_status == 'Terminated':
                    mapped_status = 'cancelled'
                elif csv_status == 'Expired':
                    mapped_status = 'cancelled'
                elif csv_status == 'Completed':
                    mapped_status = 'approved'

                terms = f"AGREEMENT FOR {row['service_type'].upper()} SERVICES\n-----------------------------\nThis contract is seeded from CSV history."
                
                Contract.objects.create(
                    client=client,
                    contractor=contractor,
                    title=f"{row['service_type']} job #{row['contract_id']}",
                    description=f"Seeded historical {row['service_type'].lower()} task. Double digital signature simulated.",
                    category='delivery' if row['service_type'] in ['Courier', 'Delivery', 'Landscaping'] else 'maintenance',
                    budget=float(random.randint(400, 4500)),
                    status=mapped_status,
                    terms_text=terms,
                    job_latitude=base_lat,
                    job_longitude=base_lng,
                    contractor_latitude=base_lat + random.uniform(-0.01, 0.01),
                    contractor_longitude=base_lng + random.uniform(-0.01, 0.01),
                )
                seeded_contracts += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {seeded_contracts} contracts."))
