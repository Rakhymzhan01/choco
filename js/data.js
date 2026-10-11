/* Static seed data: categories, districts, default deals */
const CATEGORIES = [
  { id: 'pools', name: 'Pools', icon: '🏊' },
  { id: 'kids', name: 'Kids', icon: '🎠' },
  { id: 'spa', name: 'Spa & Saunas', icon: '🧖' },
  { id: 'travel', name: 'Travel & Hotels', icon: '🏨' },
  { id: 'fun', name: 'Entertainment', icon: '🎤' },
  { id: 'medical', name: 'Medicine', icon: '🩺' },
  { id: 'sport', name: 'Sport', icon: '🏋️' },
  { id: 'beauty', name: 'Beauty', icon: '💅' },
  { id: 'food', name: 'Food', icon: '🍕' },
  { id: 'services', name: 'Services & Goods', icon: '🛠️' }
];

const DISTRICTS = ['Almaly', 'Auezov', 'Bostandyk', 'Medeu', 'Alatau', 'Zhetysu', 'Turksib', 'Nauryzbay'];

const IMAGE_PRESETS = [
  { file: 'images/deals/deal-01.svg', label: 'Pool' },
  { file: 'images/deals/deal-02.svg', label: 'Trampoline' },
  { file: 'images/deals/deal-03.svg', label: 'Sauna' },
  { file: 'images/deals/deal-04.svg', label: 'Mountain hotel' },
  { file: 'images/deals/deal-05.svg', label: 'Karaoke' },
  { file: 'images/deals/deal-06.svg', label: 'Medical' },
  { file: 'images/deals/deal-07.svg', label: 'Gym' },
  { file: 'images/deals/deal-08.svg', label: 'Beauty' },
  { file: 'images/deals/deal-09.svg', label: 'Pizza' },
  { file: 'images/deals/deal-10.svg', label: 'Car care' },
  { file: 'images/deals/deal-11.svg', label: 'Pottery' },
  { file: 'images/deals/deal-12.svg', label: 'Dentistry' }
];

