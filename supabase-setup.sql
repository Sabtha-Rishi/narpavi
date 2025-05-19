
-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discounted_price DECIMAL(10, 2),
  image_urls TEXT[] DEFAULT '{}',
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  related_gods TEXT[] DEFAULT '{}',
  occasions TEXT[] DEFAULT '{}',
  material VARCHAR(100) NOT NULL,
  region_of_origin VARCHAR(100),
  artisan VARCHAR(100),
  dimensions VARCHAR(100),
  weight VARCHAR(50),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for search
CREATE INDEX idx_products_search ON products USING GIN (
  to_tsvector('english', name || ' ' || description)
);

-- Create indexes for common filters
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_material ON products(material);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_bestseller ON products(is_bestseller);
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival);

-- Sample data insertion
INSERT INTO products (
  name, 
  description, 
  price, 
  discounted_price, 
  image_urls, 
  category, 
  subcategory,
  related_gods, 
  occasions, 
  material, 
  region_of_origin, 
  artisan, 
  dimensions, 
  weight, 
  stock_quantity, 
  tags,
  is_featured, 
  is_bestseller, 
  is_new_arrival
) VALUES
-- Brass Ganesh Statue
(
  'Brass Ganesh Idol',
  'This intricately designed Ganesh idol is handcrafted by skilled artisans from South India. The brass figure showcases Lord Ganesha seated in a traditional posture, with fine details highlighting his divine attributes. Perfect for home altars and festive occasions.',
  4500,
  3999,
  ARRAY['https://images.unsplash.com/photo-1595954379719-7c179ec58241?q=80&w=500', 'https://images.unsplash.com/photo-1635016288720-c58afbb6ef62?q=80&w=500'],
  'Religious Idols',
  'Deities',
  ARRAY['Ganesha', 'Ganapati'],
  ARRAY['Ganesh Chaturthi', 'Diwali'],
  'Brass',
  'Tamil Nadu',
  'Kumbakonam Artisans',
  '8" x 5" x 4"',
  '1.2 kg',
  5,
  ARRAY['ganesh', 'brass idol', 'home decor', 'pooja'],
  TRUE,
  TRUE,
  FALSE
),

-- Wooden Krishna Statue
(
  'Rosewood Krishna with Flute',
  'This exquisite rosewood carving depicts Lord Krishna playing his divine flute. Each piece is handcrafted by master woodcarvers from Kerala, known for their traditional craftsmanship passed down through generations. The smooth finish and intricate details make this a perfect centerpiece for your home or shrine.',
  7500,
  NULL,
  ARRAY['https://images.unsplash.com/photo-1583089580234-c2189417f425?q=80&w=500', 'https://images.unsplash.com/photo-1620286502191-39d2e6456323?q=80&w=500'],
  'Religious Idols',
  'Deities',
  ARRAY['Krishna', 'Vishnu'],
  ARRAY['Janmashtami', 'Holi'],
  'Wood',
  'Kerala',
  'Malayali Wood Artists',
  '12" x 4" x 3"',
  '0.8 kg',
  3,
  ARRAY['krishna', 'wooden statue', 'flute', 'rosewood'],
  TRUE,
  FALSE,
  TRUE
),

-- Marble Lakshmi
(
  'White Marble Lakshmi Statue',
  'This elegant white marble Lakshmi statue is sculpted from fine Makrana marble by artisans from Jaipur. The goddess of wealth and prosperity is depicted in her classic stance, with beautiful gold-leaf detailing. A perfect addition to your home or office to invite prosperity and good fortune.',
  9999,
  8999,
  ARRAY['https://images.unsplash.com/photo-1600093112291-7b553e3fcb82?q=80&w=500', 'https://images.unsplash.com/photo-1581876802176-2c21dea67fc2?q=80&w=500'],
  'Religious Idols',
  'Deities',
  ARRAY['Lakshmi', 'Mahalakshmi'],
  ARRAY['Diwali', 'Dhanteras'],
  'Marble',
  'Rajasthan',
  'Jaipur Marble Crafters',
  '10" x 6" x 4"',
  '2.5 kg',
  2,
  ARRAY['lakshmi', 'marble statue', 'wealth goddess', 'prosperity'],
  FALSE,
  TRUE,
  FALSE
),

