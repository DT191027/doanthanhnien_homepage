-- =========================================================================
-- BẢN SQL FULL HOÀN CHỈNH VÀ CHẶT CHẼ DÙNG TRỰC TIẾP TRÊN SUPABASE
-- Dự án Supabase: https://czfoyfbmceupwusipvul.supabase.co
-- Hỗ trợ đầy đủ: Quản lý Tin tức (news_posts) & Khen thưởng (commendations)
-- =========================================================================

-- 1. BẢNG TIN TỨC - SỰ KIỆN (news_posts)
CREATE TABLE IF NOT EXISTS public.news_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'Hoạt động Tình nguyện',
  author TEXT DEFAULT 'Đoàn Xã Xuân Thới Sơn',
  fb_link TEXT,
  image_url TEXT,
  views INT DEFAULT 1,
  is_featured BOOLEAN DEFAULT false,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BẢNG KHEN THƯỞNG & DANH HIỆU THI ĐUA (commendations)
CREATE TABLE IF NOT EXISTS public.commendations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  issuing_body TEXT NOT NULL,
  year TEXT NOT NULL DEFAULT '2026',
  certificate_no TEXT,
  summary TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'danh-hieu', -- 'danh-hieu', 'cap-tren', 'thanh-nien-tieu-bieu'
  badge_color TEXT DEFAULT '#0056B3',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BẢNG TÀI KHOẢN ADMIN ĐOÀN XÃ (admin_users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin_doanxa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- BẬT ROW LEVEL SECURITY (RLS) & CẤP QUYỀN ĐỌC / GHI / XÓA CÔNG KHAI
-- =========================================================================

-- Kích hoạt RLS
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Xóa sạch chính sách cũ nếu đã có (Tránh lỗi 42710 Policy Already Exists)
DROP POLICY IF EXISTS "Allow public read access to news_posts" ON public.news_posts;
DROP POLICY IF EXISTS "Allow public insert to news_posts" ON public.news_posts;
DROP POLICY IF EXISTS "Allow public delete from news_posts" ON public.news_posts;
DROP POLICY IF EXISTS "Allow public read to news_posts" ON public.news_posts;
DROP POLICY IF EXISTS "Allow public insert to news_posts" ON public.news_posts;
DROP POLICY IF EXISTS "Allow public delete to news_posts" ON public.news_posts;
DROP POLICY IF EXISTS "Allow public select" ON public.news_posts;
DROP POLICY IF EXISTS "Allow public insert" ON public.news_posts;
DROP POLICY IF EXISTS "Allow public delete" ON public.news_posts;

DROP POLICY IF EXISTS "Allow public select commendations" ON public.commendations;
DROP POLICY IF EXISTS "Allow public insert commendations" ON public.commendations;
DROP POLICY IF EXISTS "Allow public delete commendations" ON public.commendations;

DROP POLICY IF EXISTS "Allow public read admin_users" ON public.admin_users;

-- Tạo lại các chính sách bảo mật & truy cập công khai
CREATE POLICY "Allow public select" ON public.news_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.news_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.news_posts FOR DELETE USING (true);

CREATE POLICY "Allow public select commendations" ON public.commendations FOR SELECT USING (true);
CREATE POLICY "Allow public insert commendations" ON public.commendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete commendations" ON public.commendations FOR DELETE USING (true);

CREATE POLICY "Allow public read admin_users" ON public.admin_users FOR SELECT USING (true);

-- Khởi tạo thông tin Admin mặc định
INSERT INTO public.admin_users (username, email, role)
VALUES ('doanxaxuanthoison', 'dtnxts2026@gmail.com', 'admin_doanxa')
ON CONFLICT (username) DO NOTHING;
