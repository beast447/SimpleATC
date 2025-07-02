import { supabase } from '../lib/supabase';

const MAX_ATTEMPTS = 500;

export const aiUsageService = {
  async getRemaining(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('ai_attempts')
      .eq('id', userId)
      .single();
    if (error || !data) {
      console.error('Error fetching ai_attempts:', error);
      return MAX_ATTEMPTS; // fail-open
    }
    return Math.max(0, MAX_ATTEMPTS - (data.ai_attempts || 0));
  },

  async increment(userId) {
    const { data, error } = await supabase.rpc('increment_ai_attempts', { uid: userId, inc: 1 });
    if (error) {
      // Fallback slow update
      await supabase
        .from('profiles')
        .update({ ai_attempts: supabase.raw('ai_attempts + 1') })
        .eq('id', userId);
    }
    return true;
  },

  async reset(userId) {
    await supabase.from('profiles').update({ ai_attempts: 0 }).eq('id', userId);
  },

  MAX_ATTEMPTS
}; 