-- Bronze Dancing Shiva
(
  'Bronze Nataraja',
  'This magnificent bronze Nataraja depicts Lord Shiva as the cosmic dancer. Crafted using the traditional lost-wax method by master artisans from Tamil Nadu, this piece showcases the divine dance of creation and destruction. Every detail from the ring of flames to the dwarf of ignorance is perfectly captured.',
  12000,
  NULL,
  ARRAY['https://images.unsplash.com/photo-1604152135912-04a022e73f33?q=80&w=500', 'https://images.unsplash.com/photo-1544030288-e6e6108867e6?q=80&w=500'],
  'Religious Idols',
  'Deities',
  ARRAY['Shiva', 'Nataraja'],
  ARRAY['Shivaratri', 'Kartik Purnima'],
  'Bronze',
  'Tamil Nadu',
  'Swamimalai Bronze Artists',
  '14" x 10" x 4"',
  '3.2 kg',
  1,
  ARRAY['shiva', 'nataraja', 'dancing', 'bronze', 'cosmic dance'],
  TRUE,
  FALSE,
  FALSE
),

-- Clay Diya Set
(
  'Terracotta Diya Set (Set of 12)',
  'This beautiful set of hand-painted terracotta diyas is crafted by women artisans from rural Uttar Pradesh. Each diya is individually shaped and decorated with traditional motifs using natural colors. Perfect for lighting up your home during Diwali or any festive occasion.',
  550,
  499,
  ARRAY['https://images.unsplash.com/photo-1605197004563-00a875fbf608?q=80&w=500', 'https://images.unsplash.com/photo-1604822064782-86c27918c5c4?q=80&w=500'],
  'Festive Decor',
  'Lighting',
  ARRAY[],
  ARRAY['Diwali', 'Karthikai Deepam'],
  'Clay',
  'Uttar Pradesh',
  'Khurja Women Collective',
  '2.5" diameter each',
  '0.8 kg total',
  20,
  ARRAY['diya', 'terracotta', 'festival', 'lighting'],
  FALSE,
  TRUE,
  TRUE
),

-- Brass Bell
(
  'Engraved Temple Bell',
  'This resonant brass temple bell features traditional engravings depicting various deities. Handcrafted by artisans from Maharashtra using centuries-old techniques, it produces a clear, harmonious sound that is believed to ward off negative energies. Perfect for your home temple or as a decorative accent.',
  1200,
  999,
  ARRAY['https://images.unsplash.com/photo-1612528903285-21637b776108?q=80&w=500', 'https://images.unsplash.com/photo-1614004003996-251592ed4cef?q=80&w=500'],
  'Ritual Items',
  'Temple Accessories',
  ARRAY['Vishnu', 'Shiva', 'Ganesha'],
  ARRAY['Daily Puja', 'Navratri'],
  'Brass',
  'Maharashtra',
  'Kolhapur Metal Craftsmen',
  '6" height, 3" diameter',
  '0.7 kg',
  15,
  ARRAY['bell', 'temple', 'ritual', 'brass', 'pooja'],
  TRUE,
  FALSE,
  TRUE
),

-- Silk Wall Hanging
(
  'Handwoven Silk Tapestry - Radha Krishna',
  'This exquisite silk wall hanging depicts the divine love between Radha and Krishna. Masterfully handwoven by artisans from Varanasi using traditional techniques, the piece features fine gold thread work (zari) and vibrant natural dyes. Each tapestry takes over two months to complete.',
  15000,
  13500,
  ARRAY['https://images.unsplash.com/photo-1546760888-eaa55e456e9f?q=80&w=500', 'https://images.unsplash.com/photo-1571843439991-dd2b8e051966?q=80&w=500'],
  'Home Decor',
  'Wall Hangings',
  ARRAY['Krishna', 'Radha'],
  ARRAY['Janmashtami', 'Home Blessing'],
  'Silk',
  'Uttar Pradesh',
  'Banarasi Weavers',
  '36" x 24"',
  '0.3 kg',
  2,
  ARRAY['silk', 'tapestry', 'radha krishna', 'wall hanging', 'banarasi'],
  FALSE,
  TRUE,
  FALSE
),

-- Wooden Chariot
(
  'Miniature Wooden Ratha (Temple Chariot)',
  'This intricately carved wooden temple chariot (ratha) is a miniature replica of the majestic chariots used in South Indian temple festivals. Handcrafted by artisans from Tamil Nadu, each piece features detailed carvings of deities, mythological scenes, and traditional designs. A magnificent showpiece for your home.',
  8500,
  7999,
  ARRAY['https://images.unsplash.com/photo-1621319332247-ce870cdad56c?q=80&w=500', 'https://images.unsplash.com/photo-1605542947005-9fabbbf42c8d?q=80&w=500'],
  'Home Decor',
  'Miniatures',
  ARRAY['Jagannath', 'Vishnu'],
  ARRAY['Ratha Yatra'],
  'Wood',
  'Tamil Nadu',
  'Thanjavur Wood Carvers',
  '15" x 10" x 12"',
  '1.8 kg',
  3,
  ARRAY['chariot', 'ratha', 'temple', 'wooden', 'miniature'],
  TRUE,
  FALSE,
  TRUE
),

