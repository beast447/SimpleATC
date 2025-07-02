# 🚀 Supabase Setup Guide for SimpleATC

Follow these steps to set up authentication and data persistence for your SimpleATC application.

## 📋 **Prerequisites**

- A working SimpleATC application (you should have this already!)
- A modern web browser
- Internet connection

## 🔧 **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up/Sign in** with GitHub or email
4. **Create a new project:**
   - Organization: Select or create one
   - Project name: `easyatc` (or whatever you prefer)
   - Database password: Create a strong password (save this!)
   - Region: Choose closest to you
   - Click **"Create new project"**

⏱️ *This takes 2-3 minutes to provision*

## 🔑 **Step 2: Get Your API Keys**

1. **In your Supabase dashboard**, go to **Settings** → **API**
2. **Copy these two values:**
   - **Project URL** (looks like `https://your-project-ref.supabase.co`)
   - **anon public key** (long string starting with `eyJ`)

## 🔧 **Step 3: Configure Your App**

### Option A: Create `.env` file (Recommended)
1. **Create a `.env` file** in your project root (same folder as `package.json`)
2. **Add your Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
3. **Replace** the placeholder values with your actual keys

### Option B: Update the config file directly
1. **Open `src/lib/supabase.js`**
2. **Replace the placeholder URLs** with your actual values:
   ```javascript
   const supabaseUrl = 'https://your-project-ref.supabase.co'
   const supabaseAnonKey = 'your_actual_anon_key_here'
   ```

## 🗃️ **Step 4: Set Up Database**

1. **In Supabase dashboard**, go to **SQL Editor**
2. **Click "New Query"**
3. **Copy the entire contents** of `supabase-schema.sql` file
4. **Paste it into the SQL editor**
5. **Click "Run"** to execute

✅ **You should see:** "Success. No rows returned" or similar success message

## ⚙️ **Step 5: Configure Authentication**

1. **In Supabase dashboard**, go to **Authentication** → **Settings**
2. **Site URL Configuration:**
   - Add `http://localhost:3000` to **Site URL**
   - Add `http://localhost:3000/**` to **Redirect URLs**
3. **Email Settings** (optional):
   - Configure email templates under **Auth** → **Templates**
   - For testing, you can use the default settings

## 🧪 **Step 6: Test Your Setup**

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Open your app** at `http://localhost:3000`

3. **Test authentication:**
   - Click **"Sign Up"** 
   - Enter email and password
   - You should see a "Check your email" message
   - Check your email and click the confirmation link
   - Try signing in

4. **Verify database:**
   - In Supabase dashboard, go to **Table Editor**
   - You should see `profiles`, `sessions`, and `attempts` tables
   - After signing up, check the `profiles` table for your new user

## ✅ **What Should Work Now**

- ✅ **User registration and login**
- ✅ **Automatic profile creation**
- ✅ **User menu with profile info**
- ✅ **Session persistence** (stay logged in on refresh)
- ✅ **Secure data isolation** (users only see their own data)

## 🔄 **What Comes Next**

After confirming authentication works, we'll add:
- Progress tracking and statistics
- Session history
- Advanced analytics
- User preferences

## 🚨 **Troubleshooting**

### **Authentication not working?**
- Check your API keys are correct
- Verify Site URL is set to `http://localhost:3000`
- Check browser console for errors

### **Database errors?**
- Ensure all SQL commands ran successfully
- Check Row Level Security is enabled
- Verify table structure in Table Editor

### **Can't see user data?**
- Check that RLS policies are applied
- Verify user is properly authenticated
- Look for errors in browser console

### **Environment variables not loading?**
- Restart your dev server after creating `.env`
- Ensure file is named exactly `.env` (not `.env.txt`)
- Check that variables start with `VITE_`

## 📞 **Need Help?**

If you encounter issues:
1. Check the browser console for error messages
2. Look at the Supabase dashboard logs
3. Verify your configuration matches this guide
4. Try clearing browser cache and localStorage

---

## 🎯 **Next Steps**

Once authentication is working, let me know and we'll proceed to integrate:
- ✅ Data persistence for training sessions
- ✅ Progress tracking and analytics
- ✅ User preferences and settings 