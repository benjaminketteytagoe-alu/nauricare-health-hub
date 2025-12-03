-- Create pharmacies table
CREATE TABLE public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create drugs table
CREATE TABLE public.drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pharmacy_inventory table for stock tracking
CREATE TABLE public.pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE NOT NULL,
  drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price_rwf INTEGER,
  in_stock BOOLEAN GENERATED ALWAYS AS (quantity > 0) STORED,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pharmacy_id, drug_id)
);

-- Enable RLS
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Everyone can view pharmacies" ON public.pharmacies FOR SELECT USING (true);
CREATE POLICY "Everyone can view drugs" ON public.drugs FOR SELECT USING (true);
CREATE POLICY "Everyone can view inventory" ON public.pharmacy_inventory FOR SELECT USING (true);

-- Admin management policies
CREATE POLICY "Admins can manage pharmacies" ON public.pharmacies FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage drugs" ON public.drugs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage inventory" ON public.pharmacy_inventory FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for inventory
ALTER TABLE public.pharmacy_inventory REPLICA IDENTITY FULL;

-- Trigger for updated_at
CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON public.pharmacies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.pharmacy_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed initial pharmacies
INSERT INTO public.pharmacies (name, location, phone, hours, latitude, longitude) VALUES
  ('Kigali Pharmacy', 'KN 3 Ave, Kigali', '+250 788 123 456', '8:00 AM - 9:00 PM', -1.9403, 30.0587),
  ('Nyamirambo Pharmacy', 'KN 72 St, Nyamirambo', '+250 788 234 567', '7:30 AM - 8:00 PM', -1.9756, 30.0453),
  ('Remera Health Pharmacy', 'KG 11 Ave, Remera', '+250 788 345 678', '8:00 AM - 10:00 PM', -1.9567, 30.1127),
  ('Muhima Pharmacy Plus', 'KN 4 Ave, Muhima', '+250 788 456 789', '7:00 AM - 9:00 PM', -1.9489, 30.0522),
  ('Kimironko Wellness Pharmacy', 'KG 549 St, Kimironko', '+250 788 567 890', '8:00 AM - 8:00 PM', -1.9389, 30.1289);

-- Seed initial drugs
INSERT INTO public.drugs (name, category, description) VALUES
  ('Metformin', 'PCOS Treatment', 'Helps regulate blood sugar and insulin levels'),
  ('Clomiphene', 'Fertility', 'Induces ovulation in women with PCOS'),
  ('Spironolactone', 'Hormone Therapy', 'Reduces excess androgen levels'),
  ('Letrozole', 'Fertility', 'Alternative fertility medication'),
  ('Progesterone', 'Hormone Therapy', 'Hormone supplement for menstrual regulation'),
  ('Oral Contraceptives', 'Hormone Therapy', 'Regulates menstrual cycles'),
  ('Ibuprofen', 'Pain Relief', 'Anti-inflammatory for menstrual pain'),
  ('Paracetamol', 'Pain Relief', 'General pain relief'),
  ('Naproxen', 'Pain Relief', 'Anti-inflammatory medication'),
  ('Iron Supplements', 'Supplements', 'For anemia from heavy bleeding'),
  ('Folic Acid', 'Supplements', 'Essential prenatal vitamin'),
  ('Vitamin D', 'Supplements', 'Supports bone and hormone health'),
  ('Inositol', 'Supplements', 'Natural PCOS support'),
  ('Tranexamic Acid', 'Fibroid Treatment', 'Reduces heavy menstrual bleeding'),
  ('Ulipristal', 'Fibroid Treatment', 'Shrinks fibroids'),
  ('GnRH Agonists', 'Fibroid Treatment', 'Reduces fibroid size'),
  ('Mefenamic Acid', 'Pain Relief', 'For menstrual cramps');

-- Seed inventory with random stock levels
INSERT INTO public.pharmacy_inventory (pharmacy_id, drug_id, quantity, price_rwf)
SELECT p.id, d.id, floor(random() * 50)::int, floor(random() * 5000 + 1000)::int
FROM public.pharmacies p
CROSS JOIN public.drugs d
WHERE random() > 0.3;