-- Silver Pooja Thali
(
  'Silver-plated Pooja Thali Set',
  'This elegant silver-plated pooja thali set includes all essential items for daily rituals. The set features a main plate, small bowls for holy water and kumkum, a bell, a lamp, and a holder for incense sticks. Each piece is carefully crafted by artisans from Delhi with traditional motifs and a durable silver plating.',
  3500,
  2999,
  ARRAY['https://images.unsplash.com/photo-1598797342700-91637e7be397?q=80&w=500', 'https://images.unsplash.com/photo-1598797282599-e899c7ccf976?q=80&w=500'],
  'Ritual Items',
  'Pooja Accessories',
  ARRAY[],
  ARRAY['Daily Puja', 'Navratri', 'Diwali'],
  'Silver-plated Brass',
  'Delhi',
  'Delhi Metal Artisans',
  '12" diameter thali',
  '1.2 kg (full set)',
  10,
  ARRAY['pooja thali', 'silver', 'aarti', 'ritual', 'worship'],
  FALSE,
  TRUE,
  FALSE
),

-- Clay Ganesha
(
  'Eco-friendly Clay Ganesha',
  'This beautiful eco-friendly Ganesha idol is made from natural clay by artisans from Maharashtra. Painted with non-toxic colors, it dissolves completely in water, making it perfect for environmentally-conscious celebrations. The idol features Ganesha in a seated position with traditional symbolic elements.',
  850,
  799,
  ARRAY['https://images.unsplash.com/photo-1598283072194-4cbeb2290fee?q=80&w=500', 'https://images.unsplash.com/photo-1613079900561-9aeb9f3afe1b?q=80&w=500'],
  'Religious Idols',
  'Festival Idols',
  ARRAY['Ganesha', 'Ganapati'],
  ARRAY['Ganesh Chaturthi'],
  'Clay',
  'Maharashtra',
  'Pune Eco-Craftsmen',
  '10" height',
  '1.5 kg',
  25,
  ARRAY['eco-friendly', 'ganesh', 'clay', 'festival', 'sustainable'],
  FALSE,
  FALSE,
  TRUE
),

-- Wooden Wall Panel
(
  'Carved Wooden Dashavatara Panel',
  'This magnificent wooden wall panel depicts the ten avatars (Dashavatara) of Lord Vishnu. Meticulously hand-carved by master craftsmen from Karnataka using traditional techniques, the panel showcases intricate details of each avatar. A stunning piece that adds spiritual significance and artistic beauty to any space.',
  18500,
  16999,
  ARRAY['https://images.unsplash.com/photo-1624728214185-44c8a0e9514b?q=80&w=500', 'https://images.unsplash.com/photo-1618764400608-9e7115edeadc?q=80&w=500'],
  'Home Decor',
  'Wall Panels',
  ARRAY['Vishnu', 'Rama', 'Krishna', 'Narasimha', 'Vamana', 'Matsya', 'Kurma', 'Varaha', 'Parashurama', 'Kalki'],
  ARRAY['Vaishnava Festivals', 'Home Blessing'],
  'Wood',
  'Karnataka',
  'Mysore Wood Carvers',
  '48" x 18" x 2"',
  '4.5 kg',
  1,
  ARRAY['dashavatara', 'wood carving', 'vishnu', 'wall panel', 'religious art'],
  TRUE,
  FALSE,
  FALSE
),

-- Copper Water Pot
(
  'Traditional Copper Water Pot (Tamra Jal)',
  'This handcrafted copper water vessel is made using traditional techniques by artisans from Gujarat. Known for its health benefits, storing water in copper vessels is an ancient Ayurvedic practice. The pot features a tapered design with an etched floral pattern around the rim.',
  1800,
  1599,
  ARRAY['https://images.unsplash.com/photo-1567361672830-f7aa558ec4d3?q=80&w=500', 'https://images.unsplash.com/photo-1551909353-69f3b6c8ec6a?q=80&w=500'],
  'Lifestyle',
  'Kitchen & Dining',
  ARRAY[],
  ARRAY['Daily Use', 'Housewarming'],
  'Copper',
  'Gujarat',
  'Vadodara Metal Craftsmen',
  '10" height, 6" diameter',
  '0.6 kg',
  12,
  ARRAY['copper', 'water', 'ayurveda', 'health', 'traditional'],
  FALSE,
  TRUE,
  TRUE
);

-- Enable Row-Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous reads but requires auth for modifications
CREATE POLICY "Allow anonymous read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON products FOR DELETE USING (auth.role() = 'authenticated');