const DEFAULT_DEALS = [
  {
    id: 1, title: 'Full-day pool pass for adults and kids', merchant: 'Aqua Oasis Pool Club', category: 'pools',
    district: 'Bostandyk', oldPrice: 5000, price: 2500, rating: 4.7, reviews: 312, bought: 1840,
    image: 'images/deals/deal-01.svg', validUntil: '2027-03-31',
    description: 'Spend the whole day at one of the largest swimming complexes in Almaty. The pass includes access to the main 25 m pool, the kids\' pool and the sun terrace.',
    features: ['Access to adult and kids\' pools', 'Free lockers and showers', 'Open daily 08:00 – 22:00', 'Towel rental available on site'],
    conditions: 'One pass per person. Children under 5 enter free with an adult. Swimming caps are mandatory.'
  },
  {
    id: 2, title: 'Trampoline park: 2 hours of jumping', merchant: 'Jump Planet', category: 'kids',
    district: 'Almaly', oldPrice: 4500, price: 2700, rating: 4.5, reviews: 128, bought: 920,
    image: 'images/deals/deal-02.svg', validUntil: '2027-01-31',
    description: 'Two hours of non-stop fun on 60+ connected trampolines, foam pit, dodgeball court and a ninja track. Perfect for kids and teens.',
    features: ['60+ trampolines', 'Foam pit and ninja track', 'Special anti-slip socks included', 'Coach on every zone'],
    conditions: 'Booking 1 day in advance is recommended. Minimum age 4. Parents must sign a waiver.'
  },
  {
    id: 3, title: 'Finnish sauna + hammam for up to 4 people (2 hours)', merchant: 'Steam & Stone Spa', category: 'spa',
    district: 'Auezov', oldPrice: 24000, price: 12000, rating: 4.8, reviews: 204, bought: 640,
    image: 'images/deals/deal-03.svg', validUntil: '2027-02-28',
    description: 'A private spa suite with a Finnish sauna, a Turkish hammam, a plunge pool and a lounge zone with herbal tea.',
    features: ['Private suite for up to 4 guests', 'Finnish sauna + hammam', 'Herbal tea and fruit plate', 'Sheets and slippers included'],
    conditions: 'Advance booking required. Valid Monday – Thursday. Not combinable with other offers.'
  },
  {
    id: 4, title: '3 nights in a mountain-view hotel at Shymbulak', merchant: 'Alpine Lodge', category: 'travel',
    district: 'Medeu', oldPrice: 120000, price: 78000, rating: 4.6, reviews: 87, bought: 210,
    image: 'images/deals/deal-04.svg', validUntil: '2027-04-15',
    description: 'Three relaxing nights for two in a cozy double room with panoramic mountain views, breakfast included, five minutes from the ski lift.',
    features: ['Double room with mountain view', 'Daily breakfast for two', 'Free parking and Wi-Fi', 'Ski storage room'],
    conditions: 'Valid for 2 adults. Subject to availability; not valid on public holidays.'
  },
  {
    id: 5, title: 'Karaoke room for 6 with a snack set (2 hours)', merchant: 'Mic Drop Karaoke', category: 'fun',
    district: 'Zhetysu', oldPrice: 18000, price: 9900, rating: 4.4, reviews: 156, bought: 480,
    image: 'images/deals/deal-05.svg', validUntil: '2027-01-15',
    description: 'A private karaoke room with 50,000+ songs in Kazakh, Russian, English and Korean, a light show and a snack set for the whole group.',
    features: ['Room for up to 6 guests', '50,000+ songs', 'Snack set and soft drinks', 'Professional sound system'],
    conditions: 'Booking required. Valid Sunday – Thursday before 20:00.'
  },
  {
    id: 6, title: 'MRI check: brain + cervical spine', merchant: 'MedScan Clinic', category: 'medical',
    district: 'Alatau', oldPrice: 38000, price: 22800, rating: 4.9, reviews: 342, bought: 1250,
    image: 'images/deals/deal-06.svg', validUntil: '2027-05-31',
    description: 'A 3 Tesla MRI scan of the brain and cervical spine with a radiologist\'s written conclusion and a digital copy of the images.',
    features: ['3 Tesla MRI scanner', 'Radiologist conclusion included', 'Images on disk or by email', 'Results within 24 hours'],
    conditions: 'Appointment required. Bring your ID. Contraindications must be discussed with the doctor.'
  },
  {
    id: 7, title: '1-month gym membership + 2 personal trainings', merchant: 'IronForm Fitness', category: 'sport',
    district: 'Medeu', oldPrice: 30000, price: 15000, rating: 4.6, reviews: 265, bought: 780,
    image: 'images/deals/deal-07.svg', validUntil: '2027-02-15',
    description: 'A full month of unlimited access to the gym and group classes plus two personal sessions with a certified coach.',
    features: ['Unlimited gym access', 'Group classes: yoga, cross-training', '2 personal trainings', 'Locker room and sauna'],
    conditions: 'For new clients only. Membership activates on the first visit within 30 days.'
  },
  {
    id: 8, title: 'Gel manicure + pedicure with coating', merchant: 'Lumiere Beauty Studio', category: 'beauty',
    district: 'Bostandyk', oldPrice: 14000, price: 6900, rating: 4.7, reviews: 410, bought: 2300,
    image: 'images/deals/deal-08.svg', validUntil: '2027-03-15',
    description: 'Hardware manicure and pedicure with premium gel polish, including nail shaping and a hand massage.',
    features: ['Hardware manicure + pedicure', 'Premium gel polish', 'Hand massage', 'Sterile single-use tools'],
    conditions: 'Booking by phone. Nail extensions and removal are charged separately.'
  },
  {
    id: 9, title: 'Set menu: 2 pizzas + 2 drinks', merchant: 'Napoli Corner', category: 'food',
    district: 'Almaly', oldPrice: 11000, price: 5500, rating: 4.3, reviews: 98, bought: 1500,
    image: 'images/deals/deal-09.svg', validUntil: '2027-01-31',
    description: 'Two 32 cm wood-fired pizzas of your choice and two soft drinks or lemonades. Dine in or take away.',
    features: ['2 pizzas of your choice', '2 drinks', 'Wood-fired oven', 'Dine in or takeaway'],
    conditions: 'Valid daily until 17:00. Premium pizzas have a small surcharge.'
  },
  {
    id: 10, title: 'Car interior dry cleaning (sedan or crossover)', merchant: 'CleanDrive Detailing', category: 'services',
    district: 'Turksib', oldPrice: 25000, price: 14900, rating: 4.5, reviews: 73, bought: 390,
    image: 'images/deals/deal-10.svg', validUntil: '2027-04-30',
    description: 'Deep cleaning of seats, carpets, ceiling and plastic with professional extractors, plus an ozone treatment against odors.',
    features: ['Seats, carpets and ceiling', 'Plastic restoration', 'Ozone treatment', 'Takes about 3 hours'],
    conditions: 'Prior appointment required. SUVs and minivans have a 5,000 ₸ surcharge.'
  },
  {
    id: 11, title: 'Pottery masterclass for two with tea', merchant: 'Clay & Co. Studio', category: 'fun',
    district: 'Alatau', oldPrice: 16000, price: 8800, rating: 4.8, reviews: 61, bought: 270,
    image: 'images/deals/deal-11.svg', validUntil: '2027-03-01',
    description: 'A relaxed 2.5 hour masterclass where you will make your own ceramic cup or bowl on the potter\'s wheel, guided by a professional ceramist.',
    features: ['Potter\'s wheel session for 2', 'All materials included', 'Tea and sweets', 'Pieces fired and ready in 2 weeks'],
    conditions: 'Booking 3 days in advance. Minimum age 12.'
  },
  {
    id: 12, title: 'Dental hygiene: ultrasonic cleaning + Air Flow', merchant: 'SmileLab Dentistry', category: 'medical',
    district: 'Auezov', oldPrice: 22000, price: 9900, rating: 4.7, reviews: 289, bought: 1100,
    image: 'images/deals/deal-12.svg', validUntil: '2027-06-30',
    description: 'Professional teeth cleaning with ultrasound and Air Flow, polishing and fluoride coating. Includes a dentist consultation.',
    features: ['Ultrasonic scaling', 'Air Flow stain removal', 'Polishing and fluoride', 'Dentist consultation'],
    conditions: 'One visit per person. Appointment required.'
  }
];
